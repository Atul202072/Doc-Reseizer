import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface PDFFileUploadProps {
  onFileSelect: (file: File) => void;
}

const PDFFileUpload: React.FC<PDFFileUploadProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
      <h2 className="text-lg font-semibold text-gray-200 mb-4">1. Upload PDF</h2>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300
          ${isDragging ? 'border-fuchsia-500 bg-slate-700' : 'border-slate-600 hover:border-fuchsia-400 hover:bg-slate-700/50'}`}
      >
        <input
          type="file"
          id="pdf-upload"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept="application/pdf"
          onChange={handleChange}
        />
        <label htmlFor="pdf-upload" className="flex flex-col items-center justify-center space-y-2">
          <UploadIcon className="w-12 h-12 text-slate-500" />
          <p className="text-gray-300">
            <span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-400">PDF documents only</p>
        </label>
      </div>
    </div>
  );
};

export default PDFFileUpload;
