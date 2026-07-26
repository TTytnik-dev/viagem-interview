const API_URL = 'http://localhost:8000';

export async function loadParcels(bbox: string) {
    const response = await fetch(`${API_URL}/api/parcels?bbox=${bbox}`);

    if (!response.ok) {
        throw new Error('Failed to load parcels');
    }

    return response.json();
}