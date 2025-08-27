document.addEventListener('DOMContentLoaded', () => {

    const palette = document.getElementById('palette');
    const stage = document.getElementById('stage');
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const colors = Array.from({length: 11}, (_, i) => `color-${i + 1}`);

    let draggedElement = null;

    const PHONETIC_SOUNDS = {
        'a': 'a', 'e': 'e', 'i': 'i', 'o': 'o', 'u': 'u', 'y': 'i', 'b': 'be', 'c': 'ke', 'd': 'de', 'f': 'fe', 'g': 'ge', 'h': 'ache', 'j': 'je', 'k': 'ke', 'l': 'le', 'm': 'me', 'n': 'ne', 'p': 'pe', 'q': 'ke', 'r': 're', 's': 'se', 't': 'te', 'v': 've', 'w': 'we', 'x': 'kse', 'z': 'ze'
    };

    const FRENCH_SYLLABLES = {
        'ba': 'ba', 'ca': 'ka', 'da': 'da', 'fa': 'fa', 'ga': 'ga', 'ha': 'a', 'ja': 'ja', 'ka': 'ka', 'la': 'la', 'ma': 'ma', 'na': 'na', 'pa': 'pa', 'ra': 'ra', 'sa': 'sa', 'ta': 'ta', 'va': 'va', 'wa': 'wa', 'za': 'za', 'le': 'le',
        'be': 'be', 'ce': 'se', 'de': 'de', 'fe': 'fe', 'ge': 'je', 'he': 'e', 'je': 'je', 'ke': 'ke', 'me': 'me', 'ne': 'ne', 'pe': 'pe', 're': 're', 'se': 'se', 'te': 'te', 've': 've', 'ze': 'ze',
        'bi': 'bi', 'ci': 'si', 'di': 'di', 'fi': 'fi', 'gi': 'ji', 'hi': 'i', 'ji': 'ji', 'ki': 'ki', 'li': 'li', 'mi': 'mi', 'ni': 'ni', 'pi': 'pi', 'ri': 'ri', 'si': 'si', 'ti': 'ti', 'vi': 'vi', 'zi': 'zi',
        'bo': 'bo', 'co': 'ko', 'do': 'do', 'fo': 'fo', 'go': 'go', 'ho': 'o', 'jo': 'jo', 'ko': 'ko', 'lo': 'lo', 'mo': 'mo', 'no': 'no', 'po': 'po', 'ro': 'ro', 'so': 'so', 'to': 'to', 'vo': 'vo', 'zo': 'zo',
        'bu': 'bu', 'cu': 'ku', 'du': 'du', 'fu': 'fu', 'gu': 'gu', 'hu': 'u', 'ju': 'ju', 'ku': 'ku', 'lu': 'lu', 'mu': 'mu', 'nu': 'nu', 'pu': 'pu', 'ru': 'ru', 'su': 'su', 'tu': 'tu', 'vu': 'vu', 'zu': 'zu',
        'man': 'man', 'mon': 'mon', 'men': 'men', 'dan': 'dan', 'don': 'don', 'den': 'den', 'lan': 'lan', 'lon': 'lon', 'len': 'len', 'pas': 'pas', 'par': 'par', 'sol': 'sol', 'sur': 'sur', 'fin': 'fin', 'fon': 'fon', 'fil': 'fil', 'jar': 'jar', 'din': 'din', 'sac': 'sac', 'lac': 'lac'
    };

    const WORDS = { 'maman': 'maman', 'jardin': 'jardin' };

    const createLetterPalette = () => {
        alphabet.forEach(letter => {
            const charEl = document.createElement('div');
            charEl.className = 'letter-character';
            charEl.classList.add(colors[Math.floor(Math.random() * colors.length)]);
            charEl.textContent = letter.toUpperCase();
            charEl.draggable = true;
            charEl.id = `palette-${letter}`;
            charEl.dataset.letter = letter;
            palette.appendChild(charEl);
        });
    };

    const audioCache = {};
    const speakPhonetic = (soundName) => {
        if (!soundName) return;
        if (audioCache[soundName]) {
            audioCache[soundName].currentTime = 0;
            audioCache[soundName].play();
        } else {
            const audio = new Audio(`/sounds/${soundName}.mp3`);
            audioCache[soundName] = audio;
            audio.play().catch(error => console.error(`Could not play sound: ${soundName}`, error));
        }
    };

    const triggerGroupAnimation = (group) => {
        group.classList.add('pulse');
        setTimeout(() => group.classList.remove('pulse'), 1000);
    };

    const createSyllableGroup = (elements, syllable, position) => {
        const group = document.createElement('div');
        group.className = 'syllable-group';
        group.dataset.syllable = syllable;
        group.style.position = 'absolute';
        group.style.left = `${position.x}px`;
        group.style.top = `${position.y}px`;
        group.draggable = true;
        group.id = `syllable-${Date.now()}`;
        group.style.display = 'inline-flex';
        elements.forEach(el => {
            el.style.position = 'static';
            el.draggable = false;
            el.classList.add('in-group');
            group.appendChild(el);
        });
        stage.appendChild(group);
        return group;
    };

    const getDistance = (elem1, elem2) => {
        const rect1 = elem1.getBoundingClientRect();
        const rect2 = elem2.getBoundingClientRect();
        const dx = (rect1.left + rect1.width / 2) - (rect2.left + rect2.width / 2);
        const dy = (rect1.top + rect1.height / 2) - (rect2.top + rect2.height / 2);
        return Math.sqrt(dx * dx + dy * dy);
    };

    const checkSyllableFormation = (droppedElement) => {
        console.log(`--- Checking combinations for dropped: ${droppedElement.dataset.letter} ---`);
        const allSingleLetters = Array.from(stage.querySelectorAll('.letter-character:not(.in-group)'));
        console.log('Available single letters:', allSingleLetters.map(el => el.dataset.letter));

        // 1. Try direct 3-letter CVC
        console.log('Checking for 3-letter combinations...');
        if (allSingleLetters.length >= 3) {
            const otherLetters = allSingleLetters.filter(el => el.id !== droppedElement.id);
            for (let i = 0; i < otherLetters.length; i++) {
                for (let j = i + 1; j < otherLetters.length; j++) {
                    const letterA = otherLetters[i];
                    const letterB = otherLetters[j];
                    if (getDistance(droppedElement, letterA) < 120 && getDistance(droppedElement, letterB) < 120 && getDistance(letterA, letterB) < 120) {
                        const triplet = [droppedElement, letterA, letterB].sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
                        const syllable = triplet.map(el => el.dataset.letter).join('');
                        console.log('Testing 3-letter combo:', syllable);
                        if (FRENCH_SYLLABLES[syllable]) {
                            console.log(`SUCCESS: Found 3-letter syllable: ${syllable}`);
                            const group = createSyllableGroup(triplet, syllable, { x: triplet[0].offsetLeft, y: triplet[0].offsetTop });
                            triggerGroupAnimation(group);
                            speakPhonetic(syllable);
                            setTimeout(() => speakPhonetic('bravo'), 800);
                            return true;
                        }
                    }
                }
            }
        }

        // 2. Try sequential CVC (append to CV group)
        console.log('Checking for sequential 3-letter combinations...');
        const syllableGroups = Array.from(stage.querySelectorAll('.syllable-group'));
        console.log(`Found ${syllableGroups.length} syllable groups on stage.`);
        for (const group of syllableGroups) {
            console.log(`Checking group: ${group.dataset.syllable}`);
            if (getDistance(droppedElement, group) < 200) { // Increased distance threshold
                const groupSyllable = group.dataset.syllable;
                const droppedLetter = droppedElement.dataset.letter;
                console.log(`Testing adding '${droppedLetter}' to group '${groupSyllable}'`);

                const newSyllableRight = groupSyllable + droppedLetter;
                if (FRENCH_SYLLABLES[newSyllableRight]) {
                    console.log(`SUCCESS: Found sequential syllable: ${newSyllableRight}`);
                    group.appendChild(droppedElement);
                    group.dataset.syllable = newSyllableRight;
                    triggerGroupAnimation(group);
                    speakPhonetic(newSyllableRight);
                    setTimeout(() => speakPhonetic('bravo'), 800);
                    return true;
                }
                const newSyllableLeft = droppedLetter + groupSyllable;
                 if (FRENCH_SYLLABLES[newSyllableLeft]) {
                    console.log(`SUCCESS: Found sequential syllable: ${newSyllableLeft}`);
                    group.insertBefore(droppedElement, group.firstChild);
                    group.dataset.syllable = newSyllableLeft;
                    triggerGroupAnimation(group);
                    speakPhonetic(newSyllableLeft);
                    setTimeout(() => speakPhonetic('bravo'), 800);
                    return true;
                }
            }
        }

        // 3. Try 2-letter CV
        console.log('Checking for 2-letter combinations...');
        for (const staticLetter of allSingleLetters.filter(el => el.id !== droppedElement.id)) {
            if (getDistance(droppedElement, staticLetter) < 120) {
                const pair = [staticLetter, droppedElement].sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
                const syllable = pair.map(el => el.dataset.letter).join('');
                console.log('Testing 2-letter combo:', syllable);
                if (FRENCH_SYLLABLES[syllable]) {
                    console.log(`SUCCESS: Found 2-letter syllable: ${syllable}`);
                    const group = createSyllableGroup(pair, syllable, { x: pair[0].offsetLeft, y: pair[0].offsetTop });
                    triggerGroupAnimation(group);
                    speakPhonetic(syllable);
                    setTimeout(() => speakPhonetic('bravo'), 800);
                    return true;
                }
            }
        }
        console.log('--- No combination found ---');
        return false;
    };

    const checkWordFormation = (droppedGroup) => {
        const droppedSyllable = droppedGroup.dataset.syllable;
        const stageElements = Array.from(stage.querySelectorAll('.syllable-group'));
        for (const group of stageElements) {
            if (group.id === droppedGroup.id) continue;
            if (getDistance(droppedGroup, group) < 150) {
                const pair = [group, droppedGroup].sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
                const word = pair.map(el => el.dataset.syllable).join('');
                if (WORDS[word]) {
                    const allLetters = [...pair[0].children, ...pair[1].children];
                    const newPosition = { x: pair[0].offsetLeft, y: pair[0].offsetTop };
                    const newWordGroup = createSyllableGroup(allLetters, word, newPosition);
                    newWordGroup.classList.add('word-group');
                    stage.removeChild(pair[0]);
                    stage.removeChild(pair[1]);
                    speakPhonetic(word);
                    triggerGroupAnimation(newWordGroup);
                    setTimeout(() => speakPhonetic('bravo'), 800);
                    return true;
                }
            }
        }
        return false;
    };

    document.addEventListener('dragstart', (event) => {
        const target = event.target;
        if (target.classList.contains('letter-character') || target.classList.contains('syllable-group')) {
            draggedElement = target;
            setTimeout(() => target.classList.add('dragging'), 0);
        }
    });

    document.addEventListener('dragend', () => {
        if (draggedElement) draggedElement.classList.remove('dragging');
        draggedElement = null;
    });

    stage.addEventListener('dragover', (event) => event.preventDefault());

    stage.addEventListener('drop', (event) => {
        event.preventDefault();
        if (!draggedElement) return;

        const isFromPalette = draggedElement.id.startsWith('palette-');
        let elementToDrop = draggedElement;

        if (isFromPalette) {
            elementToDrop = draggedElement.cloneNode(true);
            elementToDrop.id = `stage-${Date.now()}`;
            elementToDrop.dataset.letter = draggedElement.dataset.letter;
            stage.appendChild(elementToDrop);
        } else if (elementToDrop.classList.contains('letter-character') && elementToDrop.closest('.syllable-group')) {
            // Logic to break up a group
            const parentGroup = elementToDrop.closest('.syllable-group');
            const letters = Array.from(parentGroup.children);
            const groupRect = parentGroup.getBoundingClientRect();
            stage.removeChild(parentGroup);
            letters.forEach((letter, index) => {
                letter.classList.remove('in-group');
                letter.style.position = 'absolute';
                letter.style.left = `${groupRect.left - stage.getBoundingClientRect().left + (index * 40)}px`;
                letter.style.top = `${groupRect.top - stage.getBoundingClientRect().top}px`;
                stage.appendChild(letter);
            });
        }

        const stageRect = stage.getBoundingClientRect();
        elementToDrop.style.position = 'absolute';
        elementToDrop.style.left = `${event.clientX - stageRect.left - elementToDrop.offsetWidth / 2}px`;
        elementToDrop.style.top = `${event.clientY - stageRect.top - elementToDrop.offsetHeight / 2}px`;

        // Use a timeout to ensure the DOM is updated before checking for combinations
        setTimeout(() => {
            if (elementToDrop.classList.contains('syllable-group')) {
                checkWordFormation(elementToDrop);
            } else if (elementToDrop.classList.contains('letter-character')) {
                checkSyllableFormation(elementToDrop);
            }
        }, 300);

        const instructions = stage.querySelector('.instructions');
        if (instructions) instructions.style.display = 'none';
    });

    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('letter-character')) {
            if (event.target.classList.contains('in-group')) {
                const parentGroup = event.target.closest('.syllable-group');
                if (parentGroup) speakPhonetic(parentGroup.dataset.syllable);
                return;
            }
            const letter = event.target.dataset.letter || event.target.textContent.toLowerCase();
            speakPhonetic(PHONETIC_SOUNDS[letter]);
        }
    });

    createLetterPalette();
});
