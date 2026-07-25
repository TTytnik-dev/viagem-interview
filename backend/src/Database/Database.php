<?php

declare(strict_types=1);

namespace App\Database;

use PDO;

final class Database
{
    public static function create(): PDO
    {
        $path = __DIR__ . '/../../storage/database.sqlite';

        return new PDO('sqlite:' . $path, null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    }
}
