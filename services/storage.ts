import { AppData, Entry, Category } from '../types';
import { INITIAL_DATA, CATEGORY_LABELS } from '../constants';

const STORAGE_KEY = 'grind_diary_data_v1';

export const loadData = (): AppData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_DATA;
    const parsed = JSON.parse(raw);
    // Ensure settings object exists for older data
    if (!parsed.settings) parsed.settings = {};
    return parsed;
  } catch (e) {
    console.error("Failed to load data", e);
    return INITIAL_DATA;
  }
};

export const saveData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save data", e);
  }
};

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

// --- Export Logic ---

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
  format: 'json' | 'txt' | 'html', 
  filter: { start?: number, end?: number }
) => {
  // Filter entries
  let entriesToExport = data.entries;
  if (filter.start) entriesToExport = entriesToExport.filter(e => e.timestamp >= filter.start!);
  if (filter.end) entriesToExport = entriesToExport.filter(e => e.timestamp <= filter.end!);
  
  // Sort descending
  entriesToExport.sort((a, b) => b.timestamp - a.timestamp);

  const filenameDate = new Date().toISOString().slice(0, 10);
  
  if (format === 'json') {
    const exportObj = { ...data, entries: entriesToExport };
    downloadFile(JSON.stringify(exportObj, null, 2), `grind-diary-${filenameDate}.json`, 'application/json');
    return;
  }

  if (format === 'txt') {
    let txtContent = `GRIND NAPLÓ EXPORT - ${filenameDate}\n====================================\n\n`;
    entriesToExport.forEach(e => {
      txtContent += `[${new Date(e.timestamp).toLocaleString()}] ${e.title || e.dateLabel} (${CATEGORY_LABELS[e.category]})\n`;
      if (e.mood) txtContent += `Hangulat: ${e.mood}\n`;
      if (e.weather) txtContent += `Időjárás: ${e.weather.temp}°C, ${e.weather.condition} (${e.weather.location})\n`;
      txtContent += `------------------------------------\n`;
      Object.entries(e.responses).forEach(([qId, ans]) => {
        const q = data.questions.find(quest => quest.id === qId);
        if (q && ans) {
          txtContent += `Q: ${q.text}\nA: ${ans}\n\n`;
        }
      });
      if (e.aiAnalysis) {
        txtContent += `AI COACH: ${e.aiAnalysis}\n`;
      }
      txtContent += `\n====================================\n\n`;
    });
    downloadFile(txtContent, `grind-diary-${filenameDate}.txt`, 'text/plain');
    return;
  }

  if (format === 'html') {
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="hu">
      <head>
        <meta charset="UTF-8">
        <title>Grind Napló Export</title>
        <style>
          body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f4f4f5; color: #18181b; }
          .entry { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .meta { font-size: 0.85em; color: #71717a; margin-bottom: 10px; }
          .title { font-size: 1.5em; font-weight: bold; color: #059669; margin: 0 0 5px 0; }
          .qa { margin-bottom: 15px; }
          .q { font-weight: bold; color: #3f3f46; font-size: 0.9em; }
          .a { white-space: pre-wrap; margin-top: 2px; }
          .ai { background: #ecfdf5; border-left: 4px solid #059669; padding: 10px; font-style: italic; font-size: 0.9em; margin-top: 15px; }
          .photo { max-width: 100%; height: auto; margin-top: 10px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <h1>Grind Napló Export</h1>
    `;

    entriesToExport.forEach(e => {
      htmlContent += `
        <div class="entry">
          <div class="meta">
            ${new Date(e.timestamp).toLocaleString()} | ${CATEGORY_LABELS[e.category]}
            ${e.weather ? `| 🌤 ${e.weather.temp}°C, ${e.weather.condition}` : ''}
            ${e.mood ? `| ${e.mood}` : ''}
          </div>
          <h2 class="title">${e.title || e.dateLabel}</h2>
          ${e.photo ? `<img src="${e.photo}" class="photo" alt="Entry photo" />` : ''}
          <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 15px 0;" />
      `;
      
      Object.entries(e.responses).forEach(([qId, ans]) => {
        const q = data.questions.find(quest => quest.id === qId);
        if (q && ans) {
          htmlContent += `
            <div class="qa">
              <div class="q">${q.text}</div>
              <div class="a">${ans}</div>
            </div>
          `;
        }
      });

      if (e.aiAnalysis) {
        htmlContent += `<div class="ai"><strong>🤖 AI Coach:</strong> ${e.aiAnalysis}</div>`;
      }

      htmlContent += `</div>`;
    });

    htmlContent += `</body></html>`;
    downloadFile(htmlContent, `grind-diary-${filenameDate}.html`, 'text/html');
  }
};
