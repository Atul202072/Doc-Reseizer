import React from 'react';
import { DownloadIcon } from './icons/DownloadIcon';

interface ImagePreviewProps {
  originalImageSrc: string | null;
  originalImageSize: { width: number; height: number } | null;
  originalFileSize: number | null;
  processedImage: { src: string; size: number } | null;
  processedImageSize: { width: number; height: number } | null;
  onDownload: () => void;
}

const Placeholder: React.FC<{ title: string }> = ({ title }) => (
  <div className="w-full h-full bg-slate-800 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-slate-700">
    <div className="text-center p-4">
      <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
      <p className="text-sm text-gray-400 mt-1">
        {title === 'Original Image' ? 'Upload an image to get started' : 'Adjust settings and process'}
      </p>
    </div>
  </div>
);

const ImageCard: React.FC<{
  title: string;
  src: string;
  size: number | null;
  dimensions: { width: number; height: number } | null;
}> = ({ title, src, size, dimensions }) => (
  <div className="flex flex-col h-full">
    <div className="flex-grow p-4 bg-black/20 rounded-t-lg shadow-lg border-x border-t border-slate-700 flex items-center justify-center">
      <img src={src} alt={title} className="max-w-full max-h-full object-contain" style={{maxHeight: '60vh'}} />
    </div>
    <div className="bg-slate-900 border-x border-b border-slate-700 text-gray-200 text-center py-2 px-4 rounded-b-lg shadow-lg">
      <h3 className="font-semibold">{title}</h3>
      <div className="text-sm opacity-80 flex justify-center items-center space-x-4">
        {size !== null && <span>{size.toFixed(2)} KB</span>}
        {size !== null && dimensions && <span className="opacity-50">|</span>}
        {dimensions && <span>{dimensions.width} × {dimensions.height} px</span>}
      </div>
    </div>
  </div>
);

const ImagePreview: React.FC<ImagePreviewProps> = ({ 
  originalImageSrc, 
  originalImageSize,
  originalFileSize, 
  processedImage, 
  processedImageSize,
  onDownload
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start h-full">
      <div className="h-full">
        {originalImageSrc ? (
          <ImageCard title="Original Image" src={originalImageSrc} size={originalFileSize} dimensions={originalImageSize} />
        ) : (
          <Placeholder title="Original Image" />
        )}
      </div>
      <div className="h-full flex flex-col space-y-4">
        {processedImage ? (
          <>
            <ImageCard title="Processed Image" src={processedImage.src} size={processedImage.size} dimensions={processedImageSize} />
            <button
              onClick={onDownload}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-slate-900 transition-transform transform hover:scale-105"
            >
              <DownloadIcon className="w-5 h-5 mr-2" />
              Download Image
            </button>
          </>
        ) : (
          <Placeholder title="Processed Image" />
        )}
      </div>
    </div>
  );
};

export default ImagePreview;
