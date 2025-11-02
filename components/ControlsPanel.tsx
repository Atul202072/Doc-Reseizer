import React from 'react';
import type { ImageSettings, ImageFormat } from '../types';
import { LockIcon } from './icons/LockIcon';
import { UnlockIcon } from './icons/UnlockIcon';

interface ControlsPanelProps {
  settings: ImageSettings;
  setSettings: React.Dispatch<React.SetStateAction<ImageSettings>>;
  originalImage: HTMLImageElement;
  processImage: () => void;
  isProcessing: boolean;
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  settings,
  setSettings,
  originalImage,
  processImage,
  isProcessing,
}) => {
  const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10) || 0;
    
    if (name === 'width' && settings.keepAspectRatio) {
      const aspectRatio = originalImage.height / originalImage.width;
      setSettings(prev => ({
        ...prev,
        width: numValue,
        height: Math.round(numValue * aspectRatio)
      }));
    } else if (name === 'height' && settings.keepAspectRatio) {
      const aspectRatio = originalImage.width / originalImage.height;
      setSettings(prev => ({
        ...prev,
        height: numValue,
        width: Math.round(numValue * aspectRatio)
      }));
    } else {
      setSettings(prev => ({ ...prev, [name]: numValue }));
    }
  };

  const getQualityLabel = (quality: number) => {
    if (quality <= 0.35) return 'Low';
    if (quality <= 0.75) return 'Medium';
    return 'High';
  };
  
  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700 space-y-6">
      <h2 className="text-lg font-semibold text-gray-200">2. Adjust Settings</h2>

      {/* Dimensions */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Dimensions (px)</label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            name="width"
            value={settings.width}
            onChange={handleDimensionChange}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-gray-200 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 hover:border-cyan-400 transition-colors"
            placeholder="Width"
          />
          <span className="text-gray-500">×</span>
          <input
            type="number"
            name="height"
            value={settings.height}
            onChange={handleDimensionChange}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-gray-200 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 hover:border-cyan-400 transition-colors"
            placeholder="Height"
          />
          <button
            onClick={() => setSettings(prev => ({ ...prev, keepAspectRatio: !prev.keepAspectRatio }))}
            className="p-2 rounded-md hover:bg-slate-700 text-slate-400 hover:text-cyan-400 transition-colors"
            title={settings.keepAspectRatio ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
          >
            {settings.keepAspectRatio ? <LockIcon className="w-5 h-5" /> : <UnlockIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Max File Size */}
      <div>
        <label htmlFor="maxSize" className="block text-sm font-medium text-gray-300 mb-1">Max File Size (KB)</label>
        <input
          id="maxSize"
          type="number"
          value={settings.maxSizeKB}
          onChange={(e) => setSettings(prev => ({ ...prev, maxSizeKB: parseInt(e.target.value, 10) || 0 }))}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-gray-200 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 hover:border-cyan-400 transition-colors"
        />
      </div>

      {/* Format & Quality */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="format" className="block text-sm font-medium text-gray-300 mb-1">Format</label>
          <select
            id="format"
            value={settings.format}
            onChange={(e) => setSettings(prev => ({ ...prev, format: e.target.value as ImageFormat }))}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-gray-200 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 hover:border-cyan-400 transition-colors"
          >
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
            <option value="webp">WEBP</option>
            <option value="avif">AVIF</option>
          </select>
        </div>
        {settings.format !== 'png' && (
          <div>
            <label htmlFor="quality" className="block text-sm font-medium text-gray-300 mb-1">Quality</label>
            <div className="flex items-center space-x-2">
              <input
                id="quality"
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={settings.quality}
                onChange={(e) => setSettings(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
               <span className="text-sm font-semibold text-cyan-400 w-16 text-center">{getQualityLabel(settings.quality)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
              <button onClick={() => setSettings(prev => ({ ...prev, quality: 0.3 }))} className="hover:text-cyan-400 transition-colors">Low</button>
              <button onClick={() => setSettings(prev => ({ ...prev, quality: 0.65 }))} className="hover:text-cyan-400 transition-colors">Medium</button>
              <button onClick={() => setSettings(prev => ({ ...prev, quality: 0.9 }))} className="hover:text-cyan-400 transition-colors">High</button>
            </div>
          </div>
        )}
      </div>


      {/* Process Button */}
      <button
        onClick={processImage}
        disabled={isProcessing}
        className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-fuchsia-600 hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-500 focus:ring-offset-slate-800 disabled:bg-fuchsia-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-transform transform hover:scale-105"
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing Image...
          </>
        ) : 'Process Image'}
      </button>
    </div>
  );
};

export default ControlsPanel;