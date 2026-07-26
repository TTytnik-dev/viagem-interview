import { Map as MaplibreMap, Popup } from 'maplibre-gl';
import { getSelectedParcelId, setSelectedParcelId } from './parcelSelection';

export function showParcelPopup(currentMap: MaplibreMap, feature: GeoJSON.Feature, lngLat: [number, number] | {lng: number, lat: number}) {
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
    .setLngLat(lngLat)
    .setHTML(html)
    .addTo(currentMap)
    .on('close', () => {
      const clickedParcelId = feature.id as string | number;
      if (getSelectedParcelId() === clickedParcelId) {
        setSelectedParcelId(currentMap, null);
      }
    });
}
