import { AppData, Entry, Category } from '../types';
import { INITIAL_DATA, CATEGORY_LABELS } from '../constants';

// Old key for migration
const LEGACY_STORAGE_KEY = 'grind_diary_data_v1';

// New separated keys
const KEY_ENTRIES = 'grind_entries';
const KEY_SETTINGS = 'grind_settings';
const KEY_QUESTIONS = 'grind_questions';
const KEY_AUTH_SESSION = 'grind_auth_session';

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
    
    // Optional: Clean up legacy key to save space
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to save data", e);
  }
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
                message: "API nem található (404)", 
                details: "Hiányzik az 'api.jscript' vagy 'api.php' fájl, illetve a .htaccess beállítás hibás." 
            };
        }
        
        if (res.status === 500) {
             return { 
                online: false, 
                message: "Szerver Hiba (500)", 
                details: "A script futása során hiba történt. Node.js-nél ellenőrizd a CHMOD 755-öt!" 
            };
        }

        if (!res.ok) {
            return { online: false, message: `HTTP Hiba: ${res.status}`, details: res.statusText };
        }

        const text = await res.text();
        try {
            const json = JSON.parse(text);
            if (json.status === 'online') {
                const type = json.type ? `(${json.type})` : '(Node)';
                return { online: true, message: "Online", details: `${type} ${json.version || ''}` };
            } else {
                return { online: false, message: "Hibás válasz", details: JSON.stringify(json) };
            }
        } catch (e) {
            // If it's not JSON, it might be the raw code printed out (server not executing CGI)
            if (text.includes('#!/usr/bin/env node')) {
                return { 
                    online: false, 
                    message: "Script nem futott le", 
                    details: "A szerver szövegként küldte vissza a scriptet. .htaccess beállítás szükséges!" 
                };
            }
            if (text.includes('<?php')) {
                return { 
                    online: false, 
                    message: "PHP nem futott le", 
                    details: "A szerver nem futtatta a PHP kódot." 
                };
            }
            return { online: false, message: "JSON feldolgozási hiba", details: "A szerver válasza nem érvényes JSON." };
        }
    } catch (e: any) {
        return { online: false, message: "Hálózati hiba", details: e.message || "Nem sikerült kapcsolódni." };
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
             return json as AppData;
        }
        return null;
    } catch (e) {
        console.error("Server load failed", e);
        return null;
    }
};

export const serverSave = async (data: AppData): Promise<void> => {
    const url = getApiUrl('data');
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Server save failed");
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
    if (json.error) throw new Error(json.error);
    return json.url;
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
            // Remove WP metadata/comments
            content = content.replace(/<!--.*?-->/gs, '');
            
            // Remove metadata HTML we added in export
            content = content.replace(/<strong>Hangulat:.*?<\/strong><br\/>/g, '');
            content = content.replace(/<em>Időjárás:.*?<\/em><br\/>/g, '');
            content = content.replace(/<img src=".*?" \/>/g, '');
            content = content.replace(/<hr\/>/g, '');
            
            // Normalize paragraphs
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
                entryMode: 'free', // Import as free text to preserve content
                freeTextContent: content,
                isPrivate: false,
                mood,
                photo
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

export const exportData = (
  data: AppData, 
  format: 'json' | 'txt' | 'html' | 'wxr', 
  filter: { start?: number, end?: number }
) => {
  let entriesToExport = data.entries;
  if (filter.start) entriesToExport = entriesToExport.filter(e => e.timestamp >= filter.start!);
  if (filter.end) entriesToExport = entriesToExport.filter(e => e.timestamp <= filter.end!);
  
  entriesToExport.sort((a, b) => b.timestamp - a.timestamp);
  const filenameDate = new Date().toISOString().slice(0, 10);
  
  // JSON
  if (format === 'json') {
    const exportObj = { ...data, entries: entriesToExport };
    downloadFile(JSON.stringify(exportObj, null, 2), `grind-diary-${filenameDate}.json`, 'application/json');
    return;
  }

  // TXT
  if (format === 'txt') {
    let txtContent = `GRIND NAPLÓ EXPORT - ${filenameDate}\n====================================\n\n`;
    entriesToExport.forEach(e => {
      txtContent += `[${new Date(e.timestamp).toLocaleString()}] ${e.title || e.dateLabel} (${CATEGORY_LABELS[e.category]})\n`;
      if (e.mood) txtContent += `Hangulat: ${e.mood}\n`;
      txtContent += `------------------------------------\n`;
      
      if (e.entryMode === 'free') {
          txtContent += `${e.freeTextContent?.replace(/<[^>]*>?/gm, '')}\n`;
      } else {
          Object.entries(e.responses).forEach(([qId, ans]) => {
            const q = data.questions.find(quest => quest.id === qId);
            if (q && ans) txtContent += `Q: ${q.text}\nA: ${ans}\n\n`;
          });
      }
      txtContent += `\n====================================\n\n`;
    });
    downloadFile(txtContent, `grind-diary-${filenameDate}.txt`, 'text/plain');
    return;
  }

  // HTML
  if (format === 'html') {
    let htmlContent = `<!DOCTYPE html><html lang="hu"><head><meta charset="UTF-8"><title>Export</title><style>body{font-family:sans-serif;max-width:800px;margin:20px auto;line-height:1.6}</style></head><body><h1>Grind Napló</h1>`;
    entriesToExport.forEach(e => {
      htmlContent += `<article style="border-bottom:1px solid #ccc;margin-bottom:20px;padding-bottom:20px"><h2>${e.title || e.dateLabel}</h2><small>${new Date(e.timestamp).toLocaleDateString()}</small>`;
      if (e.photo) htmlContent += `<br><img src="${e.photo}" style="max-width:300px;margin:10px 0">`;
      
      if (e.entryMode === 'free') {
          htmlContent += `<div style="margin-top:10px">${e.freeTextContent || ''}</div>`;
      } else {
          Object.entries(e.responses).forEach(([qId, ans]) => {
             const q = data.questions.find(quest => quest.id === qId);
             if(q && ans) htmlContent += `<p><strong>${q.text}</strong><br>${ans}</p>`;
          });
      }
      htmlContent += `</article>`;
    });
    htmlContent += `</body></html>`;
    downloadFile(htmlContent, `grind-diary-${filenameDate}.html`, 'text/html');
  }

  // WORDPRESS WXR (XML)
  if (format === 'wxr') {
    let xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0"
	xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
	xmlns:content="http://purl.org/rss/1.0/modules/content/"
	xmlns:wfw="http://wellformedweb.org/CommentAPI/"
	xmlns:dc="http://purl.org/dc/elements/1.1/"
	xmlns:wp="http://wordpress.org/export/1.2/"
>
<channel>
	<title>Grind Napló Export</title>
	<pubDate>${new Date().toUTCString()}</pubDate>
	<language>hu</language>
	<wp:wxr_version>1.2</wp:wxr_version>
    `;

    entriesToExport.forEach((e, index) => {
        const date = new Date(e.timestamp);
        const pubDate = date.toUTCString();
        const postDate = date.toISOString().replace('T', ' ').slice(0, 19);
        
        let content = "";
        if (e.photo) content += `<img src="${e.photo}" /><br/><br/>`;
        if (e.weather) content += `<em>Időjárás: ${e.weather.temp}°C, ${e.weather.condition} (${e.weather.location})</em><br/>`;
        if (e.mood) content += `<strong>Hangulat: ${e.mood}</strong><br/><hr/>`;
        
        if (e.entryMode === 'free') {
            content += e.freeTextContent || '';
        } else {
            Object.entries(e.responses).forEach(([qId, ans]) => {
                const q = data.questions.find(quest => quest.id === qId);
                if (q && ans) content += `<!-- wp:heading {"level":4} --><h4>${q.text}</h4><!-- /wp:heading --><!-- wp:paragraph --><p>${ans}</p><!-- /wp:paragraph -->`;
            });
        }
        
        xml += `
    <item>
		<title><![CDATA[${e.title || e.dateLabel}]]></title>
		<link></link>
		<pubDate>${pubDate}</pubDate>
		<dc:creator><![CDATA[admin]]></dc:creator>
		<guid isPermaLink="false">grind-entry-${e.id}</guid>
		<description></description>
		<content:encoded><![CDATA[${content}]]></content:encoded>
		<excerpt:encoded><![CDATA[]]></excerpt:encoded>
		<wp:post_id>${index + 100}</wp:post_id>
		<wp:post_date>${postDate}</wp:post_date>
		<wp:post_date_gmt>${postDate}</wp:post_date_gmt>
		<wp:comment_status>closed</wp:comment_status>
		<wp:ping_status>closed</wp:ping_status>
		<wp:post_name>entry-${e.timestamp}</wp:post_name>
		<wp:status>publish</wp:status>
		<wp:post_parent>0</wp:post_parent>
		<wp:menu_order>0</wp:menu_order>
		<wp:post_type>post</wp:post_type>
		<wp:post_password></wp:post_password>
		<wp:is_sticky>0</wp:is_sticky>
		<category domain="category" nicename="${e.category.toLowerCase()}"><![CDATA[${CATEGORY_LABELS[e.category]}]]></category>
    </item>`;
    });

    xml += `
</channel>
</rss>`;
    downloadFile(xml, `grind-diary-wp-${filenameDate}.xml`, 'text/xml');
  }
};