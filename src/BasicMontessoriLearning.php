<?php

namespace App;

class BasicMontessoriLearning {

    private $phonetic_data = [];
    private $word_list = [];
    private $learning_stats = [];
    private $valid_words = [];
    private $data_file_path;

    public function __construct($data_file_path = __DIR__ . '/../data/basic_learning_data.json') {
        $this->data_file_path = $data_file_path;
        $this->initBasicEnvironment();
    }

    /**
     * Apprentissage de base des sons
     */
    public function learnSound($sound) {
        $clean_sound = strtolower(trim($sound));

        if (!isset($this->phonetic_data[$clean_sound])) {
            $this->phonetic_data[$clean_sound] = [
                'learned_at' => time(),
                'practice_count' => 1,
                'confidence' => 0.1
            ];
            return "Nouveau son appris : $clean_sound";
        } else {
            $this->phonetic_data[$clean_sound]['practice_count']++;
            $this->phonetic_data[$clean_sound]['confidence'] += 0.1;
            return "Son renforcé : $clean_sound";
        }
    }

    /**
     * Formation simple de mots
     */
    public function makeWord($letters) {
        if (!is_array($letters)) {
            return "Erreur : lettres doivent être un tableau";
        }

        $word = strtolower(implode('', $letters));

        if ($this->isValidWord($word)) {
            $this->word_list[$word] = [
                'created_at' => time(),
                'letters_count' => count($letters)
            ];
            return "Mot créé : $word";
        } else {
            return "Mot non valide : $word";
        }
    }

    /**
     * Statistiques simples
     */
    public function getStats() {
        return [
            'sounds_learned' => count($this->phonetic_data),
            'words_created' => count($this->word_list),
            'total_practice' => $this->getTotalPractice()
        ];
    }

    /**
     * Test de base
     */
    public function runBasicTest() {
        $results = [];

        // Test quelques sons
        $test_sounds = ['a', 'b', 'c'];
        foreach ($test_sounds as $sound) {
            $results[] = $this->learnSound($sound);
        }

        // Test formation mot
        $results[] = $this->makeWord(['c', 'a', 't']);

        // Statistiques
        $results[] = "Stats : " . json_encode($this->getStats());

        return $results;
    }

    /**
     * Sauvegarde basique
     */
    public function saveData() {
        $data = [
            'phonetic_data' => $this->phonetic_data,
            'word_list' => $this->word_list,
            'saved_at' => time()
        ];

        return file_put_contents($this->data_file_path, json_encode($data));
    }

    /**
     * Chargement basique
     */
    public function loadData() {
        if (file_exists($this->data_file_path)) {
            $data = json_decode(file_get_contents($this->data_file_path), true);
            if ($data) {
                $this->phonetic_data = $data['phonetic_data'] ?? [];
                $this->word_list = $data['word_list'] ?? [];
                return true;
            }
        }
        return false;
    }

    /**
     * MÉTHODES PRIVÉES BASIQUES
     */
    private function initBasicEnvironment() {
        $this->learning_stats = [
            'session_start' => time(),
            'total_interactions' => 0
        ];
    }

    private function isValidWord($word) {
        if (empty($this->valid_words)) {
            $path = __DIR__ . '/../data/words.txt';
            if (file_exists($path)) {
                $words_from_file = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                $this->valid_words = array_flip(array_map('trim', $words_from_file));
            }
        }
        return isset($this->valid_words[$word]);
    }

    private function getTotalPractice() {
        $total = 0;
        foreach ($this->phonetic_data as $data) {
            $total += $data['practice_count'];
        }
        return $total;
    }
}
