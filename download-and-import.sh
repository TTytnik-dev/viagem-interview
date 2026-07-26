#!/bin/bash
set -e

# Go to project root
cd "$(dirname "$0")"

mkdir -p data/temp_gml
cd data/temp_gml

# Cadastral territory codes for Jičín district and surroundings
# 659541 - Jičín
# 724530 - Dílce
# 659631 - Bartoušov u Jičíněvsi
# 601101 - Bašnice
# 601462 - Běchary
# 694991 - Bačalky
CODES=(659541 724530 659631 601101 601462 694991)

echo "Downloading data (6 cadastral territories)..."
for CODE in "${CODES[@]}"; do
    echo "Downloading $CODE..."
    wget -O "${CODE}.zip" "https://services.cuzk.gov.cz/gml/inspire/cp/epsg-4258/${CODE}.zip" || echo "Failed to download ${CODE}.zip"
    unzip -o "${CODE}.zip" || echo "Failed to unzip ${CODE}.zip"
done

echo "Directory contents after download:"
ls -la

echo "Merging data into a single GeoJSON..."
# Remove old file if it exists
rm -f ../raw/parcels.geojson

FIRST=1
for GML in *.xml; do
    if [ ! -f "$GML" ]; then
        echo "No .xml files found! Something went wrong during download."
        exit 1
    fi
    echo "Converting $GML..."
    if [ $FIRST -eq 1 ]; then
        ogr2ogr -f GeoJSON -t_srs EPSG:4326 ../raw/parcels.geojson "$GML" CadastralParcel
        FIRST=0
    else
        ogr2ogr -f GeoJSON -append -t_srs EPSG:4326 ../raw/parcels.geojson "$GML" CadastralParcel
    fi
done

cd ../..
rm -rf data/temp_gml

echo "Importing data into the database..."
php backend/scripts/import-data.php

echo "Done! Data successfully loaded."
