document.addEventListener('DOMContentLoaded', () => {

    const palette = document.getElementById('palette');
    const stage = document.getElementById('stage');
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const colors = Array.from({length: 11}, (_, i) => `color-${i + 1}`);

    let draggedElement = null;

    /**
     * TABLE PHONÉTIQUE FRANÇAISE CORRECTE
     * Mapping des lettres vers des sons courts et fusionnables.
     */
    const PHONETIC_SOUNDS = {
        // Voyelles - sons purs
        'a': 'a', 'e': 'e', 'i': 'i', 'o': 'o', 'u': 'u', 'y': 'i',

        // Consonnes - sons courts pour la fusion
        'b': 'be', 'c': 'ke', 'd': 'de', 'f': 'fe', 'g': 'ge',
        'h': 'ache', // H est muet dans les syllabes mais a un nom
        'j': 'je', 'k': 'ke', 'l': 'le', 'm': 'me',
        'n': 'ne', 'p': 'pe', 'q': 'ke', 'r': 're', 's': 'se',
        't': 'te', 'v': 've', 'w': 'we', 'x': 'kse', 'z': 'ze'
    };

    /**
     * SYLLABES FRANÇAISES COMPLÈTES
     * Vraies combinaisons phonétiques consonne + voyelle
     */
    const FRENCH_SYLLABLES = {
        // Syllabes avec A
        'ba': 'ba', 'ca': 'ka', 'da': 'da', 'fa': 'fa', 'ga': 'ga',
        'ha': 'a', 'ja': 'ja', 'ka': 'ka', 'la': 'la', 'ma': 'ma',
        'na': 'na', 'pa': 'pa', 'ra': 'ra', 'sa': 'sa', 'ta': 'ta',
        'va': 'va', 'wa': 'wa', 'za': 'za',

        // Syllabes avec E
        'be': 'be', 'ce': 'se', 'de': 'de', 'fe': 'fe', 'ge': 'je',
        'he': 'e', 'je': 'je', 'ke': 'ke', 'le': 'le', 'me': 'me',
        'ne': 'ne', 'pe': 'pe', 're': 're', 'se': 'se', 'te': 'te',
        've': 've', 'ze': 'ze',

        // Syllabes avec I
        'bi': 'bi', 'ci': 'si', 'di': 'di', 'fi': 'fi', 'gi': 'ji',
        'hi': 'i', 'ji': 'ji', 'ki': 'ki', 'li': 'li', 'mi': 'mi',
        'ni': 'ni', 'pi': 'pi', 'ri': 'ri', 'si': 'si', 'ti': 'ti',
        'vi': 'vi', 'zi': 'zi',

        // Syllabes avec O
        'bo': 'bo', 'co': 'ko', 'do': 'do', 'fo': 'fo', 'go': 'go',
        'ho': 'o', 'jo': 'jo', 'ko': 'ko', 'lo': 'lo', 'mo': 'mo',
        'no': 'no', 'po': 'po', 'ro': 'ro', 'so': 'so', 'to': 'to',
        'vo': 'vo', 'zo': 'zo',

        // Syllabes avec U
        'bu': 'bu', 'cu': 'ku', 'du': 'du', 'fu': 'fu', 'gu': 'gu',
        'hu': 'u', 'ju': 'ju', 'ku': 'ku', 'lu': 'lu', 'mu': 'mu',
        'nu': 'nu', 'pu': 'pu', 'ru': 'ru', 'su': 'su', 'tu': 'tu',
        'vu': 'vu', 'zu': 'zu',

        // Syllabes CVC (Consonne-Voyelle-Consonne) pour les mots
        'man': 'man', 'mon': 'mon', 'men': 'men',
        'dan': 'dan', 'don': 'don', 'den': 'den',
        'lan': 'lan', 'lon': 'lon', 'len': 'len',
        'pas': 'pas', 'par': 'par', 'sol': 'sol', 'sur': 'sur',
        'fin': 'fin', 'fon': 'fon', 'fil': 'fil'
    };

    /**
     * CLASSIFICATION DES LETTRES
     */
    const CONSONANTS = ['b','c','d','f','g','h','j','k','l','m','n','p','q','r','s','t','v','w','x','z'];
    const VOWELS = ['a','e','i','o','u','y'];

    /**
     * Détermine si deux lettres forment une vraie syllabe française
     */
    const isValidSyllable = (letter1, letter2) => {
        const combo1 = letter1.toLowerCase() + letter2.toLowerCase();
        const combo2 = letter2.toLowerCase() + letter1.toLowerCase();

        return FRENCH_SYLLABLES[combo1] || FRENCH_SYLLABLES[combo2];
    };

    /**
     * Forme la syllabe dans le bon ordre (consonne + voyelle)
     */
    const createSyllable = (letter1, letter2) => {
        const l1 = letter1.toLowerCase();
        const l2 = letter2.toLowerCase();

        // Consonne + Voyelle = ordre correct
        if (CONSONANTS.includes(l1) && VOWELS.includes(l2)) {
            return l1 + l2;
        }
        // Voyelle + Consonne = inverser
        if (VOWELS.includes(l1) && CONSONANTS.includes(l2)) {
            return l2 + l1;
        }
        // Cas ambigus : garder l'ordre d'approche
        return l1 + l2;
    };

    /**
     * Génère la palette de lettres avec bonhommes colorés
     */
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

    const triggerSyllableAnimation = (element) => {
        element.classList.add('pulse');
        setTimeout(() => element.classList.remove('pulse'), 1000);
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
        group.style.display = 'inline-flex'; // Pour que les lettres s'alignent

        elements.forEach(el => {
            el.style.position = 'static';
            el.draggable = false;
            el.classList.add('in-group');
            group.appendChild(el);
        });

        stage.appendChild(group);
        return group;
    };

    const WORDS = { 'maman': 'maman' };

    const checkSyllableCombinations = (droppedElement) => {
        const droppedLetter = droppedElement.dataset.letter;
        const stageElements = Array.from(stage.children);

        for (const element of stageElements) {
            if (element.id === droppedElement.id) continue;

            const distance = getDistance(droppedElement, element);
            if (distance > 120) continue;

            if (element.classList.contains('syllable-group') && CONSONANTS.includes(droppedLetter)) {
                const existingSyllable = element.dataset.syllable;
                if (existingSyllable.length === 2) {
                    const newSyllable = existingSyllable + droppedLetter;
                    if (FRENCH_SYLLABLES[newSyllable]) {
                        console.log(`Syllabe CVC détectée: ${newSyllable}`);
                        droppedElement.style.position = 'static';
                        element.appendChild(droppedElement);
                        element.dataset.syllable = newSyllable;
                        triggerSyllableAnimation(element);
                        speakPhonetic(newSyllable);
                        return;
                    }
                }
            }

            if (element.classList.contains('letter-character') && !element.classList.contains('in-group')) {
                const staticLetter = element.dataset.letter;
                if (isValidSyllable(staticLetter, droppedLetter)) {
                    const syllable = createSyllable(staticLetter, droppedLetter);
                    if (FRENCH_SYLLABLES[syllable]) {
                        console.log(`Syllabe CV détectée: ${syllable}`);
                        const groupPos = { x: element.offsetLeft, y: element.offsetTop };
                        const c = CONSONANTS.includes(staticLetter) ? element : droppedElement;
                        const v = VOWELS.includes(staticLetter) ? element : droppedElement;
                        const group = createSyllableGroup([c, v], syllable, groupPos);
                        triggerSyllableAnimation(group);
                        speakPhonetic(syllable);
                        return;
                    }
                }
            }
        }
    };

    const checkWordCombinations = (droppedGroup) => {
        const droppedSyllable = droppedGroup.dataset.syllable;
        const stageElements = Array.from(stage.querySelectorAll('.syllable-group'));

        for (const group of stageElements) {
            if (group.id === droppedGroup.id) continue;

            if (getDistance(droppedGroup, group) < 150) {
                const staticSyllable = group.dataset.syllable;
                const word1 = staticSyllable + droppedSyllable;
                const word2 = droppedSyllable + staticSyllable;

                if (WORDS[word1] || WORDS[word2]) {
                    const word = WORDS[word1] ? word1 : word2;
                    console.log(`Mot détecté: ${word}`);

                    // Fusionner les groupes
                    const allLetters = [...group.children, ...droppedGroup.children];
                    const newPosition = { x: group.offsetLeft, y: group.offsetTop };

                    const newWordGroup = createSyllableGroup(allLetters, word, newPosition);
                    newWordGroup.classList.add('word-group');

                    stage.removeChild(group);
                    stage.removeChild(droppedGroup);

                    speakPhonetic(word);
                    triggerSyllableAnimation(newWordGroup);
                    return;
                }
            }
        }
    };

    const getDistance = (elem1, elem2) => {
        const rect1 = elem1.getBoundingClientRect();
        const rect2 = elem2.getBoundingClientRect();
        const dx = (rect1.left + rect1.width / 2) - (rect2.left + rect2.width / 2);
        const dy = (rect1.top + rect1.height / 2) - (rect2.top + rect2.height / 2);
        return Math.sqrt(dx * dx + dy * dy);
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
        }

        const stageRect = stage.getBoundingClientRect();
        elementToDrop.style.position = 'absolute';
        elementToDrop.style.left = `${event.clientX - stageRect.left - elementToDrop.offsetWidth / 2}px`;
        elementToDrop.style.top = `${event.clientY - stageRect.top - elementToDrop.offsetHeight / 2}px`;

        if (elementToDrop.classList.contains('syllable-group')) {
            checkWordCombinations(elementToDrop);
        } else if (elementToDrop.classList.contains('letter-character')) {
            checkSyllableCombinations(elementToDrop);
        }

        const instructions = stage.querySelector('.instructions');
        if (instructions) instructions.style.display = 'none';
    });

    // === CLIC POUR ENTENDRE LE SON DE LA LETTRE ===

    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('letter-character')) {
            // Ne pas jouer le son si la lettre est déjà dans une syllabe formée
            if (event.target.classList.contains('connected')) {
                return;
            }
            const letter = event.target.dataset.letter || event.target.textContent.toLowerCase();
            const soundName = PHONETIC_SOUNDS[letter];
            speakPhonetic(soundName);
        }
    });

    // === INITIALISATION ===
    createLetterPalette();

});
