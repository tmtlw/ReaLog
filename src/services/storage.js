import { INITIAL_DATA } from '../constants.js';
import { getTranslation } from './i18n.js';

const API_URL = 'api.php';
const t = (key) => getTranslation('hu', key);

// --- Auth ---
export const saveAuthSession = () => {
    localStorage.setItem('grind_auth_session', JSON.stringify({ Date.now() + (30 * 24 * 60 * 60 * 1000) }));
};

export const checkAuthSession = () => {
    try {
        const raw = localStorage.getItem('grind_auth_session');
        if (!raw) return false;
        const data = JSON.parse(raw);
        return data.expiry > Date.now();
    } catch (e) {
        return false;
    }
};

export const clearAuthSession = () => {
    localStorage.removeItem('grind_auth_session');
};

// --- Data ---
export const loadData = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('API Error');
    const json = await response.json();
    return {
        entries: json.entries || [],
        settings: { ...INITIAL_DATA.settings, ...(json.settings || {}) },
        questions: json.questions || INITIAL_DATA.questions,
        habits: json.habits || INITIAL_DATA.habits
    };
  } catch (e) {
    console.error("Failed to load data from API", e);
    return INITIAL_DATA;
  }
};

export const saveData = async (data) => {
  try {
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
  } catch (e) {
    console.error("Failed to save data", e);
  }
};

export const checkServerStatus = async () => {
    try {
        const res = await fetch(`${API_URL}/status`);
        return { online: res.ok, message: res.statusText };
    } catch(e) {
        return { online: false, message: e.message };
    }
};

export const serverLoad = loadData;
export const serverSave = saveData;

export const uploadImage = async (file) => {
    const url = `${API_URL}/upload`;
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(url, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed');
    const json = await res.json();
    return json.url;
};

export const importFromJson = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        resolve(json);
      } catch (e) { reject(e); }
    };
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

const downloadFile = (content, filename, mimeType) => {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportData = async (data, format, filter, includePrivate = false) => {
  let entriesToExport = data.entries;
  if (filter.start) entriesToExport = entriesToExport.filter(e => e.timestamp >= filter.start);
  if (filter.end) entriesToExport = entriesToExport.filter(e => e.timestamp <= filter.end);
  if (!includePrivate) entriesToExport = entriesToExport.filter(e => !e.isPrivate);

  entriesToExport.sort((a, b) => a.timestamp - b.timestamp);
  const filenameDate = new Date().toISOString().slice(0, 10);

  if (format === 'json') {
    const exportObj = { ...data, entries: entriesToExport };
    downloadFile(JSON.stringify(exportObj, null, 2), `grind-diary-${filenameDate}.json`, 'application/json');
    return;
  }

  // HTML Export
  if (format === 'html') {
      let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Export ${filenameDate}</title><style>body{font-family:sans-serif;max-width:800px;margin:20px auto;line-height:1.6} .entry{border-bottom:1px solid #ccc;padding:20px 0} .date{color:#666;font-size:0.9em} img{max-width:100%}</style></head><body><h1>Napló Export ${filenameDate}</h1>`;
      entriesToExport.forEach(e => {
          html += `<div class="entry"><div class="date">${new Date(e.timestamp).toLocaleDateString()}</div><h2>${e.title || e.dateLabel}</h2>`;
          if(e.mood) html += `<p><strong>Hangulat:</strong> ${e.mood}</p>`;
          if(e.entryMode === 'free') html += `<div>${e.freeTextContent || ''}</div>`;
          else {
              Object.entries(e.responses).forEach(([qid, ans]) => {
                  const q = data.questions.find(qx => qx.id === qid);
                  if(q && ans) html += `<h4>${q.text}</h4><p>${ans}</p>`;
              });
          }
          if(e.photos) e.photos.forEach(p => html += `<img src="${p}" />`);
          html += `</div>`;
      });
      html += `</body></html>`;
      downloadFile(html, `grind-diary-${filenameDate}.html`, 'text/html');
      return;
  }

  // Markdown Export
  if (format === 'md') {
      if (typeof window.JSZip === 'undefined') { alert("JSZip hiányzik."); return; }
      const zip = new window.JSZip();
      const rootFolder = zip.folder("Export");

      entriesToExport.forEach(e => {
          const date = new Date(e.timestamp);
          const y = date.getFullYear();
          const m = (date.getMonth()+1).toString().padStart(2,'0');
          const d = date.getDate().toString().padStart(2,'0');
          const filename = `${y}-${m}-${d} - ${(e.title || e.dateLabel).replace(/[^a-z0-9]/gi, '_')}.md`;

          let content = `---\ntitle: "${e.title}"\ndate: ${date.toISOString()}\n---\n\n# ${e.title}\n\n`;
          if(e.mood) content += `Hangulat: ${e.mood}\n\n`;
          if(e.entryMode === 'free') content += (e.freeTextContent || '') + "\n\n";
          else {
               Object.entries(e.responses).forEach(([qid, ans]) => {
                  const q = data.questions.find(qx => qx.id === qid);
                  if(q && ans) content += `### ${q.text}\n${ans}\n\n`;
              });
          }
          rootFolder.file(filename, content);
      });

      const content = await zip.generateAsync({type:"blob"});
      downloadFile(content, `export-${filenameDate}.zip`, "application/zip");
  }
};

// ... other exports ...
export const setupBackgroundSync = (start, end) => {};
export const checkGithubVersion = async () => null;
