document.addEventListener('DOMContentLoaded', () => {

    const palette = document.getElementById('palette');
    const stage = document.getElementById('stage');
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const colors = Array.from({length: 11}, (_, i) => `color-${i + 1}`);

    let draggedElement = null;

    const PHONETIC_SOUNDS = {
        'a': 'a', 'e': 'eu', 'i': 'i', 'o': 'o', 'u': 'ou', 'y': 'i', 'b': 'beu', 'c': 'keu', 'd': 'deu', 'f': 'feu', 'g': 'geu', 'h': 'acheu', 'j': 'jeu', 'k': 'keu', 'l': 'leu', 'm': 'meu', 'n': 'neu', 'p': 'peu', 'q': 'keu', 'r': 'reu', 's': 'sseu', 't': 'teu', 'v': 'veu', 'w': 'weu', 'x': 'ixeu', 'z': 'zeu'
    };

    const FRENCH_SYLLABLES = {
        'ba': 'ba', 'ca': 'ka', 'da': 'da', 'fa': 'fa', 'ga': 'ga', 'ha': 'ha', 'ja': 'ja', 'ka': 'ka', 'la': 'la', 'ma': 'ma', 'na': 'na', 'pa': 'pa', 'ra': 'ra', 'sa': 'sa', 'ta': 'ta', 'va': 'va', 'wa': 'wa', 'za': 'za',
        'be': 'beu', 'ce': 'seu', 'de': 'deu', 'fe': 'feu', 'ge': 'jeu', 'he': 'heu', 'je': 'jeu', 'ke': 'keu', 'le': 'leu', 'me': 'meu', 'ne': 'neu', 'pe': 'peu', 're': 'reu', 'se': 'seu', 'te': 'teu', 've': 'veu', 'ze': 'zeu',
        'bi': 'bi', 'ci': 'si', 'di': 'di', 'fi': 'fi', 'gi': 'ji', 'hi': 'hi', 'ji': 'ji', 'ki': 'ki', 'li': 'li', 'mi': 'mi', 'ni': 'ni', 'pi': 'pi', 'ri': 'ri', 'si': 'si', 'ti': 'ti', 'vi': 'vi', 'zi': 'zi',
        'bo': 'bo', 'co': 'ko', 'do': 'do', 'fo': 'fo', 'go': 'go', 'ho': 'ho', 'jo': 'jo', 'ko': 'ko', 'lo': 'lo', 'mo': 'mo', 'no': 'no', 'po': 'po', 'ro': 'ro', 'so': 'so', 'to': 'to', 'vo': 'vo', 'zo': 'zo',
        'bu': 'bu', 'cu': 'ku', 'du': 'du', 'fu': 'fu', 'gu': 'gu', 'hu': 'hu', 'ju': 'ju', 'ku': 'ku', 'lu': 'lu', 'mu': 'mu', 'nu': 'nu', 'pu': 'pu', 'ru': 'ru', 'su': 'su', 'tu': 'tu', 'vu': 'vu', 'zu': 'zu',
        'man': 'man', 'sac': 'sac', 'lac': 'lac'
    };

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

    const createSyllableConnection = (elements, syllable) => {
        if (elements.length < 2) return;
        const sortedElements = [...elements].sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
        const first = sortedElements[0];
        const last = sortedElements[sortedElements.length - 1];
        const connection = document.createElement('div');
        connection.style.position = 'absolute';
        connection.style.height = '4px';
        connection.style.backgroundColor = '#fcc419';
        connection.style.borderRadius = '2px';
        connection.style.zIndex = '999';
        connection.className = 'syllable-connection';
        const rect1 = first.getBoundingClientRect();
        const rect2 = last.getBoundingClientRect();
        const stageRect = stage.getBoundingClientRect();
        const x1 = rect1.left - stageRect.left + rect1.width / 2;
        const y1 = rect1.top - stageRect.top + rect1.height / 2;
        const x2 = rect2.left - stageRect.left + rect2.width / 2;
        const y2 = rect2.top - stageRect.top + rect2.height / 2;
        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        connection.style.width = `${length}px`;
        connection.style.left = `${x1}px`;
        connection.style.top = `${y1 - 2}px`;
        connection.style.transform = `rotate(${angle}deg)`;
        connection.style.transformOrigin = '0 50%';
        stage.appendChild(connection);
        setTimeout(() => { if (connection.parentNode) connection.parentNode.removeChild(connection); }, 2000);
        elements.forEach(el => {
            el.classList.add('connected');
            el.dataset.syllable = syllable;
        });
    };

    const speakPhonetic = (text, isLetter = false) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance();
            utterance.text = isLetter ? (PHONETIC_SOUNDS[text.toLowerCase()] || text) : text;
            utterance.rate = isLetter ? 0.7 : 0.8;
            utterance.lang = 'fr-FR';
            utterance.pitch = 1.2;
            window.speechSynthesis.speak(utterance);
        }
    };

    const triggerSyllableAnimation = (elements) => {
        elements.forEach(el => {
            el.classList.add('pulse');
            el.style.transform = 'scale(1.3)';
        });
        setTimeout(() => {
            elements.forEach(el => {
                el.classList.remove('pulse');
                el.style.transform = '';
            });
        }, 1000);
    };

    const checkSyllableCombinations = (droppedElement) => {
        const allCharsOnStage = Array.from(stage.querySelectorAll('.letter-character:not(.connected)'));
        if (allCharsOnStage.length >= 3) {
            const otherLetters = allCharsOnStage.filter(el => el.id !== droppedElement.id);
            for (let i = 0; i < otherLetters.length; i++) {
                for (let j = i + 1; j < otherLetters.length; j++) {
                    const letterA = otherLetters[i];
                    const letterB = otherLetters[j];
                    if (getDistance(droppedElement, letterA) < 120 && getDistance(droppedElement, letterB) < 120 && getDistance(letterA, letterB) < 120) {
                        const triplet = [droppedElement, letterA, letterB].sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
                        const syllable = triplet.map(el => el.dataset.letter).join('');
                        if (FRENCH_SYLLABLES[syllable]) {
                            console.log(`Syllabe (3 lettres) détectée: ${syllable}`);
                            triggerSyllableAnimation(triplet);
                            createSyllableConnection(triplet, syllable);
                            setTimeout(() => speakPhonetic(FRENCH_SYLLABLES[syllable]), 300);
                            return;
                        }
                    }
                }
            }
        }
        const uncombinedChars = allCharsOnStage.filter(el => el.id !== droppedElement.id);
        for (const char of uncombinedChars) {
            if (getDistance(droppedElement, char) < 120) {
                const pair = [char, droppedElement].sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
                const syllable = pair.map(el => el.dataset.letter).join('');
                if (FRENCH_SYLLABLES[syllable]) {
                    console.log(`Syllabe (2 lettres) détectée: ${syllable}`);
                    triggerSyllableAnimation(pair);
                    createSyllableConnection(pair, syllable);
                    setTimeout(() => speakPhonetic(FRENCH_SYLLABLES[syllable]), 300);
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
        if (event.target.classList.contains('letter-character')) {
            draggedElement = event.target;
            setTimeout(() => event.target.classList.add('dragging'), 0);
        }
    });

    document.addEventListener('dragend', (event) => {
        if (draggedElement) draggedElement.classList.remove('dragging');
        draggedElement = null;
    });

    stage.addEventListener('dragover', (event) => event.preventDefault());

    stage.addEventListener('drop', (event) => {
        event.preventDefault();
        if (!draggedElement) return;
        let elementToDrop = draggedElement;
        if (draggedElement.id.startsWith('palette-')) {
            elementToDrop = draggedElement.cloneNode(true);
            elementToDrop.id = `stage-${Date.now()}`;
            elementToDrop.dataset.letter = draggedElement.dataset.letter;
            stage.appendChild(elementToDrop);
        } else if (draggedElement.classList.contains('connected')) {
            const syllable = draggedElement.dataset.syllable;
            const connectedLetters = document.querySelectorAll(`[data-syllable="${syllable}"]`);
            connectedLetters.forEach(el => {
                el.classList.remove('connected');
                delete el.dataset.syllable;
            });
            // Also remove the connection line
            const connectionLine = document.querySelector('.syllable-connection');
            if(connectionLine) connectionLine.remove();
        }
        const stageRect = stage.getBoundingClientRect();
        elementToDrop.style.position = 'absolute';
        elementToDrop.style.left = `${event.clientX - stageRect.left - (elementToDrop.offsetWidth / 2)}px`;
        elementToDrop.style.top = `${event.clientY - stageRect.top - (elementToDrop.offsetHeight / 2)}px`;
        const instructions = stage.querySelector('.instructions');
        if (instructions) instructions.style.display = 'none';
        setTimeout(() => checkSyllableCombinations(elementToDrop), 100);
    });

    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('letter-character')) {
            const letter = event.target.dataset.letter || event.target.textContent.toLowerCase();
            speakPhonetic(letter, true);
        }
    });

    createLetterPalette();
});
