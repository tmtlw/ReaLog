
export interface ChangeLogItem {
    version: string;
    date: string;
    changes: string[];
}

export const APP_VERSION = "4.7.4";

export const CHANGELOG: ChangeLogItem[] = [
    {
        version: "4.7.4",
        date: "2024-12-12",
        changes: [
            "Javítás: Kritikus rendszerfájl (index.tsx) helyreállítása a GitHub szinkronizációhoz.",
            "Rendszer: Verziókövetés szinkronizálása."
        ]
    },
    {
        version: "4.7.3",
        date: "2024-12-12",
        changes: [
            "Új funkció: Időbélyegző gomb a szerkesztőben (aktuális idő beszúrása).",
            "Új funkció: Obsidian / Markdown exportálás (.zip csomagban, mapparendszerrel).",
            "UI fejlesztés: Vizuális folyamatjelző sáv a napi szószám cél követéséhez."
        ]
    },
    {
        version: "4.7.2",
        date: "2024-12-10",
        changes: [
            "UI frissítés: Beállítások/Fiók fül egyszerűsítése.",
            "Javítás: Frissítés ellenőrző felület vizuális visszajelzéseinek pontosítása.",
            "Dokumentáció: Részletes README és útmutatók frissítése."
        ]
    },
    {
        version: "4.7.1",
        date: "2024-12-10",
        changes: [
            "Refaktorálás: Beállítások modal szétbontása különálló komponensekre.",
            "Javítás: Hierarchikus nézet beállításai most már teljes körűen elérhetők.",
            "Konfiguráció: GitHub update repository frissítve."
        ]
    },
    {
        version: "4.7.0",
        date: "2024-12-10",
        changes: [
            "Új funkció: Frissítések ellenőrzése GitHub-ról a 'Rólam' menüpontban.",
            "UI fejlesztés: Frissítés gomb és újdonságok megjelenítése a verziószám mellett.",
            "Konfiguráció: GITHUB_CONFIG hozzáadása."
        ]
    },
    {
        version: "4.6.0",
        date: "2024-12-09",
        changes: [
            "Új funkció: Interaktív helyszínválasztó térkép a bejegyzések szerkesztésekor.",
            "Új funkció: Helyek mentése (pl. Otthon, Munkahely) a gyorsabb kiválasztáshoz.",
            "Javítás: Az időjárás lekérése mostantól a választott helyszín alapján történik.",
            "UI frissítés: Modern helyszínválasztó modal."
        ]
    },
    {
        version: "4.5.6",
        date: "2024-12-08",
        changes: [
            "Javítás: Service Worker hibajavítások.",
            "Új funkció: Egyéni betűtípusok és Emoji fontok szerverre mentése.",
            "Optimalizáció: Offline font támogatás integrálása."
        ]
    }
];
