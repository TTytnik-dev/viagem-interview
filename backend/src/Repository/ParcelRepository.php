<?php

declare(strict_types=1);

namespace App\Repository;

use PDO;

final class ParcelRepository
{
    public function __construct(private PDO $pdo) {}

    public function count(): int
    {
        return (int) $this->pdo->query('SELECT COUNT(*) FROM parcels')->fetchColumn();
    }

    public function findById(string $id): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id, parcel_number, cadastral_area, area, min_x, max_x, min_y, max_y, geometry
             FROM parcels
             WHERE id = :id
             LIMIT 1'
        );

        $stmt->execute(['id' => $id]);

        $row = $stmt->fetch();

        return $row === false ? null : $row;
    }

    public function findVisibleByBBox(
        float $minX,
        float $minY,
        float $maxX,
        float $maxY
    ): array {
        $stmt = $this->pdo->prepare(
            'SELECT id, parcel_number, cadastral_area, area, min_x, max_x, min_y, max_y, geometry
             FROM parcels
             WHERE min_x <= :maxX
               AND max_x >= :minX
               AND min_y <= :maxY
               AND max_y >= :minY
             ORDER BY cadastral_area, parcel_number'
        );

        $stmt->execute([
            'minX' => $minX,
            'minY' => $minY,
            'maxX' => $maxX,
            'maxY' => $maxY,
        ]);

        return $stmt->fetchAll();
    }
}
