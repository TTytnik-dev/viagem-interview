import { useState, useEffect, useRef } from 'react';
import type { FeatureCollection } from 'geojson';
import { loadParcels } from '../api/parcelApi';
import { Map as MaplibreMap } from 'maplibre-gl';

export function useParcels(currentMap: MaplibreMap | null) {
  const [parcels, setParcels] = useState<FeatureCollection | null>(null);
  const moveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!currentMap) return;

    const handleMoveEnd = () => {
      if (!currentMap) return;

      if (moveTimeout.current) clearTimeout(moveTimeout.current);
      moveTimeout.current = setTimeout(async () => {
        const bounds = currentMap.getBounds();
        const bbox = [
          bounds.getWest(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getNorth(),
        ].join(',');

        try {
          const geoJson = await loadParcels(bbox);
          setParcels(geoJson);
        } catch (error) {
          console.error("Error loading polygons:", error);
        }
      }, 300);
    };

    currentMap.on('moveend', handleMoveEnd);

    if (currentMap.isStyleLoaded()) {
        handleMoveEnd();
    } else {
        currentMap.once('load', handleMoveEnd);
    }

    return () => {
      currentMap.off('moveend', handleMoveEnd);
    };
  }, [currentMap]);

  return parcels;
}