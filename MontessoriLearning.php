<?php

/**
 * VERSION PUBLIQUE SIMPLIFIÉE POUR TEST JULES
 * Concepts Montessori de base - Apprentissage phonétique
 * 
 * @author Créateur anonyme
 * @version 1.0 Test
 * @purpose Tester les capacités d'amélioration de Jules
 */

class BasicMontessoriLearning {
    
    private $phonetic_data = [];
    private $word_list = [];
    private $learning_stats = [];
    
    public function __construct() {
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
        
        return file_put_contents('basic_learning_data.json', json_encode($data));
    }
    
    /**
     * Chargement basique
     */
    public function loadData() {
        if (file_exists('basic_learning_data.json')) {
            $data = json_decode(file_get_contents('basic_learning_data.json'), true);
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
        // Liste simple de mots valides pour test
        $basic_words = [
            'cat', 'dog', 'sun', 'moon', 'car', 'book', 'home',
            'papa', 'mama', 'baby', 'good', 'bad', 'big', 'small'
        ];
        return in_array($word, $basic_words);
    }
    
    private function getTotalPractice() {
        $total = 0;
        foreach ($this->phonetic_data as $data) {
            $total += $data['practice_count'];
        }
        return $total;
    }
}

/**
 * CLASSE DE PERSISTENCE SIMPLE
 */
class BasicDataManager {
    private $data_file = 'montessori_test_data.txt';
    
    public function log($message) {
        $timestamp = date('Y-m-d H:i:s');
        $log_entry = "[$timestamp] $message\n";
        file_put_contents($this->data_file, $log_entry, FILE_APPEND | LOCK_EX);
    }
    
    public function getLogs() {
        if (file_exists($this->data_file)) {
            return file_get_contents($this->data_file);
        }
        return "Aucun log trouvé.";
    }
}

/**
 * EXEMPLE D'UTILISATION SIMPLE
 */

// Test basique du système
echo "=== TEST SYSTÈME MONTESSORI BASIQUE ===\n\n";

$learning_system = new BasicMontessoriLearning();
$data_manager = new BasicDataManager();

// Log de démarrage
$data_manager->log("Démarrage du système Montessori de test");

// Tests de base
echo "1. Test apprentissage sons :\n";
echo "→ " . $learning_system->learnSound("a") . "\n";
echo "→ " . $learning_system->learnSound("p") . "\n";
echo "→ " . $learning_system->learnSound("a") . "\n"; // Renforcement

echo "\n2. Test formation mots :\n";
echo "→ " . $learning_system->makeWord(['c', 'a', 't']) . "\n";
echo "→ " . $learning_system->makeWord(['d', 'o', 'g']) . "\n";
echo "→ " . $learning_system->makeWord(['x', 'y', 'z']) . "\n"; // Mot invalide

echo "\n3. Statistiques :\n";
$stats = $learning_system->getStats();
foreach ($stats as $key => $value) {
    echo "→ " . ucfirst(str_replace('_', ' ', $key)) . " : $value\n";
}

echo "\n4. Test automatique complet :\n";
$auto_tests = $learning_system->runBasicTest();
foreach ($auto_tests as $test_result) {
    echo "→ $test_result\n";
}

echo "\n5. Sauvegarde :\n";
$save_result = $learning_system->saveData();
echo "→ " . ($save_result ? "Données sauvegardées ✅" : "Erreur sauvegarde ❌") . "\n";

// Log final
$data_manager->log("Test terminé - Système fonctionnel");

echo "\n=== LOGS SYSTÈME ===\n";
echo $data_manager->getLogs();

echo "\n=== INSTRUCTIONS POUR JULES ===\n";
echo "1. Analysez ce code et proposez des améliorations\n";
echo "2. Optimisez les performances\n"; 
echo "3. Ajoutez des fonctionnalités manquantes\n";
echo "4. Créez une interface web moderne\n";
echo "5. Implémentez des tests unitaires complets\n";
echo "6. Améliorez la documentation\n";
echo "\nÀ vous de jouer, Jules ! 🚀\n";

?>
