export interface ChangeLogItem {
    version: string;
    date: string;
    changes: string[];
}

export const APP_VERSION = "3.0.0";

export const CHANGELOG: ChangeLogItem[] = [
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