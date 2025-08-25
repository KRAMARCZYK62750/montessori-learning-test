<?php

header('Content-Type: application/json');

require_once __DIR__ . '/../vendor/autoload.php';

use App\BasicMontessoriLearning;
use App\BasicDataManager;

$learning_system = new BasicMontessoriLearning();
$learning_system->loadData(); // Load previous progress

$action = $_GET['action'] ?? '';
$response = [];

switch ($action) {
    case 'get_stats':
        $response = $learning_system->getStats();
        break;

    case 'learn_sound':
        $sound = $_GET['sound'] ?? '';
        if (!empty($sound)) {
            $result = $learning_system->learnSound($sound);
            $response = ['status' => 'success', 'message' => $result];
        } else {
            $response = ['status' => 'error', 'message' => 'Sound parameter is missing.'];
        }
        break;

    case 'make_word':
        $letters_json = $_GET['letters'] ?? '[]';
        $letters = json_decode($letters_json, true);
        if (is_array($letters)) {
            $result = $learning_system->makeWord($letters);
            $response = ['status' => 'success', 'message' => $result];
        } else {
            $response = ['status' => 'error', 'message' => 'Letters parameter must be a JSON array.'];
        }
        break;

    default:
        $response = ['status' => 'error', 'message' => 'Invalid action.'];
        http_response_code(400);
        break;
}

$learning_system->saveData(); // Save progress after each action

echo json_encode($response);
