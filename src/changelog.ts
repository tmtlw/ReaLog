
export interface ChangeLogItem {
    version: string;
    date: string;
    changes: string[];
}

export const APP_VERSION = "4.7.0";

export const CHANGELOG: ChangeLogItem[] = [
    {
        version: "4.7.0",
        date: "2024-12-10",
        changes: [
            "Új funkció: Frissítések ellenőrzése GitHub-ról a 'Rólam' menüpontban.",
            "UI fejlesztés: Frissítés gomb és újdonságok megjelenítése a verziószám mellett.",
            "Konfiguráció: GITHUB_CONFIG hozzáadása a constants.ts fájlhoz."
        ]
    },
    {
        version: "4.6.0",
        date: "2024-12-09",
        changes: [
            "Új funkció: Interaktív helyszínválasztó térkép a bejegyzések szerkesztésekor.",
            "Új funkció: Helyek mentése (pl. Otthon, Munkahely) a gyorsabb kiválasztáshoz.",
            "Javítás: Az időjárás lekérése mostantól a választott helyszín alapján történik, nem csak az aktuális GPS pozícióból.",
            "UI frissítés: Modern helyszínválasztó modal."
        ]
    },
    {
        version: "4.5.6",
        date: "2024-12-08",
        changes: [
            "Javítás: Service Worker 'chrome-extension' hiba javítása, csak valid http kérések gyorsítótárazása.",
            "Új funkció: Egyéni betűtípusok és Emoji fontok (OpenMoji, Emojidex) szerverre mentése (fonts mappa).",
            "UI javítás: Lobster betűtípus helyes alkalmazása a Rólam oldalon.",
            "Optimalizáció: Offline font támogatás integrálása."
        ]
    },
    {
        version: "4.5.5",
        date: "2024-12-08",
        changes: [
            "Javítás: Rólam menüpont 'ReaLog' felirat betűtípusa (Lobster) most már helyesen jelenik meg.",
            "Új funkció: Emoji betűtípusok (OpenMoji, Emojidex) mentése szerverre első kiválasztáskor (offlineFonts támogatás).",
            "Optimalizáció: Globális stílusok finomhangolása az öröklődés javítására."
        ]
    },
    {
        version: "4.5.4",
        date: "2024-12-08",
        changes: [
            "Javítás: Emoji betűtípusok betöltésének optimalizálása (font ütközések feloldása).",
            "UI javítás: A Kinézet szerkesztőben a fülek mostantól görgethetők, nem nyomódnak össze.",
            "Kuka: 'Kuka ürítése' gomb hozzáadása a végleges törléshez.",
            "Vázlat kezelés: Új bejegyzés létrehozásakor a 'Mégse' gomb törli a vázlatot."
        ]
    },
    {
        version: "4.5.3",
        date: "2024-12-08",
        changes: [
            "Javítás: Service Worker telepítési hiba javítása (CORS kezelés a külső CDN forrásoknál).",
            "Stabilizálás: Offline működés megbízhatóságának növelése."
        ]
    },
    {
        version: "4.5.2",
        date: "2024-12-08",
        changes: [
            "Javítás: Service Worker (sw.js) hozzáadása a telepítő csomaghoz, így a szerver helyesen szolgálja ki a fájlt.",
            "Gyorsítótárazás: Emoji betűtípusok offline elérése (OpenMoji, Emojidex) a helyi tárból."
        ]
    },
    {
        version: "4.5.1",
        date: "2024-12-08",
        changes: [
            "Teljesítmény: Az Emoji betűtípusok (OpenMoji, Emojidex) mostantól a helyi gyorsítótárból (Cache) töltődnek be az első indítás után, így gyorsabb a megjelenés és működnek offline módban is.",
            "Javítás: Stabilitási javítások a Kinézet szerkesztőben."
        ]
    },
    {
        version: "4.5.0",
        date: "2024-12-08",
        changes: [
            "AI Funkciók kivezetése: A rendszer mostantól teljesen offline/szerver alapú.",
            "Emoji Stílusok kiterjesztése: A választott stílus mostantól a Statisztikákban és minden egyéb felületen is egységesen megjelenik.",
            "Biztonsági Mentés: Közvetlen elérés a menüből az adatbiztonság növelése érdekében.",
            "Új Emoji készletek: Google Noto, OpenMoji, Emojidex integráció."
        ]
    },
    {
        version: "4.4.1",
        date: "2024-12-07",
        changes: [
            "Végtelen görgetés (Infinite Scroll): A lista nézetek (Grid, Timeline, Galéria, stb.) mostantól automatikusan töltenek be további bejegyzéseket görgetéskor.",
            "UI frissítés: A Rólam fülön a 'ReaLog' felirat Lobster betűtípussal jelenik meg.",
            "Optimalizáció: Jobb teljesítmény nagy mennyiségű bejegyzés esetén."
        ]
    },
    {
        version: "4.4.0",
        date: "2024-12-05",
        changes: [
            "PWA Támogatás: Teljes offline működés és alkalmazásként való telepíthetőség mobilra.",
            "Új funkció: Napi Inspiráló Idézet a főoldalon.",
            "Szinkronizáció: Háttérben futó adatfeltöltés online állapotba kerüléskor."
        ]
    },
    {
        version: "4.3.0",
        date: "2024-11-12",
        changes: [
            "Statisztika: Az aktivitás hőtérkép mostantól 1 évet fed le, és a hónapok organikusabban (heti bontásban) jelennek meg.",
            "Sorozat (Streak) Nézet: Kisebb, kompaktabb naptár kockák, és javított megjelenés sötét módban.",
            "Új funkció: Tipográfia testreszabása (Kinézet menü). Választható Google Fonts, állítható betűméret, vagy saját betűtípus feltöltése.",
            "Angol fordítás frissítése az új funkciókhoz."
        ]
    },
    {
        version: "4.2.0",
        date: "2024-10-27",
        changes: [
            "Új funkció: Címke Menedzser (Címkék átnevezése, törlése és összevonása).",
            "Statisztika bővítése: Összefüggések elemzése (Időjárás és Napok hatása a hangulatra).",
            "Rács (Grid) nézet bővítése: Választható Standard és Masonry (Pinterest-szerű) elrendezés a beállításokban.",
            "Gazdag mintaadatok (GPS, Fotók, Időjárás) generálása a funkciók azonnali teszteléséhez."
        ]
    },
    {
        version: "4.1.0",
        date: "2024-09-01",
        changes: [
            "Új funkció: WYSIWYG (Rich Text) szerkesztő minden beviteli mezőhöz (Félkövér, Dőlt, Listák, Linkek).",
            "Új funkció: E-könyv (EPUB) exportálás.",
            "Új funkció: Nyomtatható könyv (PDF) exportálás.",
            "Fiók beállítások bővítése: Profilkép és Könyvborító feltöltése az exporthoz.",
            "Exportálás szűrése: Privát bejegyzések kihagyásának lehetősége."
        ]
    },
    {
        version: "4.0.0",
        date: "2024-08-15",
        changes: [
            "Új funkció: Részletes Statisztikák (Hangulatgörbe, Aktivitás hőtérkép).",
            "Új funkció: Játékosítás (Streak/Sorozat számláló a fejlécen).",
            "Új funkció: Sablonok kezelése (Saját kérdéssorok mentése és betöltése).",
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
            "Új funkció: Címke (#hashtag) kezelés és Címkefelhő nézet.",
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
            "Session kezelés: Admin belépés megjegyzése 30 napig.",
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
