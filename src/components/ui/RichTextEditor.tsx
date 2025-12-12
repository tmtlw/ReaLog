
import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, Link as LinkIcon, Heading1, Quote, Code, RotateCcw, Clock } from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (val: string) => void;
    themeClasses: any;
    placeholder?: string;
    minHeight?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, themeClasses, placeholder, minHeight = "200px" }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const isUpdatingRef = useRef(false);

    // Sync external value to innerHTML when value changes externally
    useEffect(() => {
        if (editorRef.current && !isUpdatingRef.current) {
            if (editorRef.current.innerHTML !== value) {
                editorRef.current.innerHTML = value;
            }
        }
    }, [value]);

    const handleInput = () => {
        if (editorRef.current) {
            isUpdatingRef.current = true;
            onChange(editorRef.current.innerHTML);
            setTimeout(() => { isUpdatingRef.current = false; }, 0);
        }
    };

    const exec = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            editorRef.current.focus();
            handleInput(); // Trigger update after command
        }
    };

    const insertLink = () => {
        const url = prompt("URL:", "https://");
        if (url) exec('createLink', url);
    };

    const insertTime = () => {
        const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        exec('insertText', `[${time}] `);
    };

    const ToolbarButton = ({ icon: Icon, cmd, arg, title, onClick }: any) => (
        <button 
            type="button" 
            onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                if (onClick) onClick();
                else if(cmd === 'link') insertLink(); 
                else exec(cmd, arg); 
            }}
            className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
            title={title}
        >
            <Icon className="w-4 h-4 opacity-70" />
        </button>
    );

    return (
        <div className={`border rounded-lg overflow-hidden flex flex-col ${themeClasses.card}`}>
            <div className="flex flex-wrap gap-1 p-2 border-b border-current border-opacity-10 bg-black/5 items-center">
                <ToolbarButton icon={Bold} cmd="bold" title="Félkövér" />
                <ToolbarButton icon={Italic} cmd="italic" title="Dőlt" />
                <ToolbarButton icon={Underline} cmd="underline" title="Aláhúzott" />
                <div className="w-px h-4 bg-current opacity-20 mx-1"></div>
                <ToolbarButton icon={Heading1} cmd="formatBlock" arg="H3" title="Címsor" />
                <ToolbarButton icon={Quote} cmd="formatBlock" arg="BLOCKQUOTE" title="Idézet" />
                <ToolbarButton icon={Code} cmd="formatBlock" arg="PRE" title="Kód" />
                <div className="w-px h-4 bg-current opacity-20 mx-1"></div>
                <ToolbarButton icon={List} cmd="insertUnorderedList" title="Lista" />
                <ToolbarButton icon={LinkIcon} cmd="link" title="Link" />
                <div className="w-px h-4 bg-current opacity-20 mx-1"></div>
                <ToolbarButton icon={Clock} onClick={insertTime} title={placeholder?.includes('gondolat') ? "Idő beszúrása" : "Időbélyeg"} />
                <ToolbarButton icon={RotateCcw} cmd="removeFormat" title="Formázás törlése" />
            </div>
            
            <div 
                ref={editorRef}
                className={`flex-1 p-4 focus:outline-none overflow-y-auto prose prose-sm max-w-none ${themeClasses.text} prose-invert`}
                contentEditable
                onInput={handleInput}
                style={{ minHeight }}
                data-placeholder={placeholder}
            />
            <style>{`
                [contenteditable]:empty:before {
                    content: attr(data-placeholder);
                    color: gray;
                    cursor: text;
                }
                .prose blockquote { border-left: 3px solid currentColor; padding-left: 1rem; opacity: 0.8; font-style: italic; }
                .prose pre { background: #00000030; padding: 0.5rem; rounded: 4px; font-family: monospace; }
                .prose ul { list-style-type: disc; padding-left: 1.5rem; }
                .prose h3 { font-size: 1.25em; font-weight: bold; margin-top: 0.5em; margin-bottom: 0.25em; }
                .prose a { text-decoration: underline; opacity: 0.8; }
            `}</style>
        </div>
    );
};

export default RichTextEditor;
