import { useEffect, useRef, useState } from 'react';
import { Map as MaplibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useParcels } from '../hooks/useParcels';
import { addParcelsLayer } from '../map/mapLayers';

export function MapView() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<MaplibreMap | null>(null);
  const [mapInstance, setMapInstance] = useState<MaplibreMap | null>(null);
  const parcels = useParcels(mapInstance);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new MaplibreMap({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [15.35, 50.43],
      zoom: 15,
    });

    setMapInstance(map.current);

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const currentMap = mapInstance;
    if (!currentMap || !parcels) return;

    if (!currentMap.isStyleLoaded()) {
      currentMap.on('load', () => {
        addParcelsLayer(currentMap, parcels);
      });
    } else {
      addParcelsLayer(currentMap, parcels);
    }
  }, [parcels, mapInstance]);

  return (
    <div className="app">
      <div ref={mapContainer} className="map" />
    </div>
  );
}