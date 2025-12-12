
import React from 'react';
import { EmojiStyle } from '../../types';

interface EmojiRendererProps {
    emoji: string | undefined;
    style?: EmojiStyle;
    className?: string;
    onClick?: (e: React.MouseEvent) => void;
}

const EMOJI_STYLES: Record<string, React.CSSProperties> = {
    'noto': {
        fontFamily: '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif'
    },
    'noto-mono': {
        fontFamily: '"Noto Emoji", monospace'
    },
    'openmoji': {
        fontFamily: '"OpenMoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif'
    },
    'emojidex': {
        fontFamily: '"Emojidex", "Apple Color Emoji", "Segoe UI Emoji", sans-serif'
    },
    'native': {
        fontFamily: 'apple color emoji, segoe ui emoji, noto color emoji, android emoji, emojisymbols, emojione mozilla, twemoji mozilla, segoe ui symbol'
    },
    // Effects
    'grayscale': {
        filter: 'grayscale(100%)'
    },
    'sepia': {
        filter: 'sepia(80%) contrast(120%)'
    },
    'neon': {
        filter: 'brightness(130%) saturate(150%)',
        textShadow: '0 0 5px currentColor, 0 0 10px currentColor'
    },
    'pop': {
        filter: 'saturate(250%) contrast(110%)',
        transform: 'scale(1.1) rotate(5deg)'
    },
    'soft': {
        opacity: 0.8,
        filter: 'contrast(80%) brightness(110%) saturate(80%)'
    },
    'retro': {
        imageRendering: 'pixelated',
        filter: 'contrast(150%) saturate(50%) sepia(30%)'
    },
    'glitch': {
        textShadow: '2px 0 #ff0000, -2px 0 #00ffff',
        filter: 'contrast(120%)'
    }
};

export const getEmojiStyleObject = (style: EmojiStyle): React.CSSProperties => {
    return EMOJI_STYLES[style] || {};
};

const EmojiRenderer: React.FC<EmojiRendererProps> = ({ emoji, style = 'native', className = "", onClick }) => {
    if (!emoji) return null;

    // Determine the base styles
    const baseStyle = EMOJI_STYLES[style] || {};
    
    // Combine with specific requirement to enforce fonts if it's a font-based style
    const combinedStyle: React.CSSProperties = {
        ...baseStyle,
        display: 'inline-block',
        fontStyle: 'normal',
        lineHeight: '1',
    };

    // If it's a webfont, we must ensure it overrides the global font
    if (['openmoji', 'emojidex', 'noto', 'noto-mono'].includes(style)) {
        // We handle the !important part by injecting a unique class or using inline style 
        // Note: React removes !important from inline styles. 
        // We rely on the App.tsx global style injection for the font-face definition to take precedence via specificity 
        // or we use a data-attribute to target it with global CSS if needed.
        // However, setting fontFamily directly usually works if the font is loaded.
    }

    return (
        <span 
            className={`emoji-render-${style} ${className}`}
            style={combinedStyle}
            onClick={onClick}
            role="img"
            aria-label={emoji}
        >
            {emoji}
        </span>
    );
};

export default EmojiRenderer;
