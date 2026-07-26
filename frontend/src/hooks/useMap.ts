import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { Map as MaplibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface UseMapOptions {
  center: [number, number];
  zoom: number;
  style: string;
}

export function useMap(
  mapContainerRef: MutableRefObject<HTMLDivElement | null>,
  options: UseMapOptions
) {
  const mapRef = useRef<MaplibreMap | null>(null);
  const [mapInstance, setMapInstance] = useState<MaplibreMap | null>(null);

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    mapRef.current = new MaplibreMap({
      container: mapContainerRef.current,
      style: options.style,
      center: options.center,
      zoom: options.zoom,
    });

    setMapInstance(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { mapInstance };
}
