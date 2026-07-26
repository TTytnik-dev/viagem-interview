import React, { useState } from 'react';
import type { Map as MaplibreMap } from 'maplibre-gl';
import { searchParcels } from '../../api/parcelApi';
import { highlightAndPopupParcel } from '../../map/mapLayers';
import { calculateBoundingBox } from '../../utils/geoUtils';
import styles from './SearchForm.module.css';

interface SearchFormProps {
    mapInstance: MaplibreMap | null;
}

export function SearchForm({ mapInstance }: SearchFormProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim() || !mapInstance) return;

        setIsSearching(true);
        try {
            const result = await searchParcels(searchQuery.trim());
            
            if (result.features && result.features.length > 0) {
                const feature = result.features[0];

                if (feature.geometry && 'coordinates' in feature.geometry) {
                    const bbox = calculateBoundingBox(feature.geometry.coordinates);
                    
                    if (bbox) {
                        mapInstance.fitBounds([[bbox.minX, bbox.minY], [bbox.maxX, bbox.maxY]], {
                            padding: 50,
                            maxZoom: 18
                        });
                        
                        setTimeout(() => {
                            highlightAndPopupParcel(mapInstance, feature, [bbox.centerX, bbox.centerY]);
                        }, 500);
                    }
                }
            } else {
                alert('Parcel not found');
            }
        } catch (err) {
            console.error(err);
            alert('Error during search');
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className={styles.searchContainer}>
            <form onSubmit={handleSearch} className={styles.searchForm}>
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Hledat parcelu (např. 314)..." 
                    className={styles.searchInput}
                    disabled={isSearching}
                />
                <button type="submit" disabled={isSearching} className={styles.searchButton}>
                    {isSearching ? '...' : 'Hledat'}
                </button>
            </form>
        </div>
    );
}
