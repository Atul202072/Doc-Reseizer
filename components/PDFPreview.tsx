import React, { useEffect, useRef } from 'react';
import { DownloadIcon } from './icons/DownloadIcon';

declare var pdfjsLib: any;

interface PDFPreviewProps {
  pdfFile: File | null;
  originalPdfInfo: { pages: number; size: number } | null;
  processedPdf: { src: string; size: number } | null;
  onDownload: () => void;
}

const Placeholder: React.FC<{ title: string }> = ({ title }) => (
  <div className="w-full h-full bg-slate-800 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-slate-700">
    <div className="text-center p-4">
      <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
      <p className="text-sm text-gray-400 mt-1">
        {title === 'Original PDF' ? 'Upload a document to get started' : 'Adjust settings and process'}
      </p>
    </div>
  </div>
);

const PDFCard: React.FC<{
  title: string;
  pdfSource: File | string | null;
  info: { pages: number; size: number } | null;
}> = ({ title, pdfSource, info }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (pdfSource && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      const renderPdf = async () => {
        try {
          let sourceData: any = pdfSource;
          // If the source is a File, read it as an ArrayBuffer for pdfjs
          if (pdfSource instanceof File) {
            sourceData = new Uint8Array(await pdfSource.arrayBuffer());
          }
          
          const pdf = await pdfjsLib.getDocument(sourceData).promise;
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 1.0 });
          
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          page.render({ canvasContext: context, viewport: viewport });
        } catch (error) {
          console.error(`Failed to render PDF preview for ${title}:`, error);
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.textAlign = "center";
          context.fillStyle = "#f87171"; // Tailwind red-400
          context.fillText("Error rendering preview", canvas.width/2, canvas.height/2);
        }
      };
      renderPdf();
    }
  }, [pdfSource, title]);


  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow p-4 bg-black/20 rounded-t-lg shadow-lg border-x border-t border-slate-700 flex items-center justify-center">
        <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" style={{maxHeight: '60vh'}} />
      </div>
      <div className="bg-slate-900 border-x border-b border-slate-700 text-gray-200 text-center py-2 px-4 rounded-b-lg shadow-lg">
        <h3 className="font-semibold">{title}</h3>
        <div className="text-sm opacity-80 flex justify-center items-center space-x-4">
          {info && <span>{info.size.toFixed(2)} KB</span>}
          {info && info.pages > 0 && <span className="opacity-50">|</span>}
          {info && info.pages > 0 && <span>{info.pages} page{info.pages > 1 ? 's' : ''}</span>}
        </div>
      </div>
    </div>
  );
}

const PDFPreview: React.FC<PDFPreviewProps> = ({ 
  pdfFile,
  originalPdfInfo,
  processedPdf, 
  onDownload
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start h-full">
      <div className="h-full">
        {pdfFile ? (
          <PDFCard title="Original PDF" pdfSource={pdfFile} info={originalPdfInfo} />
        ) : (
          <Placeholder title="Original PDF" />
        )}
      </div>
      <div className="h-full flex flex-col space-y-4">
        {processedPdf ? (
            <>
                <PDFCard 
                    title="Processed PDF" 
                    pdfSource={processedPdf.src} 
                    info={{ pages: originalPdfInfo?.pages || 0, size: processedPdf.size }}
                />
                <button
                onClick={onDownload}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-slate-900 transition-transform transform hover:scale-105"
                >
                <DownloadIcon className="w-5 h-5 mr-2" />
                Download PDF
                </button>
            </>
        ) : (
          <Placeholder title="Processed PDF" />
        )}
      </div>
    </div>
  );
};

export default PDFPreview;
