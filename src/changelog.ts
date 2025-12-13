
export interface ChangeLogItem {
    version: string;
    date: string;
    changes: string[];
}

export const APP_VERSION = "4.8.3";

export const CHANGELOG: ChangeLogItem[] = [
    {
        version: "4.8.3",
        date: "2024-12-14",
        changes: [
            "Javítás: Szokások kezelőjében (Új hozzáadása) a szám és mértékegység mezők színeinek javítása sötét módban."
        ]
    },
    {
        version: "4.8.2",
        date: "2024-12-14",
        changes: [
            "Funkció: Szokások szerkesztése (név, cél, mértékegység) a kezelőfelületen.",
            "UI: Számlálós szokásoknál (pl. víz) közvetlen érték megadása input mezővel.",
            "Javítás: Kisebb UI igazítások a sötét módban."
        ]
    },
    {
        version: "4.8.1",
        date: "2024-12-14",
        changes: [
            "Javítás: Szokások mentése és betöltése (Storage & Server Sync).",
            "Javítás: Sötét módban a beviteli mezők szövegszínének korrigálása.",
            "Javítás: Új bejegyzés létrehozásakor a szokások most már megjelennek."
        ]
    }
];
