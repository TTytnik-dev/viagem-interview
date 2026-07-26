import { Map as MaplibreMap } from 'maplibre-gl';

let selectedParcelId: string | number | null = null;

export function getSelectedParcelId(): string | number | null {
  return selectedParcelId;
}

export function setSelectedParcelId(currentMap: MaplibreMap, id: string | number | null) {
  if (currentMap.getSource('parcels-source')) {
    if (selectedParcelId !== null) {
      currentMap.setFeatureState(
        { source: 'parcels-source', id: selectedParcelId },
        { selected: false }
      );
    }
    
    selectedParcelId = id;
    
    if (selectedParcelId !== null) {
      currentMap.setFeatureState(
        { source: 'parcels-source', id: selectedParcelId },
        { selected: true }
      );
    }
  } else {
      selectedParcelId = id;
  }
}
