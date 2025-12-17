
import React from 'react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline', 
  size?: 'sm' | 'md' | 'lg',
  themeClasses?: any 
}> = ({ className, variant = 'primary', size = 'md', themeClasses, ...props }) => {
  const sizeClasses = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base"
  };

  const baseStyle = "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: themeClasses?.primaryBtn || "bg-emerald-600 text-white",
    secondary: themeClasses?.secondaryBtn || "bg-zinc-800 text-zinc-100",
    danger: "bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-900/50 focus:ring-red-500",
    ghost: "bg-transparent hover:bg-black/10 dark:hover:bg-white/10 opacity-70 hover:opacity-100",
    outline: "bg-transparent border"
  };
  return <button className={`${baseStyle} ${sizeClasses[size]} ${variants[variant] || variants.primary} ${className || ''}`} {...props} />;
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; themeClasses?: any }> = ({ children, className, themeClasses }) => (
  <div className={`rounded-xl overflow-hidden border ${themeClasses?.card} ${className || ''}`}>
    {children}
  </div>
);

export const Input = ({ themeClasses, className, ...props }: any) => (
    <input 
        className={`w-full rounded-lg px-4 py-2 focus:ring-2 focus:outline-none transition-all placeholder-opacity-50 ${themeClasses?.input} ${className || ''}`}
        {...props}
    />
);
