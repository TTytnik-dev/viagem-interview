import { Map as MaplibreMap, GeoJSONSource, Popup } from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';

let selectedParcelId: string | number | null = null;

export function addParcelsLayer(currentMap: MaplibreMap, data: FeatureCollection) {
  if (currentMap.getSource('parcels-source')) {
    (currentMap.getSource('parcels-source') as GeoJSONSource).setData(data);
    
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
      
      if (selectedParcelId !== null) {
        currentMap.setFeatureState(
          { source: 'parcels-source', id: selectedParcelId },
          { selected: false }
        );
      }

      selectedParcelId = clickedParcelId;
      currentMap.setFeatureState(
        { source: 'parcels-source', id: selectedParcelId },
        { selected: true }
      );

      const properties = feature.properties as {
        parcel_number: string;
        cadastral_area: string;
        area: number;
      };

      const html = `
        <div style="padding: 5px; font-family: sans-serif; font-size: 14px;">
          <h3 style="margin: 0 0 5px 0;">Parcela: ${properties.parcel_number}</h3>
          <p style="margin: 2px 0;">Katastr: ${properties.cadastral_area}</p>
          <p style="margin: 2px 0;">Výměra: ${properties.area} m²</p>
        </div>
      `;

      new Popup({ closeButton: true, closeOnClick: true })
        .setLngLat(e.lngLat)
        .setHTML(html)
        .addTo(currentMap)
        .on('close', () => {
          if (selectedParcelId === clickedParcelId) {
            currentMap.setFeatureState(
              { source: 'parcels-source', id: selectedParcelId },
              { selected: false }
            );
            selectedParcelId = null;
          }
        });
    });

    currentMap.on('mouseenter', 'parcels-fill', () => currentMap.getCanvas().style.cursor = 'pointer');
    currentMap.on('mouseleave', 'parcels-fill', () => currentMap.getCanvas().style.cursor = '');
  }
}