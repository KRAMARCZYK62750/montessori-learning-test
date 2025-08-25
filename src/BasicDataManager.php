<?php

namespace App;

class BasicDataManager {
    private $data_file;

    public function __construct($data_file = __DIR__ . '/../data/montessori_test_data.txt') {
        $this->data_file = $data_file;
    }

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
