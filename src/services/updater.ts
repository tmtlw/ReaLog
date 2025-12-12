
import { GITHUB_CONFIG } from '../constants';
import { getApiUrl } from './storage';

const BRANCH = GITHUB_CONFIG.BRANCH || 'main';
const BASE_URL = `https://raw.githubusercontent.com/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/${BRANCH}`;

export const performUpdate = async (
    onProgress: (step: string, progress: number) => void
): Promise<void> => {
    try {
        // 1. Fetch Index to determine file list
        onProgress("Kritikus fájlok listázása...", 10);
        const indexRes = await fetch(`${BASE_URL}/index.html?t=${Date.now()}`);
        if (!indexRes.ok) throw new Error("Nem sikerült letölteni az index.html-t a GitHub-ról.");
        const indexHtml = await indexRes.text();

        // 2. Extract Critical Files
        const criticalFiles = ['index.html', 'style.css', 'package.json', 'sw.js', 'manifest.json'];
        
        // Extract CRITICAL_FILES array content from index.html source
        const match = indexHtml.match(/const CRITICAL_FILES = \[\s*([\s\S]*?)\];/);
        if (match && match[1]) {
            const lines = match[1].split('\n');
            lines.forEach(line => {
                const clean = line.trim().replace(/['",]/g, '');
                // Handle ./src prefix normalization
                if (clean && !clean.startsWith('//')) {
                    const norm = clean.startsWith('./') ? clean.substring(2) : clean;
                    if (!criticalFiles.includes(norm)) criticalFiles.push(norm);
                }
            });
        }

        // 3. Download All Files
        onProgress(`Fájlok letöltése (0/${criticalFiles.length})...`, 20);
        const fileContents: Record<string, string> = {};
        
        let loaded = 0;
        for (const file of criticalFiles) {
            try {
                const res = await fetch(`${BASE_URL}/${file}?t=${Date.now()}`);
                if (res.ok) {
                    fileContents[file] = await res.text();
                } else {
                    console.warn(`Skipping missing file: ${file}`);
                }
            } catch(e) {
                console.warn(`Failed to fetch ${file}`, e);
            }
            loaded++;
            onProgress(`Fájlok letöltése (${loaded}/${criticalFiles.length})...`, 20 + Math.round((loaded / criticalFiles.length) * 50));
        }

        // 4. Send to Server
        onProgress("Telepítés a szerverre...", 80);
        const serverUrl = getApiUrl('data');
        const updateRes = await fetch(serverUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'update_system',
                files: fileContents
            })
        });

        if (!updateRes.ok) {
            throw new Error(`Szerver hiba: ${updateRes.status} ${updateRes.statusText}`);
        }

        const json = await updateRes.json();
        if (json.error) {
            // Check for method not allowed (old api.php)
            if (json.error === 'Method not allowed' || json.error === 'Invalid JSON') {
                throw new Error("A szerver oldali script (api.php) elavult és nem támogatja az auto-frissítést. Kérlek frissítsd manuálisan az api.php fájlt!");
            }
            throw new Error(json.error);
        }

        onProgress("Kész! Újratöltés...", 100);

    } catch (e: any) {
        console.error("Update failed", e);
        throw e;
    }
};
