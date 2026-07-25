<?php

declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use App\Database\Database;

$pdo = Database::create();

$pdo->exec(
    <<<'SQL'
CREATE TABLE IF NOT EXISTS parcels (
    id TEXT PRIMARY KEY,
    parcel_number TEXT NOT NULL,
    cadastral_area TEXT NOT NULL,
    area REAL NOT NULL,
    min_x REAL NOT NULL,
    max_x REAL NOT NULL,
    min_y REAL NOT NULL,
    max_y REAL NOT NULL,
    geometry TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_parcels_bbox
    ON parcels (min_x, max_x, min_y, max_y);

CREATE INDEX IF NOT EXISTS idx_parcels_area_number
    ON parcels (cadastral_area, parcel_number);
SQL
);

echo "Database schema initialized successfully.\n";
