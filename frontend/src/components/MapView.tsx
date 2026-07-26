import { useEffect, useRef, useState } from 'react';
import { Map as MaplibreMap, GeoJSONSource, Popup } from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useParcels } from '../hooks/useParcels';

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

function addParcelsLayer(currentMap: MaplibreMap, data: FeatureCollection) {
    if (currentMap.getSource('parcels-source')) {
      (currentMap.getSource('parcels-source') as GeoJSONSource).setData(data);
    } else {
      currentMap.addSource('parcels-source', { type: 'geojson', data });
      
      currentMap.addLayer({
        id: 'parcels-fill',
        type: 'fill',
        source: 'parcels-source',
        paint: { 'fill-color': '#007cbf', 'fill-opacity': 0.3 },
      });

      currentMap.addLayer({
        id: 'parcels-outline',
        type: 'line',
        source: 'parcels-source',
        paint: { 'line-color': '#007cbf', 'line-width': 1 },
      });

      currentMap.on('click', 'parcels-fill', (e) => {
        if (!e.features || e.features.length === 0) return;
        const feature = e.features[0];
        const properties = feature.properties as { parcel_number: string; cadastral_area: string; area: number };
        
        const html = `
          <div style="padding: 5px; font-family: sans-serif;">
            <h3 style="margin: 0 0 5px 0;">Parcela: ${properties.parcel_number}</h3>
            <p style="margin: 2px 0;">Katastr: ${properties.cadastral_area}</p>
            <p style="margin: 2px 0;">Výměra: ${properties.area} m²</p>
          </div>
        `;
        new Popup({ closeButton: true, closeOnClick: true })
          .setLngLat(e.lngLat)
          .setHTML(html)
          .addTo(currentMap);
      });

      currentMap.on('mouseenter', 'parcels-fill', () => currentMap.getCanvas().style.cursor = 'pointer');
      currentMap.on('mouseleave', 'parcels-fill', () => currentMap.getCanvas().style.cursor = '');
    }
  }