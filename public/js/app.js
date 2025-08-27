document.addEventListener('DOMContentLoaded', () => {

    const palette = document.getElementById('palette');
    const stage = document.getElementById('stage');
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const colors = Array.from({length: 11}, (_, i) => `color-${i + 1}`);
    let draggedElement = null;

    // --- DATA ---
    const PHONETIC_SOUNDS = { 'a': 'a', 'e': 'e', 'i': 'i', 'o': 'o', 'u': 'u', 'y': 'i', 'b': 'b', 'c': 'k', 'd': 'd', 'f': 'f', 'g': 'g', 'h': 'h', 'j': 'j', 'k': 'k', 'l': 'l', 'm': 'm', 'n': 'n', 'p': 'p', 'q': 'q', 'r': 'r', 's': 's', 't': 't', 'v': 'v', 'w': 'w', 'x': 'x', 'z': 'z' };
    const FRENCH_SYLLABLES = { 'ba': 'ba', 'be': 'be', 'bi': 'bi', 'bo': 'bo', 'bu': 'bu', 'ca': 'ca', 'ce': 'ce', 'ci': 'ci', 'co': 'co', 'cu': 'cu', 'da': 'da', 'de': 'de', 'di': 'di', 'do': 'do', 'du': 'du', 'fa': 'fa', 'fe': 'fe', 'fi': 'fi', 'fo': 'fo', 'fu': 'fu', 'ga': 'ga', 'ge': 'ge', 'gi': 'gi', 'go': 'go', 'gu': 'gu', 'ja': 'ja', 'je': 'je', 'ji': 'ji', 'jo': 'jo', 'ju': 'ju', 'la': 'la', 'le': 'le', 'li': 'li', 'lo': 'lo', 'lu': 'lu', 'ma': 'ma', 'me': 'me', 'mi': 'mi', 'mo': 'mo', 'mu': 'mu', 'na': 'na', 'ne': 'ne', 'ni': 'ni', 'no': 'no', 'nu': 'nu', 'pa': 'pa', 'pe': 'pe', 'pi': 'pi', 'po': 'po', 'pu': 'pu', 'ra': 'ra', 're': 're', 'ri': 'ri', 'ro': 'ro', 'ru': 'ru', 'sa': 'sa', 'se': 'se', 'si': 'si', 'so': 'so', 'su': 'su', 'ta': 'ta', 'te': 'te', 'ti': 'ti', 'to': 'to', 'tu': 'tu', 'va': 'va', 've': 've', 'vi': 'vi', 'vo': 'vo', 'vu': 'vu' };

    // --- CORE FUNCTIONS ---

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
        const path = `/public/audio/${soundName}.mp3`;
        if (audioCache[path]) {
            audioCache[path].currentTime = 0;
            audioCache[path].play();
        } else {
            const audio = new Audio(path);
            audioCache[path] = audio;
            audio.play().catch(error => console.error(`Could not play sound: ${path}`, error));
        }
    };

    const getDistance = (elem1, elem2) => {
        const rect1 = elem1.getBoundingClientRect();
        const rect2 = elem2.getBoundingClientRect();
        const dx = (rect1.left + rect1.width / 2) - (rect2.left + rect2.width / 2);
        const dy = (rect1.top + rect1.height / 2) - (rect2.top + rect2.height / 2);
        return Math.sqrt(dx * dx + dy * dy);
    };

    const checkSyllableCombination = (droppedElement) => {
        const uncombinedChars = Array.from(stage.querySelectorAll('.letter-character:not(.connected)'));
        for (const char of uncombinedChars) {
            if (char.id !== droppedElement.id && getDistance(droppedElement, char) < 120) {
                const pair = [char, droppedElement].sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
                const syllable = pair.map(el => el.dataset.letter).join('');

                if (FRENCH_SYLLABLES[syllable]) {
                    console.log(`Syllabe détectée: ${syllable}`);

                    // Visual and Audio Feedback
                    pair.forEach(el => el.classList.add('pulse', 'connected'));
                    pair.forEach(el => el.dataset.syllable = syllable);

                    speakPhonetic(syllable);
                    setTimeout(() => speakPhonetic('bravo'), 1000);

                    // Cleanup animation classes after they finish
                    setTimeout(() => pair.forEach(el => el.classList.remove('pulse')), 1000);
                    return; // Stop after first combination
                }
            }
        }
    };

    // --- EVENT HANDLERS ---

    document.addEventListener('dragstart', (event) => {
        if (event.target.classList.contains('letter-character')) {
            draggedElement = event.target;
            setTimeout(() => event.target.classList.add('dragging'), 0);
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

        let elementToDrop = draggedElement;
        const isConnected = draggedElement.classList.contains('connected');

        // If dragging a connected letter, break the connection
        if (isConnected) {
            const syllable = draggedElement.dataset.syllable;
            document.querySelectorAll(`[data-syllable='${syllable}']`).forEach(el => {
                el.classList.remove('connected');
                delete el.dataset.syllable;
            });
        }

        // If from palette, clone it
        if (draggedElement.id.startsWith('palette-')) {
            elementToDrop = draggedElement.cloneNode(true);
            elementToDrop.id = `stage-${Date.now()}`;
            elementToDrop.dataset.letter = draggedElement.dataset.letter;
            stage.appendChild(elementToDrop);
        }

        // Position the dropped element
        const stageRect = stage.getBoundingClientRect();
        elementToDrop.style.position = 'absolute';
        elementToDrop.style.left = `${event.clientX - stageRect.left - (elementToDrop.offsetWidth / 2)}px`;
        elementToDrop.style.top = `${event.clientY - stageRect.top - (elementToDrop.offsetHeight / 2)}px`;

        const instructions = stage.querySelector('.instructions');
        if (instructions) instructions.style.display = 'none';

        // Check for new combinations after a short delay
        setTimeout(() => checkSyllableCombination(elementToDrop), 100);
    });

    document.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('letter-character')) {
            const sound = target.classList.contains('connected')
                ? target.dataset.syllable
                : PHONETIC_SOUNDS[target.dataset.letter];
            speakPhonetic(sound);
        }
    });

    // --- INITIALIZATION ---
    createLetterPalette();
});
