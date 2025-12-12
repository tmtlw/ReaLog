
import { GITHUB_CONFIG } from '../constants';
import { getApiUrl, createSystemBackup } from './storage';

const BRANCH = GITHUB_CONFIG.BRANCH || 'main';
const BASE_URL = `https://raw.githubusercontent.com/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/${BRANCH}`;

// Helper to handle API calls with fallback to direct api.php if rewrite fails
const postToApi = async (data: any): Promise<Response> => {
    // 1. Try standard API route (e.g. /naplo/api/data)
    let url = getApiUrl('data');
    let res: Response;
    
    try {
        res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    } catch(e) {
        // Network error implies we might need fallback immediately
        res = { status: 404, ok: false, statusText: "Network Error" } as Response;
    }

    // 2. If 404 (likely missing .htaccess), try direct script access
    if (res.status === 404) {
        // Fallback: Try relative 'api.php'
        console.warn(`Update API 404 at ${url}, trying fallback to api.php...`);
        url = 'api.php'; 
        try {
            res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } catch(e) {
             throw new Error("Szerver hiba: api.php nem érhető el. Ellenőrizd a fájlokat!");
        }
    }
    
    return res;
};

export const performUpdate = async (
    onProgress: (step: string, progress: number) => void,
    t: (key: string) => string
): Promise<void> => {
    try {
        // 0. Maintenance Mode / Safety Backup
        onProgress(t('update.step_backup'), 5);
        try {
            // Use local createSystemBackup logic but manual fetch to handle fallback
            const backupRes = await postToApi({ action: 'system_backup' });
            if (!backupRes.ok) {
                const txt = await backupRes.text();
                console.warn("Backup warning:", txt);
                // We proceed even if backup fails slightly (e.g. permission warning), but log it.
            }
        } catch (e) {
            console.error("System backup failed", e);
            // Proceeding might be risky, but user wants update. 
        }

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
        onProgress(t('update.step_download'), 20);
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
            onProgress(`${t('update.step_download')} (${loaded}/${criticalFiles.length})`, 20 + Math.round((loaded / criticalFiles.length) * 50));
        }

        // 4. Send to Server (Install)
        onProgress(t('update.step_install'), 80);
        
        const updateRes = await postToApi({
            action: 'update_system',
            files: fileContents
        });

        if (!updateRes.ok) {
            if (updateRes.status === 404) {
                throw new Error("Szerver hiba (404): Az 'api.php' fájl nem található a szerveren.");
            }
            throw new Error(`Szerver hiba: ${updateRes.status} ${updateRes.statusText}`);
        }

        const json = await updateRes.json();
        if (json.error) {
            // Check for method not allowed (old api.php)
            if (json.error === 'Method not allowed' || json.error === 'Invalid JSON') {
                throw new Error("A szerver oldali script (api.php) elavult. Kérlek frissítsd manuálisan az api.php fájlt!");
            }
            throw new Error(json.error);
        }

        onProgress("Kész! Újratöltés...", 100);

    } catch (e: any) {
        console.error("Update failed", e);
        throw e;
    }
};
