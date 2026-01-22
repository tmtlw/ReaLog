


export const APP_VERSION = "5.8";

export const CHANGELOG = [
    {
        version: "5.8",
        date: "2024-12-16",
        changes: [
            "Javításások automatikus helyreállítása betöltéskor.",
            "UI helyszín címe elemekre bontható és részleteiben törölhető.",
            "Beállításokői mód kapcsoló a 'Rólam' fülön (Titkos témákhoz)."
        ]
    },
    {
        version: "5.7",
        date: "2024-12-16",
        changes: [
            "UI 'Helyszín & Időjárás' gomb a térképes választót nyitja meg.",
            "UIűsített szerkesztő eszköztár."
        ]
    },
    {
        version: "5.6",
        date: "2024-12-16",
        changes: [
            "UIín választó modal visszakerült a szerkesztőbe.",
            "Logicérdéseknél kategóriánként csak 1 lehet aktív.",
            "UIások listája a szerkesztő aljára került."
        ]
    },
    {
        version: "5.5",
        date: "2024-12-16",
        changes: [
            "Téma: Új színtémák (Nord, Forest, Cyberpunk, stb.).",
            "Rendszer-Meteo időjárás integráció.",
            "UIőjárás ikonok megjelenítése mindenhol."
        ]
    },
    {
        version: "5.4",
        date: "2024-12-15",
        changes: [
            "UIűtípus és betűméret testreszabása.",
            "Témaéni téma készítő (színek, háttér).",
            "Funkció emojik testreszabása."
        ]
    },
    {
        version: "5.3",
        date: "2024-12-14",
        changes: [
            "Funkcióészletes Szokáskövető (Habit Tracker).",
            "UI: Új 'Rólam' fül a beállításokban.",
            "Rendszer biztonsági mentés optimalizálás."
        ]
    },
    {
        version: "5.2",
        date: "2024-12-13",
        changes: [
            "Nézetár nézet bevezetése.",
            "Statisztika (sorozat) számláló és motivációs üzenetek.",
            "UI menü újratervezése."
        ]
    },
    {
        version: "5.0",
        date: "2024-12-10",
        changes: [
            "Core újraírás React + TypeScript alapokon.",
            "UI, reszponzív felület (TailwindCSS).",
            "Adat: Új, szeparált fájlstruktúra a szerveren (kérdések, bejegyzések külön)."
        ]
    },
    {
        version: "4.8",
        date: "2024-11-20",
        changes: [
            "Funkcióérképes helyszínválasztó (Leaflet).",
            "Funkcióéria nézet.",
            "Rendszer backend támogatás és képfeltöltés."
        ]
    },
        {
        version: "4.7.2",
        date: "2024-12-10",
        changes: [
            "UI frissítésállítások/Fiók fül egyszerűsítése (Emoji lista eltávolítása).",
            "Javításítés ellenőrző felület vizuális visszajelzéseinek pontosítása (Hiba/Naprakész állapotok).",
            "Dokumentációészletes README és útmutatók frissítése."
        ]
    },
    {
        version: "4.7.1",
        date: "2024-12-10",
        changes: [
            "Refaktorálásállítások modal szétbontása különálló komponensekre a könnyebb karbantarthatóság érdekében.",
            "Javítás nézet beállításai most már teljes körűen (Napi/Heti/Havi/Éves egymásba ágyazhatóság) elérhetők.",
            "Konfiguráció update repository frissítve 'tmtlw/ReaLog'-ra."
        ]
    },
    {
        version: "4.7.0",
        date: "2024-12-10",
        changes: [
            "Új funkcióítések ellenőrzése GitHub-ról a 'Rólam' menüpontban.",
            "UI fejlesztésítés gomb és újdonságok megjelenítése a verziószám mellett.",
            "Konfiguráció hozzáadása a constants.ts fájlhoz."
        ]
    },
    {
        version: "4.6.0",
        date: "2024-12-09",
        changes: [
            "Új funkcióív helyszínválasztó térkép a bejegyzések szerkesztésekor.",
            "Új funkció mentése (pl. Otthon, Munkahely) a gyorsabb kiválasztáshoz.",
            "Javítás időjárás lekérése mostantól a választott helyszín alapján történik, nem csak az aktuális GPS pozícióból.",
            "UI frissítés helyszínválasztó modal."
        ]
    },
    {
        version: "4.5.6",
        date: "2024-12-08",
        changes: [
            "Javítás Worker 'chrome-extension' hiba javítása, csak valid http kérések gyorsítótárazása.",
            "Új funkcióéni betűtípusok és Emoji fontok (OpenMoji, Emojidex) szerverre mentése (fonts mappa).",
            "UI javítás betűtípus helyes alkalmazása a Rólam oldalon.",
            "Optimalizáció font támogatás integrálása."
        ]
    },
    {
        version: "4.5.5",
        date: "2024-12-08",
        changes: [
            "Javításólam menüpont 'ReaLog' felirat betűtípusa (Lobster) most már helyesen jelenik meg.",
            "Új funkció betűtípusok (OpenMoji, Emojidex) mentése szerverre első kiválasztáskor (offlineFonts támogatás).",
            "Optimalizációális stílusok finomhangolása az öröklődés javítására."
        ]
    },
    {
        version: "4.5.4",
        date: "2024-12-08",
        changes: [
            "Javítás betűtípusok betöltésének optimalizálása (font ütközések feloldása).",
            "UI javítás Kinézet szerkesztőben a fülek mostantól görgethetők, nem nyomódnak össze.",
            "Kuka: 'Kuka ürítése' gomb hozzáadása a végleges törléshez.",
            "Vázlat kezelés: Új bejegyzés létrehozásakor a 'Mégse' gomb törli a vázlatot."
        ]
    },
    {
        version: "4.5.3",
        date: "2024-12-08",
        changes: [
            "Javítás Worker telepítési hiba javítása (CORS kezelés a külső CDN forrásoknál).",
            "Stabilizálás működés megbízhatóságának növelése."
        ]
    },
    {
        version: "4.5.2",
        date: "2024-12-08",
        changes: [
            "Javítás Worker (sw.js) hozzáadása a telepítő csomaghoz, így a szerver helyesen szolgálja ki a fájlt.",
            "Gyorsítótárazás betűtípusok offline elérése (OpenMoji, Emojidex) a helyi tárból."
        ]
    },
    {
        version: "4.5.1",
        date: "2024-12-08",
        changes: [
            "Teljesítmény Emoji betűtípusok (OpenMoji, Emojidex) mostantól a helyi gyorsítótárból (Cache) töltődnek be az első indítás után, így gyorsabb a megjelenés és működnek offline módban is.",
            "Javításási javítások a Kinézet szerkesztőben."
        ]
    },
    {
        version: "4.5.0",
        date: "2024-12-08",
        changes: [
            "AI Funkciók kivezetése rendszer mostantól teljesen offline/szerver alapú.",
            "Emoji Stílusok kiterjesztése választott stílus mostantól a Statisztikákban és minden egyéb felületen is egységesen megjelenik.",
            "Biztonsági Mentésözvetlen elérés a menüből az adatbiztonság növelése érdekében.",
            "Új Emoji készletek Noto, OpenMoji, Emojidex integráció."
        ]
    },
    {
        version: "4.4.1",
        date: "2024-12-07",
        changes: [
            "Végtelen görgetés (Infinite Scroll) lista nézetek (Grid, Timeline, Galéria, stb.) mostantól automatikusan töltenek be további bejegyzéseket görgetéskor.",
            "UI frissítés Rólam fülön a 'ReaLog' felirat Lobster betűtípussal jelenik meg.",
            "Optimalizáció teljesítmény nagy mennyiségű bejegyzés esetén."
        ]
    },
    {
        version: "4.4.0",
        date: "2024-12-05",
        changes: [
            "PWA Támogatás offline működés és alkalmazásként való telepíthetőség mobilra.",
            "Új funkció Inspiráló Idézet a főoldalon.",
            "Szinkronizációáttérben futó adatfeltöltés online állapotba kerüléskor."
        ]
    },
    {
        version: "4.3.0",
        date: "2024-11-12",
        changes: [
            "Statisztika aktivitás hőtérkép mostantól 1 évet fed le, és a hónapok organikusabban (heti bontásban) jelennek meg.",
            "Sorozat (Streak) Nézet, kompaktabb naptár kockák, és javított megjelenés sötét módban.",
            "Új funkcióáfia testreszabása (Kinézet menü). Választható Google Fonts, állítható betűméret, vagy saját betűtípus feltöltése.",
            "Angol fordítás frissítése az új funkciókhoz."
        ]
    },
    {
        version: "4.2.0",
        date: "2024-10-27",
        changes: [
            "Új funkcióímke Menedzser (Címkék átnevezése, törlése és összevonása).",
            "Statisztika bővítése: Összefüggések elemzése (Időjárás és Napok hatása a hangulatra).",
            "Rács (Grid) nézet bővítéseálasztható Standard és Masonry (Pinterest-szerű) elrendezés a beállításokban.",
            "Gazdag mintaadatok (GPS, Fotók, Időjárás) generálása a funkciók azonnali teszteléséhez."
        ]
    },
    {
        version: "4.1.0",
        date: "2024-09-01",
        changes: [
            "Új funkció (Rich Text) szerkesztő minden beviteli mezőhöz (Félkövér, Dőlt, Listák, Linkek).",
            "Új funkció-könyv (EPUB) exportálás.",
            "Új funkcióó könyv (PDF) exportálás.",
            "Fiók beállítások bővítéseép és Könyvborító feltöltése az exporthoz.",
            "Exportálás szűréseát bejegyzések kihagyásának lehetősége."
        ]
    },
    {
        version: "4.0.0",
        date: "2024-08-15",
        changes: [
            "Új funkcióészletes Statisztikák (Hangulatgörbe, Aktivitás hőtérkép).",
            "Új funkcióátékosítás (Streak/Sorozat számláló a fejlécen).",
            "Új funkció kezelése (Saját kérdéssorok mentése és betöltése).",
            "A statisztika és játékosítás opcionálisan kikapcsolható a beállításokban.",
            "Optimalizált szerkesztő felület."
        ]
    },
    {
        version: "3.5.0",
        date: "2024-07-25",
        changes: [
            "Azonnali vázlat mentés új bejegyzéskor (adatvesztés elkerülése).",
            "Automatikus mentés percenként szerkesztés közben.",
            "Kuka (Lomtár) bevezetése: a törölt elemek visszaállíthatók.",
            "Végleges törlés csak a Kukából lehetséges.",
            "Kuka nézet az admin menüben.",
            "Minta adatok bővítése helyszín és időjárás adatokkal."
        ]
    },
    {
        version: "3.4.0",
        date: "2024-07-05",
        changes: [
            "Téma Létrehozó bővítése: 8 helyett 50 féle kiemelő szín.",
            "Az egyéni téma beállításai (alap + szín) mentésre kerülnek.",
            "Kinézet szerkesztő felület optimalizálása a több színhez."
        ]
    },
    {
        version: "3.3.0",
        date: "2024-06-25",
        changes: [
            "Automatikus mentés (1 percenként) és Vázlat (Draft) státusz kezelése.",
            "Biztonsági figyelmeztetés nem mentett változások esetén navigáláskor.",
            "Vázlatok vizuális megkülönböztetése a listában.",
            "Rólam fül elrendezés javítása (fix fejléc/lábléc)."
        ]
    },
    {
        version: "3.2.0",
        date: "2024-06-15",
        changes: [
            "Többnyelvűség támogatása (Magyar, Angol).",
            "Nyelvválasztó a Beállítások / Fiók menüpontban.",
            "Új 'langs' könyvtár a nyelvi fájlok kezelésére."
        ]
    },
    {
        version: "3.1.0",
        date: "2024-06-01",
        changes: [
            "Új funkció: 'Mai napon' nézet - visszatekintő az elmúlt évek azonos napjaira.",
            "Új funkcióímke (#hashtag) kezelés és Címkefelhő nézet.",
            "Automatikus címke kinyerés és mentés szerver oldalra (tags.json).",
            "Hashtag alapú szűrés és keresés."
        ]
    },
    {
        version: "3.0.0",
        date: "2024-05-22",
        changes: [
            "Felhő szinkronizáció kivezetése a rendszerből.",
            "Új 'Rólam' információs panel a beállításokban.",
            "Változásnapló (Changelog) integrálása.",
            "UI tisztítás és optimalizálás."
        ]
    },
    {
        version: "2.9.0",
        date: "2024-05-10",
        changes: [
            "Session kezelés belépés megjegyzése 30 napig.",
            "Továbbfejlesztett biztonsági mentés logika.",
            "Kisebb hibajavítások a telepítőben."
        ]
    },
    {
        version: "2.6.0",
        date: "2024-04-15",
        changes: [
            "Saját szerver támogatás (Node.js és PHP backend).",
            "Fájl alapú adattárolás (JSON szétválasztás).",
            ".htaccess konfigurációk automatikus generálása.",
            "Képfeltöltés optimalizálása."
        ]
    },
    {
        version: "2.0.0",
        date: "2024-03-01",
        changes: [
            "Teljes újraírás React alapokon.",
            "Modern UI/UX design (Tailwind CSS).",
            "Moduláris felépítés bevezetése.",
            "Gemini AI integráció a bejegyzések elemzéséhez.",
            "Térkép (Atlasz) és Galéria nézetek."
        ]
    },
    {
        version: "1.0.0",
        date: "2023-11-20",
        changes: [
            "Első nyilvános verzió.",
            "Alapvető naplózási funkciók (Napi, Heti, Havi).",
            "Lokális adattárolás (LocalStorage)."
        ]
    }
];
