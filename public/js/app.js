document.addEventListener('DOMContentLoaded', () => {

    const palette = document.getElementById('palette');
    const stage = document.getElementById('stage');
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const colors = Array.from({length: 11}, (_, i) => `color-${i + 1}`);

    let draggedElement = null;

    /**
     * Generates the letter characters and places them in the palette.
     */
    const createLetterPalette = () => {
        alphabet.forEach(letter => {
            const charEl = document.createElement('div');
            charEl.className = 'letter-character';
            charEl.classList.add(colors[Math.floor(Math.random() * colors.length)]); // Random color
            charEl.textContent = letter;
            charEl.draggable = true;
            charEl.id = `palette-${letter}`; // Original letters in palette

            palette.appendChild(charEl);
        });
    };

    // --- Drag and Drop Event Handlers ---

    // Using event delegation on the parent containers
    document.addEventListener('dragstart', (event) => {
        if (event.target.classList.contains('letter-character')) {
            draggedElement = event.target;
            // Use a timeout to allow the browser to create the drag image
            setTimeout(() => {
                event.target.classList.add('dragging');
            }, 0);
        }
    });

    document.addEventListener('dragend', (event) => {
        if (event.target.classList.contains('letter-character')) {
            event.target.classList.remove('dragging');
            draggedElement = null;
        }
    });

    stage.addEventListener('dragover', (event) => {
        event.preventDefault(); // Allow dropping
    });

    const getDistance = (elem1, elem2) => {
        const rect1 = elem1.getBoundingClientRect();
        const rect2 = elem2.getBoundingClientRect();
        const dx = (rect1.left + rect1.width / 2) - (rect2.left + rect2.width / 2);
        const dy = (rect1.top + rect1.height / 2) - (rect2.top + rect2.height / 2);
        return Math.sqrt(dx * dx + dy * dy);
    };

    const triggerPulseAnimation = (element) => {
        element.classList.add('pulse');
        element.addEventListener('animationend', () => {
            element.classList.remove('pulse');
        }, { once: true }); // Automatically remove listener after it runs once
    };

    const checkCombinations = (droppedElement) => {
        const allCharsOnStage = stage.querySelectorAll('.letter-character');

        allCharsOnStage.forEach(char => {
            // Check against other characters, not itself.
            if (char.id !== droppedElement.id) {
                // And ensure the other character is not being dragged (edge case)
                if (!char.classList.contains('dragging')) {
                    const distance = getDistance(droppedElement, char);
                    if (distance < 100) { // Threshold for combination
                        const syllable = char.textContent + droppedElement.textContent;
                        console.log(`Combination detected. Speaking syllable: ${syllable}`);

                        triggerPulseAnimation(char);
                        triggerPulseAnimation(droppedElement);
                        speak(syllable, 'fr-FR');
                    }
                }
            }
        });
    };

    stage.addEventListener('drop', (event) => {
        console.log("Drop event fired!");
        event.preventDefault();
        if (!draggedElement) return;

        let newElement;
        if (draggedElement.id.startsWith('palette-')) {
            newElement = draggedElement.cloneNode(true);
            newElement.id = `char-${Date.now()}`;
            stage.appendChild(newElement);
        } else {
            newElement = draggedElement;
        }

        const stageRect = stage.getBoundingClientRect();
        const x = event.clientX - stageRect.left - (newElement.offsetWidth / 2);
        const y = event.clientY - stageRect.top - (newElement.offsetHeight / 2);

        newElement.style.position = 'absolute';
        newElement.style.left = `${x}px`;
        newElement.style.top = `${y}px`;

        const instructions = stage.querySelector('.instructions');
        if (instructions) {
            instructions.style.display = 'none';
        }

        // Check for combinations after the element is positioned
        // Use a timeout to allow the browser to render the element at its new position
        setTimeout(() => {
            checkCombinations(newElement);
        }, 0);
    });

    /**
     * Pronounces a given text using the Web Speech API.
     * @param {string} text - The text to speak.
     * @param {string} lang - The language for pronunciation (e.g., 'fr-FR').
     */
    const speak = (text, lang = 'fr-FR') => {
        if ('speechSynthesis' in window) {
            // Stop any previous speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = 0.8; // Slightly slower for clarity
            window.speechSynthesis.speak(utterance);
        } else {
            console.error("Web Speech API is not supported in this browser.");
        }
    };

    /**
     * Maps a letter to its basic phonetic sound for French.
     * This is a simplified map.
     */
    const getPhoneticSound = (letter) => {
        const phonetics = {
            'f': 'ffff', 's': 'ssss', 'm': 'mmmm', 'r': 'rrrr', 'l': 'llll',
            'v': 'vvvv', 'z': 'zzzz', 'j': 'jjjj',
            // Voyelles
            'a': 'a', 'e': 'e', 'i': 'i', 'o': 'o', 'u': 'u',
        };
        return phonetics[letter] || letter; // Fallback to the letter itself
    };

    // --- Click to Speak Event Handler ---
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('letter-character')) {
            const letter = event.target.textContent;
            const sound = getPhoneticSound(letter);
            speak(sound, 'fr-FR');
        }
    });

    // --- Initialization ---
    createLetterPalette();

});
