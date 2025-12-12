
import { AppData, Entry, Category } from '../types';
import { INITIAL_DATA, CATEGORY_LABELS, GITHUB_CONFIG } from '../constants';
import { getTranslation } from './i18n';

// Old key for migration
const LEGACY_STORAGE_KEY = 'grind_diary_data_v1';

// New separated keys
const KEY_ENTRIES = 'grind_entries';
const KEY_SETTINGS = 'grind_settings';
const KEY_QUESTIONS = 'grind_questions';
const KEY_AUTH_SESSION = 'grind_auth_session';
const KEY_IS_DIRTY = 'grind_is_dirty'; // Tracks if local changes need push

// --- Helper: Dynamic API URL ---
export const getApiUrl = (endpoint: string): string => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    let basePath = window.location.pathname;
    if (basePath.endsWith('index.html')) {
        basePath = basePath.substring(0, basePath.lastIndexOf('index.html'));
    }
    if (basePath.endsWith('/')) {
        basePath = basePath.slice(0, -1);
    }
    return `${basePath}/api/${cleanEndpoint}`;
};

// Helper to get current lang for static errors
const getLang = () => {
    try {
        const s = localStorage.getItem(KEY_SETTINGS);
        if(s) return JSON.parse(s).language || 'hu';
    } catch(e) {}
    return 'hu';
};

const t = (key: string) => getTranslation(getLang(), key);

// --- Auth Session ---

export const saveAuthSession = () => {
    const expiry = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days
    localStorage.setItem(KEY_AUTH_SESSION, JSON.stringify({ expiry }));
};

export const checkAuthSession = (): boolean => {
    try {
        const raw = localStorage.getItem(KEY_AUTH_SESSION);
        if (!raw) return false;
        const data = JSON.parse(raw);
        return data.expiry > Date.now();
    } catch (e) {
        return false;
    }
};

export const clearAuthSession = () => {
    localStorage.removeItem(KEY_AUTH_SESSION);
};

// --- Local Storage ---

export const loadData = (): AppData => {
  try {
    // 1. Check for new separated format
    const rawEntries = localStorage.getItem(KEY_ENTRIES);
    const rawSettings = localStorage.getItem(KEY_SETTINGS);
    const rawQuestions = localStorage.getItem(KEY_QUESTIONS);

    if (rawEntries || rawSettings) {
        return {
            entries: rawEntries ? JSON.parse(rawEntries) : [],
            settings: rawSettings ? JSON.parse(rawSettings) : {},
            questions: rawQuestions ? JSON.parse(rawQuestions) : INITIAL_DATA.questions
        };
    }

    // 2. Migration: Check for legacy combined format
    const rawLegacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (rawLegacy) {
        console.log("Migrating legacy data to separated format...");
        const parsed = JSON.parse(rawLegacy);
        
        // Save to new keys
        localStorage.setItem(KEY_ENTRIES, JSON.stringify(parsed.entries || []));
        localStorage.setItem(KEY_SETTINGS, JSON.stringify(parsed.settings || {}));
        localStorage.setItem(KEY_QUESTIONS, JSON.stringify(parsed.questions || INITIAL_DATA.questions));
        
        // Return parsed data
        if (!parsed.settings) parsed.settings = {};
        return parsed;
    }

    // 3. Fallback to initial
    return INITIAL_DATA;
  } catch (e) {
    console.error("Failed to load data", e);
    return INITIAL_DATA;
  }
};

export const saveData = (data: AppData): void => {
  try {
    localStorage.setItem(KEY_ENTRIES, JSON.stringify(data.entries));
    localStorage.setItem(KEY_SETTINGS, JSON.stringify(data.settings));
    localStorage.setItem(KEY_QUESTIONS, JSON.stringify(data.questions));
    
    // Flag as dirty (needs sync) by default when saving locally
    // If connected to server, serverSave will be called and potentially succeed
    localStorage.setItem(KEY_IS_DIRTY, 'true');

    // Optional: Clean up legacy key to save space
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to save data", e);
  }
};

// --- Sync Logic ---

const setDirty = (dirty: boolean) => {
    if (dirty) localStorage.setItem(KEY_IS_DIRTY, 'true');
    else localStorage.removeItem(KEY_IS_DIRTY);
}

const isDirty = () => !!localStorage.getItem(KEY_IS_DIRTY);

export const setupBackgroundSync = (onSyncStart: () => void, onSyncEnd: (success: boolean) => void) => {
    window.addEventListener('online', async () => {
        if (isDirty()) {
            console.log("Online detected. Attempting sync...");
            onSyncStart();
            const data = loadData();
            try {
                // Try Server first if configured? 
                // We assume the app state knows the mode, but here we just try generic server save as basic implementation
                // Ideally this would check what mode was last active. For now, we attempt Self-Hosted sync if dirty.
                
                await serverSave(data);
                setDirty(false);
                onSyncEnd(true);
            } catch (e) {
                console.error("Auto-sync failed", e);
                onSyncEnd(false);
            }
        }
    });
};

// --- Server Side API (Self-Hosted) ---

export interface ServerStatusResult {
    online: boolean;
    message: string;
    details?: string;
}

export const checkServerStatus = async (): Promise<ServerStatusResult> => {
    // Add timestamp to prevent caching of status check
    const url = `${getApiUrl('status')}?t=${Date.now()}`;
    try {
        const res = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
        
        if (res.status === 404) {
            return { 
                online: false, 
                message: t('server.api_not_found'), 
                details: "Missing api.jscript / api.php or .htaccess" 
            };
        }
        
        if (res.status === 500) {
             return { 
                online: false, 
                message: t('server.server_error'), 
                details: "Check script permissions (CHMOD 755)" 
            };
        }

        if (!res.ok) {
            return { online: false, message: `${t('server.http_error')}: ${res.status}`, details: res.statusText };
        }

        const text = await res.text();
        try {
            const json = JSON.parse(text);
            if (json.status === 'online') {
                const type = json.type ? `(${json.type})` : '(Node)';
                return { online: true, message: "Online", details: `${type} ${json.version || ''}` };
            } else {
                return { online: false, message: t('common.error'), details: JSON.stringify(json) };
            }
        } catch (e) {
            // If it's not JSON, it might be the raw code printed out (server not executing CGI)
            if (text.includes('#!/usr/bin/env node')) {
                return { 
                    online: false, 
                    message: t('server.script_fail'), 
                    details: ".htaccess config required" 
                };
            }
            if (text.includes('<?php')) {
                return { 
                    online: false, 
                    message: t('server.php_fail'), 
                    details: "Server did not execute PHP" 
                };
            }
            return { online: false, message: t('server.json_fail'), details: "Invalid JSON response" };
        }
    } catch (e: any) {
        return { online: false, message: t('server.network_error'), details: e.message || "Connection failed" };
    }
};

export const serverLoad = async (): Promise<AppData | null> => {
    try {
        // Add timestamp to prevent caching
        const url = `${getApiUrl('data')}?t=${Date.now()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        // Allow empty data structures, just ensure it's an object
        if (json && typeof json === 'object') {
             setDirty(false); // Clean state after fresh load
             return json as AppData;
        }
        return null;
    } catch (e) {
        console.error("Server load failed", e);
        return null;
    }
};

export const serverSave = async (data: AppData): Promise<any> => {
    if (!navigator.onLine) {
        setDirty(true);
        throw new Error(t('server.offline_mode'));
    }

    const url = getApiUrl('data');
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'save', ...data })
        });
        
        if (!res.ok) {
            setDirty(true);
            throw new Error("Server save failed");
        }
        
        // Attempt to parse JSON to look for messages/logs, otherwise return null
        try {
            const result = await res.json();
            setDirty(false); // Sync success
            return result;
        } catch(e) {
            return null;
        }
    } catch(e) {
        setDirty(true);
        throw e;
    }
};

// NEW: Backup Features
export const getBackups = async (): Promise<any[]> => {
    const url = `${getApiUrl('data')}?action=list_backups&t=${Date.now()}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = await res.json();
    return json.backups || [];
};

export const createBackup = async (): Promise<void> => {
    const url = getApiUrl('data');
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'backup' })
    });
    if (!res.ok) throw new Error("Backup creation failed");
};

export const restoreBackup = async (filename: string): Promise<void> => {
    const url = getApiUrl('data');
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore', filename })
    });
    if (!res.ok) throw new Error("Restore failed");
};

export const resetDiary = async (): Promise<void> => {
    const url = getApiUrl('data');
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' })
    });
    if (!res.ok) throw new Error("Reset failed");
};

export const uploadImage = async (file: File): Promise<string> => {
    const url = `${getApiUrl('upload')}?t=${Date.now()}`;
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(url, {
        method: 'POST',
        body: formData
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Upload failed: ${text}`);
    }

    const json = await res.json();
    if (json.error) {
        // Simple heuristic to check for node limitation error
        if (json.error.includes("limited")) throw new Error(t('server.upload_restricted'));
        throw new Error(json.error);
    }
    return json.url;
};

// --- New Feature: Download Font URL and Save to Server ---
export const saveFont = async (urlOrBase64: string, filename: string): Promise<string> => {
    let base64data = "";

    // 1. Check if input is URL or Base64
    if (urlOrBase64.startsWith('data:') || urlOrBase64.startsWith('base64,')) {
        base64data = urlOrBase64;
    } else {
        // Download blob from external URL using CORS
        try {
            const response = await fetch(urlOrBase64, { mode: 'cors' });
            if (!response.ok) throw new Error(`Failed to download font: ${response.statusText}`);
            const blob = await response.blob();
            
            // Convert to Base64
            base64data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch(e) {
            console.error("Font fetch failed:", e);
            throw e;
        }
    }

    // 2. Send to Server API
    const serverUrl = getApiUrl('data');
    const res = await fetch(serverUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'save_font',
            name: filename,
            data: base64data
        })
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server failed to save font: ${text}`);
    }
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json.path; // returns relative path e.g. "fonts/openmoji.woff2"
};

// --- Cloud Storage (REST API - External) ---

export const cloudLoad = async (config: any): Promise<AppData | null> => {
    if (!config.url) throw new Error("Hiányzó URL");
    
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };
    if (config.apiKey) {
        headers['Authorization'] = `Bearer ${config.apiKey}`;
        headers['X-Master-Key'] = config.apiKey; 
        headers['X-Access-Key'] = config.apiKey;
    }

    // Add timestamp for cloud as well
    const urlWithCacheBuster = config.url.includes('?') ? `${config.url}&t=${Date.now()}` : `${config.url}?t=${Date.now()}`;

    const response = await fetch(urlWithCacheBuster, { method: 'GET', headers });
    
    if (!response.ok) {
        throw new Error(`Szerver hiba: ${response.status}`);
    }

    const json = await response.json();
    
    if (json.record && (json.record.entries || json.record.questions)) {
        return json.record as AppData;
    }
    
    if (json.entries || json.questions) {
        return json as AppData;
    }
    
    return null;
};

export const cloudSave = async (data: AppData, config: any): Promise<void> => {
    if (!navigator.onLine) {
        setDirty(true);
        throw new Error(t('server.offline_mode'));
    }

    if (!config.url) throw new Error("Hiányzó URL");

    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };
    if (config.apiKey) {
        headers['Authorization'] = `Bearer ${config.apiKey}`;
        headers['X-Master-Key'] = config.apiKey;
        headers['X-Access-Key'] = config.apiKey;
    }

    try {
        const response = await fetch(config.url, {
            method: 'PUT', 
            headers,
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            setDirty(true);
            throw new Error(`Mentés sikertelen: ${response.status} ${response.statusText}`);
        }
        setDirty(false);
    } catch(e) {
        setDirty(true);
        throw e;
    }
};

// --- Import/Export ---

export const importFromJson = (file: File): Promise<AppData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.questions || !json.entries) {
            throw new Error("Invalid JSON structure");
        }
        resolve(json);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

export const importFromWxr = (file: File): Promise<Entry[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");
        
        const items = xmlDoc.getElementsByTagName("item");
        const entries: Entry[] = [];
        
        const getText = (node: Element, tagName: string) => {
            const el = node.getElementsByTagName(tagName)[0];
            return el ? el.textContent || "" : "";
        }

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const title = getText(item, "title");
            let content = getText(item, "content:encoded");
            const postDate = getText(item, "wp:post_date");
            const pubDate = getText(item, "pubDate");
            
            let timestamp = Date.now();
            if (postDate && !postDate.startsWith('0000')) timestamp = new Date(postDate).getTime();
            else if (pubDate) timestamp = new Date(pubDate).getTime();
            
            const categories = item.getElementsByTagName("category");
            let category = "DAILY"; 
            for(let c=0; c<categories.length; c++) {
                if (categories[c].getAttribute("domain") === "category") {
                    const nicename = categories[c].getAttribute("nicename");
                    if (nicename) category = nicename.toUpperCase();
                }
            }

            // Extract Metadata from Content if exported by this app or similar
            let mood: string | undefined;
            const moodMatch = content.match(/<strong>Hangulat: (.*?)<\/strong>/);
            if (moodMatch && moodMatch[1]) {
                mood = moodMatch[1];
            }

            let photo: string | undefined;
            const imgMatch = content.match(/<img src="(.*?)"/);
            if (imgMatch && imgMatch[1]) {
                photo = imgMatch[1];
            }

            // Clean up Content for Free Text Mode
            content = content.replace(/<!--.*?-->/gs, '');
            content = content.replace(/<strong>Hangulat:.*?<\/strong><br\/>/g, '');
            content = content.replace(/<em>Időjárás:.*?<\/em><br\/>/g, '');
            content = content.replace(/<img src=".*?" \/>/g, '');
            content = content.replace(/<hr\/>/g, '');
            content = content.replace(/<\/p>/g, '\n\n');
            content = content.replace(/<p>/g, '');
            content = content.replace(/<br\/>/g, '\n');
            
            content = content.trim();

            entries.push({
                id: crypto.randomUUID(),
                timestamp,
                dateLabel: title || new Date(timestamp).toLocaleDateString(),
                title: title,
                category: category as any,
                responses: {},
                entryMode: 'free', 
                freeTextContent: content,
                isPrivate: false,
                mood,
                photo,
                photos: photo ? [photo] : [],
                tags: []
            });
        }
        resolve(entries);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ... (Export functions remain unchanged) ...
export const exportData = async (
  data: AppData, 
  format: 'json' | 'txt' | 'html' | 'wxr' | 'pdf' | 'epub', 
  filter: { start?: number, end?: number },
  includePrivate: boolean = false
) => {
  let entriesToExport = data.entries;
  if (filter.start) entriesToExport = entriesToExport.filter(e => e.timestamp >= filter.start!);
  if (filter.end) entriesToExport = entriesToExport.filter(e => e.timestamp <= filter.end!);
  
  if (!includePrivate) {
      entriesToExport = entriesToExport.filter(e => !e.isPrivate);
  }
  
  entriesToExport = entriesToExport.map(e => ({
      ...e,
      photos: e.photos || (e.photo ? [e.photo] : []),
      tags: e.tags || []
  }));
  
  entriesToExport.sort((a, b) => a.timestamp - b.timestamp);
  
  const filenameDate = new Date().toISOString().slice(0, 10);
  
  if (format === 'json') {
    const exportObj = { ...data, entries: entriesToExport };
    downloadFile(JSON.stringify(exportObj, null, 2), `grind-diary-${filenameDate}.json`, 'application/json');
    return;
  }
};

// --- Github Update Check ---
export const checkGithubVersion = async (currentVersion: string) => {
    if (!GITHUB_CONFIG.ENABLED || !GITHUB_CONFIG.OWNER || !GITHUB_CONFIG.REPO) {
        return null;
    }

    try {
        // Fetch package.json from raw
        const packageUrl = `https://raw.githubusercontent.com/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/${GITHUB_CONFIG.BRANCH}/package.json`;
        const res = await fetch(packageUrl);
        
        if (res.status === 404) {
            throw new Error("Repository nem található vagy privát (404)");
        }
        
        if (!res.ok) throw new Error(`HTTP hiba: ${res.status}`);
        
        const pkg = await res.json();
        const remoteVersion = pkg.version;

        if (remoteVersion !== currentVersion) {
            // Fetch changelog to show what changed
            const changelogUrl = `https://raw.githubusercontent.com/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/${GITHUB_CONFIG.BRANCH}/src/changelog.ts`;
            const clRes = await fetch(changelogUrl);
            let changes: string[] = [];
            
            if (clRes.ok) {
                const clText = await clRes.text();
                // Simple regex to extract changes array for the specific version
                const versionBlock = clText.split(`version: "${remoteVersion}"`)[1];
                if (versionBlock) {
                    const changesBlock = versionBlock.split('changes: [')[1];
                    if (changesBlock) {
                        const rawChanges = changesBlock.split(']')[0];
                        const matches = rawChanges.match(/"(.*?)"/g);
                        if (matches) {
                            changes = matches.map(s => s.replace(/"/g, ''));
                        }
                    }
                }
            }

            return {
                version: remoteVersion,
                changes: changes,
                url: `https://github.com/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}`
            };
        }
    } catch(e: any) {
        console.warn("Update check failed", e);
        throw new Error(e.message || "Ismeretlen hiba");
    }
    return null;
};
