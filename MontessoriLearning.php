<?php

/**
 * VERSION PUBLIQUE SIMPLIFIÉE POUR TEST JULES
 * Concepts Montessori de base - Apprentissage phonétique
 * 
 * @author Créateur anonyme
 * @version 1.0 Test
 * @purpose Tester les capacités d'amélioration de Jules
 */

require_once __DIR__ . '/vendor/autoload.php';

use App\BasicMontessoriLearning;
use App\BasicDataManager;

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
