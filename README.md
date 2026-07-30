# Czech Cadastre Map

Interaktivní webová aplikace pro zobrazení katastrálních parcel v České republice. Aplikace dynamicky načítá geometrie parcel podle aktuálního výřezu mapy (bounding box) a po kliknutí na parcelu zobrazuje její základní informace. Projekt je zaměřen na čistou architekturu, vysoký výkon a plynulé vykreslování většího množství geografických dat.

## Stack

### Backend
- PHP 8.3
- Slim Framework 4
- PHP-DI
- SQLite přes PDO

### Frontend
- React 18
- TypeScript
- Vite
- MapLibre GL JS

## Struktura projektu

```text
czech-cadastre-map/
├── backend/               # PHP Slim 4 API
│   ├── public/            # Vstupní bod (index.php)
│   ├── src/
│   │   ├── Bootstrap/     # Dependency Injection & Routes
│   │   ├── Controller/    # HTTP vrstva
│   │   ├── Database/      # Připojení k SQLite
│   │   ├── Repository/    # Databázové dotazy
│   │   └── Service/       # Byznys logika (transformace do GeoJSON)
│   └── scripts/           # Skripty pro inicializaci DB a import dat
├── data/
│   └── raw/               # Zdrojová GeoJSON data (gitignored)
├── frontend/              # React + Vite + MapLibre GL
│   └── src/
│       ├── api/           # Komunikace s API (fetch)
│       ├── components/    # UI Komponenty (MapView, SearchForm)
│       ├── hooks/         # Vlastní hooky (useParcels, useMap)
│       └── map/           # Modulární logika mapy (parcelLayers, parcelPopup, parcelSelection)
└── README.md
```

## Funkcionalita

### Implementováno

- Zobrazení katastrálních parcel dynamicky podle bounding boxu mapy.
- Vysoce výkonné vykreslování polygonů pomocí MapLibre GL (WebGL).
- Detail parcely po kliknutí (popup s číslem parcely, katastrem a výměrou).
- Vizuální zvýraznění vybrané parcely.
- Debounced API požadavky (300 ms) během pohybu mapou pro plynulý UX.
- Vyhledávání parcely podle čísla s automatickým vycentrováním mapy.
- CORS middleware pro lokální vývoj.

### Architektonická rozhodnutí

- **Lokální SQLite databáze namísto live WFS:**  
 Služba WFS ČÚZK má vyšší latenci a limity v počtu vrácených objektů. Proto jsou data jednorázově stažena, transformována do EPSG:4326 a uložena lokálně do SQLite databáze. Díky tomu může aplikace poskytovat velmi rychlé odpovědi na dotazy podle aktuálního výřezu mapy.

- **Vlastní BBox indexace v SQLite:**  
  Abych se vyhnul složité kompilaci rozšíření SpatiaLite, implementoval jsem ruční bounding box indexaci. Tabulka obsahuje sloupce `min_x, max_x, min_y, max_y` se složeným indexem, což umožňuje SQLite vracet viditelné parcely v milisekundách.

- **MapLibre GL JS namísto Leaflet:**  
  MapLibre GL využívá WebGL k renderování vektorových vrstev. Na rozdíl od Leafletu, který při tisících DOM elementů zpomaluje, MapLibre zůstává plynulý i při vykreslování větších GeoJSON datasetů.

- **Čistá architektura (Clean Architecture):**
  - **Backend** používá DI Container (PHP-DI) a vrstvení: `Controller → Service → Repository`.
  - **Frontend** je striktně rozdělen na:
    - **React komponenty** (`MapView`, `SearchForm`)
    - **Vlastní hooky** (`useParcels`, `useMap`)
    - **Modulární logiku mapy** (`parcelLayers.ts`, `parcelPopup.ts`, `parcelSelection.ts` - striktní rozdělení zodpovědností)
    - **API vrstvu** (`parcelApi.ts`)

### Technické výzvy

- Transformace souřadnicového systému (EPSG:5514 → WGS84) a parsování GML ze strany ČÚZK byla nejsložitější část přípravy dat.
- Konfigurace MapLibre GL Web Workeru ve Vite vyžadovala úpravy v vite.config.ts.
- Při spuštění download-and-import.sh se objevila chyba bad interpreter: /bin/bash^M: no such file or directory. Příčinou byly Windows (CRLF) konce řádků ve skriptu. Po převodu na LF skript funguje správně.

### Možná budoucí rozšíření

- Stahování dat: Implementoval bych robustní CLI skript v PHP pro stahování a paginaci dat z WFS přímo do databáze, namísto závislosti na externích nástrojích (QGIS / ogr2ogr).
- Vektorové dlaždice (Vector Tiles): Při přechodu na celou ČR bych opustil GeoJSON a servíroval data jako MVT (Mapbox Vector Tiles) generované na backendu.
- Testy: Přidal bych PHPUnit testy pro repository a service vrstvu.

## Spuštění aplikace

### Předpoklady

- PHP 8.2+ s rozšířením pdo_sqlite
- Composer
- Node.js a npm

### Backend
Přejděte do složky backend:
```bash
cd backend
composer install
```
Inicializujte databázi:
```bash
php scripts/init-db.php
```
Importujte data:

#### Varianta A: automatický import

Můžete využít připravený bash skript v kořenovém adresáři, který automaticky stáhne a zkonvertuje GML data z ČÚZK (vyžaduje wget, unzip a ogr2ogr / GDAL):
```bash
cd ..
chmod +x download-and-import.sh
./download-and-import.sh
```
Pokud se objeví chyba bad interpreter: /bin/bash^M, skript má Windows (CRLF) konce řádků. Stačí je převést na LF, například:
```bash
sed -i 's/\r$//' download-and-import.sh
```
#### Varianta B: ruční import

Pokud již máte soubor data/raw/parcels.geojson, spusťte import ručně:
```bash
php scripts/import-data.php
```

Spusťte PHP server:

```bash
php -S localhost:8000 -t public public/index.php
```

### Frontend

Přejděte do složky frontend a nainstalujte závislosti:

```bash
cd frontend
npm install
```

Vytvořte soubor .env s adresou backendu:
```text
VITE_API_URL=http://localhost:8000
```
Spusťte dev server:
```bash
npm run dev
```

Otevřete prohlížeč na adrese:
```text
http://localhost:5173
```

---

Po spuštění aplikace bude dostupná interaktivní mapa s dynamickým načítáním parcel podle aktuálního výřezu mapy. Parcelu lze vyhledat podle čísla nebo vybrat kliknutím přímo na mapě, čímž se zobrazí její detail.
