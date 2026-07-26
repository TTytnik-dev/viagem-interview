import { useEffect, useRef, useState } from 'react';
import { Map as MaplibreMap, GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { loadParcels } from './api/parcelApi.ts';
import './App.css';

interface MapFeature {
  type: string;
  geometry: unknown;
  properties: unknown;
}

interface FeatureCollection {
  type: string;
  features: MapFeature[];
}

function App() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<MaplibreMap | null>(null);
  const [parcels, setParcels] = useState<FeatureCollection | null>(null);
  const moveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) {
      return;
    }

    map.current = new MaplibreMap({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [15.35, 50.43],
      zoom: 15,
    });

    map.current.on('moveend', () => {
      if (!map.current) {
        return;
      }

      if (moveTimeout.current) clearTimeout(moveTimeout.current);
      moveTimeout.current = setTimeout(async () => {
        const bounds = map.current!.getBounds();
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
          console.error("Ошибка загрузки полигонов:", error);
        }
      }, 300);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !parcels) return;

    const currentMap = map.current;

    if (currentMap.getSource('parcels-source')) {
      (currentMap.getSource('parcels-source') as GeoJSONSource).setData(parcels);
    } else {
      currentMap.addSource('parcels-source', {
        type: 'geojson',
        data: parcels,
      });

      currentMap.addLayer({
        id: 'parcels-fill',
        type: 'fill',
        source: 'parcels-source',
        paint: {
          'fill-color': '#007cbf',
          'fill-opacity': 0.3,
        },
      });

      currentMap.addLayer({
        id: 'parcels-outline',
        type: 'line',
        source: 'parcels-source',
        paint: {
          'line-color': '#007cbf',
          'line-width': 1,
        },
      });
    }
  }, [parcels]);

  return (
    <div className="app">
      <div ref={mapContainer} className="map" />
    </div>
  );
}

export default App;