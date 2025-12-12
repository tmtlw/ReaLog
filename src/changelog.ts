
export interface ChangeLogItem {
    version: string;
    date: string;
    changes: string[];
}

export const APP_VERSION = "4.7.7";

export const CHANGELOG: ChangeLogItem[] = [
    {
        version: "4.7.7",
        date: "2024-12-13",
        changes: [
            "Javítás: Frissítési folyamat hibatűrésének javítása (API 404 Fallback).",
            "Javítás: Instabil Emoji font CDN linkek cseréje fix verziókra.",
            "Stabilitás: Témakezelő és fontletöltő modul optimalizálása."
        ]
    },
    {
        version: "4.7.6",
        date: "2024-12-12",
        changes: [
            "Új funkció: WordPress-szerű, biztonságos frissítési folyamat.",
            "Biztonság: Automatikus rendszermentés (System Backup) frissítés előtt.",
            "Javítás: Frissítési hiba (404) kezelése fallback mechanizmussal.",
            "UI: Részletes állapotjelző a frissítés során."
        ]
    },
    {
        version: "4.7.5",
        date: "2024-12-12",
        changes: [
            "Javítás: Hibás Emoji betűtípusok (CDN 404) javítása/eltávolítása.",
            "Optimalizáció: Stabilabb font betöltés.",
            "Rendszer: Verziókövetés frissítése."
        ]
    },
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
    }
];
