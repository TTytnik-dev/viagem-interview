export interface BoundingBox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    centerX: number;
    centerY: number;
}

export function calculateBoundingBox(coordinates: unknown[]): BoundingBox | null {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    const processCoords = (coords: unknown[]) => {
        if (typeof coords[0] === 'number') {
            minX = Math.min(minX, coords[0] as number);
            maxX = Math.max(maxX, coords[0] as number);
            minY = Math.min(minY, coords[1] as number);
            maxY = Math.max(maxY, coords[1] as number);
        } else {
            coords.forEach(c => processCoords(c as unknown[]));
        }
    };

    processCoords(coordinates);

    if (minX === Infinity) return null;

    return {
        minX,
        minY,
        maxX,
        maxY,
        centerX: (minX + maxX) / 2,
        centerY: (minY + maxY) / 2
    };
}
