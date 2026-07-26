import type { FeatureCollection } from "geojson";

const API_URL = import.meta.env.VITE_API_URL;

export async function loadParcels(bbox: string): Promise<FeatureCollection> {
    const response = await fetch(`${API_URL}/api/parcels?bbox=${bbox}`);

    if (!response.ok) {
        throw new Error("Failed to load parcels");
    }

    return response.json();
}