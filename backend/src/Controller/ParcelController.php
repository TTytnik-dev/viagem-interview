<?php

declare(strict_types=1);

namespace App\Controller;

use App\Service\ParcelService;
use JsonException;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class ParcelController
{
    public function __construct(
        private ParcelService $parcelService
    ) {}

    /**
     * @throws JsonException
     */
    public function index(Request $request, Response $response): Response
    {
        $queryParams = $request->getQueryParams();
        $bbox = $queryParams['bbox'] ?? null;

        if (!is_string($bbox)) {
            return $this->jsonResponse($response, ['error' => 'Missing bbox parameter'], 400);
        }

        $parts = array_map('trim', explode(',', $bbox));

        if (count($parts) !== 4 || !is_numeric($parts[0]) || !is_numeric($parts[1]) || !is_numeric($parts[2]) || !is_numeric($parts[3])) {
            return $this->jsonResponse($response, ['error' => 'Invalid bbox format. Expected numeric minX,minY,maxX,maxY'], 400);
        }

        [$minX, $minY, $maxX, $maxY] = $parts;

        $geoJson = $this->parcelService->getVisibleParcelsAsGeoJson(
            (float) $minX,
            (float) $minY,
            (float) $maxX,
            (float) $maxY
        );

        return $this->jsonResponse($response, $geoJson);
    }

    private function jsonResponse(Response $response, mixed $data, int $status = 200): Response
    {
        $response->getBody()->write(json_encode($data, JSON_THROW_ON_ERROR));
        return $response->withStatus($status)->withHeader('Content-Type', 'application/json');
    }
}
