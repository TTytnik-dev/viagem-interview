import { useEffect, useRef } from 'react';
import { Map as MaplibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './App.css';

function App() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<MaplibreMap | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) {
      return;
    }

    map.current = new MaplibreMap({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [15.35, 50.43],
      zoom: 14,
    });
    

    map.current.on('moveend', () => {
      if (!map.current) {
        return;
      }

      const bounds = map.current.getBounds();

      console.log([
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ].join(','));
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  return (
    <div className="app">
      <div ref={mapContainer} className="map" />
    </div>
  );
}

export default App;