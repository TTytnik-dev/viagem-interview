<?php

declare(strict_types=1);

namespace App\Service;

use App\Repository\ParcelRepository;
use JsonException;

final class ParcelService
{
    public function __construct(
        private ParcelRepository $parcelRepository
    ) {}

    /**
     * @throws JsonException
     */

    public function getVisibleParcelsAsGeoJson(
        float $minX,
        float $minY,
        float $maxX,
        float $maxY
    ): array {
        $parcels = $this->parcelRepository->findVisibleByBBox(
            $minX,
            $minY,
            $maxX,
            $maxY
        );

        $features = array_map(
            static fn(array $parcel): array => [
                'type' => 'Feature',
                'id' => $parcel['id'],
                'geometry' => $parcel['geometry']
                    ? json_decode($parcel['geometry'], true, 512, JSON_THROW_ON_ERROR)
                    : null,
                'properties' => [
                    'id' => $parcel['id'],
                    'parcel_number' => $parcel['parcel_number'],
                    'cadastral_area' => $parcel['cadastral_area'],
                    'area' => (float) $parcel['area'],
                ],
            ],
            $parcels
        );

        return [
            'type' => 'FeatureCollection',
            'features' => $features,
        ];
    }
}
