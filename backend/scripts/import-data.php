<?php

declare(strict_types=1);

use App\Database\Database;

require __DIR__ . '/../vendor/autoload.php';

$pdo = Database::create();

$filePath = __DIR__ . '/../../data/raw/parcels.geojson';

if (!file_exists($filePath)) {
    echo "Error: File not found at $filePath\n";
    exit(1);
}

echo "Reading GeoJSON file...\n";

$jsonData = file_get_contents($filePath);

if ($jsonData === false) {
    echo "Error: Unable to read file contents.\n";
    exit(1);
}

try {
    $data = json_decode($jsonData, true, 512, JSON_THROW_ON_ERROR);
} catch (JsonException $e) {
    echo 'Error decoding JSON: ' . $e->getMessage() . "\n";
    exit(1);
}

if (!isset($data['features']) || !is_array($data['features'])) {
    echo "Error: Invalid GeoJSON format. Missing 'features'.\n";
    exit(1);
}

echo 'Found ' . count($data['features']) . " parcels. Starting import...\n";

$stmt = $pdo->prepare(
    'INSERT OR REPLACE INTO parcels (
        id, parcel_number, cadastral_area, area, min_x, max_x, min_y, max_y, geometry
    ) VALUES (
        :id, :parcel_number, :cadastral_area, :area, :min_x, :max_x, :min_y, :max_y, :geometry
    )'
);

function calculateBBox(array $coordinates): array
{
    $minX = INF;
    $maxX = -INF;
    $minY = INF;
    $maxY = -INF;

    $processCoords = function ($coords) use (&$processCoords, &$minX, &$maxX, &$minY, &$maxY): void {
        if (is_array($coords) && isset($coords[0]) && is_numeric($coords[0])) {
            $minX = min($minX, (float) $coords[0]);
            $maxX = max($maxX, (float) $coords[0]);
            $minY = min($minY, (float) $coords[1]);
            $maxY = max($maxY, (float) $coords[1]);
        } elseif (is_array($coords)) {
            foreach ($coords as $item) {
                $processCoords($item);
            }
        }
    };

    $processCoords($coordinates);

    return [$minX, $minY, $maxX, $maxY];
}

$imported = 0;
$skipped = 0;

try {
    $pdo->beginTransaction();

    foreach ($data['features'] as $feature) {
        $props = $feature['properties'] ?? [];
        $geometry = $feature['geometry'] ?? null;

        $id = $props['gml_id'] ?? $props['localId'] ?? $props['id'] ?? null;
        $parcelNumber = $props['label'] ?? null;
        
        $cadastralArea = $props['zoning_title'] ?? null;
        if (!$cadastralArea && isset($props['nationalCadastralReference'])) {
            $parts = explode('-', (string)$props['nationalCadastralReference']);
            $cadastralArea = $parts[0];
        }
        
        $area = $props['areaValue'] ?? (isset($props['areavalue']) ? (float) $props['areavalue'] : null);

        if (
            !$id ||
            !$geometry ||
            !isset($geometry['coordinates']) ||
            $parcelNumber === null ||
            $cadastralArea === null ||
            $area === null
        ) {
            $skipped++;
            continue;
        }

        [$minX, $minY, $maxX, $maxY] = calculateBBox($geometry['coordinates']);

        $stmt->execute([
            'id' => $id,
            'parcel_number' => $parcelNumber,
            'cadastral_area' => $cadastralArea,
            'area' => $area,
            'min_x' => $minX,
            'max_x' => $maxX,
            'min_y' => $minY,
            'max_y' => $maxY,
            'geometry' => json_encode($geometry, JSON_THROW_ON_ERROR),
        ]);

        $imported++;
    }

    $pdo->commit();
    echo "Successfully imported $imported parcels. Skipped: $skipped.\n";
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    echo 'Error during import: ' . $e->getMessage() . "\n";
    exit(1);
}
