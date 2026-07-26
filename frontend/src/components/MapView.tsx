import { useEffect, useRef } from 'react';
import { useParcels } from '../hooks/useParcels';
import { addParcelsLayer } from '../map/mapLayers';
import { useMap } from '../hooks/useMap';
import { SearchForm } from './SearchForm/SearchForm';

export function MapView() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  
  const { mapInstance } = useMap(mapContainer, {
    center: [15.35, 50.43],
    zoom: 15,
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
  });
  
  const parcels = useParcels(mapInstance);

  useEffect(() => {
    if (!mapInstance || !parcels) return;

    if (!mapInstance.isStyleLoaded()) {
      mapInstance.on('load', () => {
        addParcelsLayer(mapInstance, parcels);
      });
    } else {
      addParcelsLayer(mapInstance, parcels);
    }
  }, [parcels, mapInstance]);

  return (
    <div className="app" style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <div ref={mapContainer} className="map" style={{ width: '100%', height: '100%' }} />
      <SearchForm mapInstance={mapInstance} />
    </div>
  );
}