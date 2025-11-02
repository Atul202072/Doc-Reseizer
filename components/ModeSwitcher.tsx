import React from 'react';

type AppMode = 'image' | 'pdf';

interface ModeSwitcherProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
}

const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ mode, setMode }) => {
  const getButtonClasses = (buttonMode: AppMode) => {
    const baseClasses = 'w-full text-center px-4 py-3 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900';
    if (mode === buttonMode) {
      return `${baseClasses} bg-cyan-500 text-slate-900 shadow-lg ring-cyan-400`;
    }
    return `${baseClasses} bg-slate-800 text-gray-300 hover:bg-slate-700`;
  };

  return (
    <div className="mb-8 p-1.5 bg-slate-900 rounded-lg grid grid-cols-2 gap-2 max-w-sm mx-auto">
      <button onClick={() => setMode('image')} className={getButtonClasses('image')}>
        Image Editor
      </button>
      <button onClick={() => setMode('pdf')} className={getButtonClasses('pdf')}>
        PDF Editor
      </button>
    </div>
  );
};

export default ModeSwitcher;