<?php

namespace Tests;

use App\BasicMontessoriLearning;
use PHPUnit\Framework\TestCase;

class BasicMontessoriLearningTest extends TestCase
{
    private BasicMontessoriLearning $learning_system;
    private string $test_data_file = __DIR__ . '/../data/test_learning_data.json';
    private string $test_words_file = __DIR__ . '/../data/test_words.txt';

    protected function setUp(): void
    {
        // Create a temporary words file for testing
        file_put_contents($this->test_words_file, "cat\ndog\ncar\n");

        // The constructor for BasicMontessoriLearning needs the path to the data file.
        // We also need to modify the isValidWord method to accept a path to the words file for testability.
        // For now, I will assume the main class is refactored to allow this.
        // Let's adjust the test to work with the current implementation first.
        // The current implementation hardcodes paths relative to its own location. This is a problem for testing.
        // I will adapt the test to this limitation for now.

        $this->learning_system = new BasicMontessoriLearning($this->test_data_file);

        // To properly test isValidWord, we need to refactor the main class.
        // I will skip testing `isValidWord` directly and test `makeWord` which uses it.
    }

    protected function tearDown(): void
    {
        if (file_exists($this->test_data_file)) {
            unlink($this->test_data_file);
        }
        if (file_exists($this->test_words_file)) {
            unlink($this->test_words_file);
        }
    }

    public function testLearnSoundNew(): void
    {
        $message = $this->learning_system->learnSound('a');
        $this->assertEquals("Nouveau son appris : a", $message);

        $stats = $this->learning_system->getStats();
        $this->assertEquals(1, $stats['sounds_learned']);
        $this->assertEquals(1, $stats['total_practice']);
    }

    public function testLearnSoundReinforce(): void
    {
        $this->learning_system->learnSound('b');
        $message = $this->learning_system->learnSound('b');
        $this->assertEquals("Son renforcé : b", $message);

        $stats = $this->learning_system->getStats();
        $this->assertEquals(1, $stats['sounds_learned']);
        $this->assertEquals(2, $stats['total_practice']);
    }

    public function testMakeValidWord(): void
    {
        // This test relies on the main words.txt, which is not ideal.
        // A better implementation would allow injecting the word list path.
        $message = $this->learning_system->makeWord(['c', 'a', 't']);
        $this->assertEquals("Mot créé : cat", $message);

        $stats = $this->learning_system->getStats();
        $this->assertEquals(1, $stats['words_created']);
    }

    public function testMakeInvalidWord(): void
    {
        $message = $this->learning_system->makeWord(['x', 'y', 'z']);
        $this->assertEquals("Mot non valide : xyz", $message);

        $stats = $this->learning_system->getStats();
        $this->assertEquals(0, $stats['words_created']);
    }

    public function testSaveAndLoadData(): void
    {
        $this->learning_system->learnSound('z');
        $this->learning_system->makeWord(['d', 'o', 'g']);

        $result = $this->learning_system->saveData();
        $this->assertTrue($result !== false);
        $this->assertFileExists($this->test_data_file);

        // Create a new instance to ensure data is loaded from the file
        $new_learning_system = new BasicMontessoriLearning($this->test_data_file);
        $this->assertFalse($new_learning_system->getStats()['sounds_learned'] > 0, "Stats should be 0 before loading");

        $load_result = $new_learning_system->loadData();
        $this->assertTrue($load_result);

        $stats = $new_learning_system->getStats();
        $this->assertEquals(1, $stats['sounds_learned']);
        $this->assertEquals(1, $stats['words_created']);
    }
}
