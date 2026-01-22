

// Dynamic registry for languages
export const translations= {};
export const AVAILABLE_LANGUAGES: { code; label }[] = [];

export const registerLanguage = (code, label, data) => {
    translations[code] = data;
    // Prevent duplicates if hot-reloading or re-registering
    if (!AVAILABLE_LANGUAGES.some(l => l.code === code)) {
        AVAILABLE_LANGUAGES.push({ code, label });
    }
};

// Recursive type helper for dot notation (simplified for runtime use)
export const getTranslation = (lang, key) => {
    const keys = key.split('.');

    // Try target language
    let current = translations[lang];
    let found = true;

    if (!current) found = false;
    else {
        for (const k of keys) {
            if (current && current[k]) {
                current = current[k];
            } else {
                found = false;
                break;
            }
        }
    }

    if (found && typeof current === 'string') return current;

    // Fallback to Hungarian ('hu') if missing in target lang and target is not 'hu'
    if (lang !== 'hu') {
        return getTranslation('hu', key);
    }

    return key; // Return key if missing in fallback too
};