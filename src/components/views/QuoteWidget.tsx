
import React from 'react';
import { Quote, RefreshCw } from 'lucide-react';
import { QuoteData } from '../../types';

interface QuoteWidgetProps {
    quote: QuoteData | null;
    isLoading: boolean;
    themeClasses: any;
    t: (key: string) => string;
    onRefresh: () => void;
}

const QuoteWidget: React.FC<QuoteWidgetProps> = ({ quote, isLoading, themeClasses, t, onRefresh }) => {
    if (isLoading) {
        return (
            <div className={`p-4 rounded-lg border mb-6 animate-pulse flex items-center gap-3 ${themeClasses.card}`}>
                <div className="w-8 h-8 rounded-full bg-current opacity-10"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-2 w-3/4 bg-current opacity-10 rounded"></div>
                    <div className="h-2 w-1/4 bg-current opacity-10 rounded"></div>
                </div>
            </div>
        );
    }

    if (!quote) return null;

    return (
        <div className={`p-5 rounded-xl border mb-6 relative overflow-hidden group transition-all hover:border-emerald-500/30 ${themeClasses.card}`}>
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Quote className="w-16 h-16 transform rotate-180" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
                <p className="text-lg md:text-xl font-serif italic opacity-90 leading-relaxed mb-3">
                    "{quote.text}"
                </p>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-60">
                    <span className="w-4 h-px bg-current"></span>
                    <span>{quote.author}</span>
                    <span className="w-4 h-px bg-current"></span>
                </div>
            </div>

            <button 
                onClick={(e) => { e.stopPropagation(); onRefresh(); }}
                className="absolute bottom-2 right-2 p-2 rounded-full opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-all hover:bg-black/10 dark:hover:bg-white/10"
                title={t('settings.refresh_quote')}
            >
                <RefreshCw className="w-3 h-3" />
            </button>
        </div>
    );
};

export default QuoteWidget;
