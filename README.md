
# ReaLog (Grind Napló) v4.7.2

A **ReaLog** egy modern, minimalista, mégis funkciókban gazdag naplózó és életkövető webalkalmazás. Különlegessége, hogy nem igényel adatbázist (MySQL, stb.), az adatokat strukturált JSON fájlokban tárolja, így könnyen hordozható, menthető és saját szerveren (PHP vagy Node.js környezetben) is futtatható.

![Főképernyő](https://placehold.co/800x400?text=ReaLog+Dashboard+Screenshot)

## Fő Funkciók

### 1. Strukturált Naplózás (Grind Mode)
A rendszer alapja a tudatos fejlődés. Előre definiált kérdések segítenek a nap, hét, hónap vagy év értékelésében.
*   **Kategóriák:** Napi, Heti, Havi, Éves bontás.
*   **Grind Coach:** Specifikus kérdések (pl. "Mi volt a mai győzelem?", "Miben fejlődtem?").
*   **Szabad mód:** Ha csak írni szeretnél, kikapcsolhatod a kérdéseket.

### 2. Interaktív Világtérkép (Atlasz)
A bejegyzésekhez csatolt GPS koordináták alapján egy interaktív térképen láthatod, merre jártál.
*   **Helyszínválasztó:** Beépített térképes választó a pontos pozíció megadásához.
*   **Szűrés:** Csak a publikus vagy privát helyek megjelenítése.

![Térkép Nézet](https://placehold.co/800x400?text=Atlas+Map+View)

### 3. Média Galéria
A bejegyzésekhez csatolt fotók egy modern, rács elrendezésű galériában is megtekinthetők.
*   **Drag & Drop:** Egyszerű képfeltöltés.
*   **Lightbox:** Teljes képernyős megtekintés.

### 4. Statisztikák és Elemzések
Részletes kimutatások a szokásaidról és hangulatodról.
*   **Hangulat eloszlás:** Kördiagram a leggyakoribb hangulatokról.
*   **Hőtérkép (Heatmap):** Az elmúlt év aktivitása (GitHub stílusban).
*   **Összefüggések:** Hogyan hat az időjárás vagy a hét napja a hangulatodra?
*   **Streak (Sorozat):** Motivációs számláló a folyamatos naplózáshoz.

![Statisztika](https://placehold.co/800x400?text=Statistics+Dashboard)

### 5. Időjárás Integráció
A rendszer automatikusan lekéri és rögzíti az időjárást a megadott helyszín alapján (OpenWeatherMap API).
*   Hőmérséklet, időjárási kép és leírás mentése a bejegyzés mellé.

### 6. Technikai Jellemzők
*   **Adatbázis-mentes:** Minden adat JSON fájlokban van.
*   **Offline First (PWA):** Telepíthető mobilra és asztali gépre, offline is működik (szinkronizál, amint van net).
*   **Titkosítás:** Kliens oldali admin jelszó védelem.
*   **Témák:** Sötét, Világos, Levendula és Ünnepi (Karácsony, Halloween, stb.) témák.
*   **Export/Import:** Teljes biztonsági mentés JSON-ban, vagy e-könyv (EPUB/PDF) generálás.

## Telepítés

A program futtatásához egy egyszerű webszerverre van szükség. Két mód támogatott:

1.  **PHP Mód (Ajánlott tárhelyekhez):**
    *   Töltsd fel a fájlokat.
    *   Használd az `api.php`-t backendként.
    *   Állítsd be a `chmod 755`-öt a mappákra.

2.  **Node.js (CGI) Mód:**
    *   Használd az `api.jscript`-et backendként.
    *   Szükséges hozzá `.htaccess` konfiguráció a CGI futtatáshoz.

## Fejlesztés

A projekt React + TypeScript + Vite alapokon nyugszik.

```bash
# Függőségek telepítése
npm install

# Fejlesztői szerver indítása
npm run dev
```

---
*Készítette: TMTLW*
