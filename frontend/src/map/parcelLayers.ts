import { Map as MaplibreMap, GeoJSONSource } from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';
import { setSelectedParcelId, getSelectedParcelId } from './parcelSelection';
import { showParcelPopup } from './parcelPopup';

export function addParcelsLayer(currentMap: MaplibreMap, data: FeatureCollection) {
  if (currentMap.getSource('parcels-source')) {
    (currentMap.getSource('parcels-source') as GeoJSONSource).setData(data);
    
    const selectedParcelId = getSelectedParcelId();
    if (selectedParcelId !== null) {
      currentMap.setFeatureState(
        { source: 'parcels-source', id: selectedParcelId },
        { selected: true }
      );
    }
  } else {
    currentMap.addSource('parcels-source', { 
      type: 'geojson', 
      data,
      promoteId: 'id'
    });
    
    currentMap.addLayer({
      id: 'parcels-fill',
      type: 'fill',
      source: 'parcels-source',
      paint: { 
        'fill-color': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          '#ff0000',
          '#007cbf'
        ], 
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          0.6,
          0.3
        ]
      },
    });

    currentMap.addLayer({
      id: 'parcels-outline',
      type: 'line',
      source: 'parcels-source',
      paint: { 
        'line-color': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          '#ff0000',
          '#007cbf'
        ], 
        'line-width': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          2,
          1
        ]
      },
    });

    currentMap.on('click', 'parcels-fill', (e) => {
      if (!e.features || e.features.length === 0) return;

      const feature = e.features[0];
      const clickedParcelId = feature.id as string | number;
      
      setSelectedParcelId(currentMap, clickedParcelId);
      showParcelPopup(currentMap, feature, e.lngLat);
    });

    currentMap.on('mouseenter', 'parcels-fill', () => currentMap.getCanvas().style.cursor = 'pointer');
    currentMap.on('mouseleave', 'parcels-fill', () => currentMap.getCanvas().style.cursor = '');
  }
}
