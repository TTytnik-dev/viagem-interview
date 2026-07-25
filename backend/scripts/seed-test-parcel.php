<?php

declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use App\Database\Database;

$pdo = Database::create();

$pdo->exec(
    <<<'SQL'
INSERT OR REPLACE INTO parcels (
    id,
    parcel_number,
    cadastral_area,
    area,
    min_x,
    max_x,
    min_y,
    max_y,
    geometry
) VALUES (
    'test-1',
    '123/45',
    'Jičín',
    1234.56,
    15.10,
    15.20,
    50.40,
    50.50,
    '{"type":"Polygon","coordinates":[[[15.10,50.40],[15.20,50.40],[15.20,50.50],[15.10,50.50],[15.10,50.40]]]}'
);
SQL
);

echo "Seed inserted.\n";
