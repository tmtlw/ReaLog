
import React from 'react';

interface WidgetWrapperProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  themeClasses: any;
  className?: string;
}

export const WidgetWrapper: React.FC<WidgetWrapperProps> = ({
  title,
  icon,
  children,
  themeClasses,
  className = ""
}) => {
  return (
    <div className={`rounded-xl border border-white/10 overflow-hidden mb-4 ${themeClasses.card} ${className}`}>
      <div className={`p-3 border-b border-white/5 flex items-center justify-between bg-black/5`}>
        <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider opacity-80">
           {icon && <span className="opacity-70">{icon}</span>}
           {title}
        </div>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};
