
import React, { useState, useCallback, useEffect } from 'react';
import type { ImageSettings, ImageFormat, PdfSettings } from './types';
import FileUpload from './components/FileUpload';
import ControlsPanel from './components/ControlsPanel';
import ImagePreview from './components/ImagePreview';
import ModeSwitcher from './components/ModeSwitcher';
import PDFFileUpload from './components/PDFFileUpload';
import PDFControlsPanel from './components/PDFControlsPanel';
import PDFPreview from './components/PDFPreview';

declare var pdfjsLib: any;
declare var PDFLib: any;

type AppMode = 'image' | 'pdf';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('image');
  
  // Image State
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [originalFileSize, setOriginalFileSize] = useState<number | null>(null);
  const [processedImage, setProcessedImage] = useState<{ src: string; size: number } | null>(null);
  const [imageSettings, setImageSettings] = useState<ImageSettings>({
    width: 1024,
    height: 1024,
    keepAspectRatio: true,
    format: 'jpeg',
    maxSizeKB: 50,
    quality: 0.9,
  });

  // PDF State
  const [originalPdfFile, setOriginalPdfFile] = useState<File | null>(null);
  const [originalPdfInfo, setOriginalPdfInfo] = useState<{ pages: number, size: number, width: number, height: number} | null>(null);
  const [processedPdf, setProcessedPdf] = useState<{ src: string; size: number } | null>(null);
  const [pdfSettings, setPdfSettings] = useState<PdfSettings>({
    maxSizeKB: 100,
    quality: 0.8,
    width: 595,
    height: 842,
    keepAspectRatio: true,
  });


  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state on mode change
  useEffect(() => {
    setError(null);
    setIsProcessing(false);
    // Image state reset
    setOriginalFile(null);
    setOriginalImage(null);
    setOriginalImageSrc(null);
    setOriginalFileSize(null);
    setProcessedImage(null);
    // PDF state reset
    setOriginalPdfFile(null);
    setOriginalPdfInfo(null);
    setProcessedPdf(null);
  }, [mode]);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    setError(null);
    setOriginalFile(file);
    setProcessedImage(null);
    setOriginalFileSize(file.size / 1024);
  }, []);

  const handlePdfFileSelect = useCallback((file: File) => {
    if (file.type !== 'application/pdf') {
        setError('Please select a PDF file.');
        return;
    }
    setError(null);
    setOriginalPdfFile(file);
    setProcessedPdf(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
        const typedarray = new Uint8Array(e.target?.result as ArrayBuffer);
        try {
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 1.0 });

            setOriginalPdfInfo({ 
              pages: pdf.numPages, 
              size: file.size / 1024,
              width: viewport.width,
              height: viewport.height
            });

            setPdfSettings(prev => ({
              ...prev,
              width: Math.round(viewport.width),
              height: Math.round(viewport.height),
            }));

        } catch (err: any) {
            setError(`Failed to load PDF: ${err.message}`);
        }
    };
    reader.readAsArrayBuffer(file);
}, []);
  
  useEffect(() => {
    if (!originalFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setOriginalImageSrc(src);
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        
        const extension = originalFile.name.split('.').pop()?.toLowerCase();
        let targetFormat: ImageFormat = 'png';
        if (extension === 'jpg' || extension === 'jpeg') {
          targetFormat = 'jpeg';
        } else if (extension === 'png') {
          targetFormat = 'png';
        }

        setImageSettings(prev => ({
          ...prev,
          width: img.width,
          height: img.height,
          format: targetFormat
        }));
      };
      img.src = src;
    };
    reader.readAsDataURL(originalFile);
  }, [originalFile]);

  const processImage = useCallback(async () => {
    if (!originalImage) return;

    setIsProcessing(true);
    setError(null);
    setProcessedImage(null);

    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      const canvas = document.createElement('canvas');
      canvas.width = imageSettings.width;
      canvas.height = imageSettings.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(originalImage, 0, 0, imageSettings.width, imageSettings.height);

      let quality = imageSettings.format === 'png' ? 1 : imageSettings.quality;
      const mimeType = `image/${imageSettings.format}`;
      let attempt = 0;
      const maxAttempts = 10;
      
      const getBlob = (currentQuality: number): Promise<Blob | null> => {
        return new Promise(resolve => canvas.toBlob(resolve, mimeType, currentQuality));
      }

      let blob = await getBlob(quality);
      
      if (imageSettings.format !== 'png') {
        while (blob && (blob.size / 1024 > imageSettings.maxSizeKB) && attempt < maxAttempts) {
          quality -= 0.1;
          if(quality <= 0) quality = 0.01;
          blob = await getBlob(quality);
          attempt++;
        }
      }

      if (!blob) throw new Error('Failed to create image blob.');

      if (blob.size / 1024 > imageSettings.maxSizeKB && imageSettings.format !== 'png') {
          setError(`Could not meet the size requirement. Final size: ${(blob.size / 1024).toFixed(1)} KB.`);
      }

      const processedSrc = URL.createObjectURL(blob);
      setProcessedImage({ src: processedSrc, size: blob.size / 1024 });

    } catch (e: any) {
      setError(`An error occurred: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [originalImage, imageSettings]);

  const processPdf = useCallback(async () => {
    if (!originalPdfFile) return;

    setIsProcessing(true);
    setError(null);
    setProcessedPdf(null);

    try {
      const { PDFDocument } = PDFLib;

      const getProcessedPdfBlob = async (quality: number): Promise<Blob> => {
        const newPdfDoc = await PDFDocument.create();
        const existingPdfBytes = await originalPdfFile.arrayBuffer();
        const pdfToProcess = await pdfjsLib.getDocument(existingPdfBytes).promise;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error("Could not create canvas context");

        for (let i = 1; i <= pdfToProcess.numPages; i++) {
            const page = await pdfToProcess.getPage(i);
            const originalViewport = page.getViewport({ scale: 1.0 });

            // Calculate scale to fit into target dimensions while preserving aspect ratio
            const scale = Math.min(
                pdfSettings.width / originalViewport.width,
                pdfSettings.height / originalViewport.height
            );
            const viewport = page.getViewport({ scale });
            
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport: viewport }).promise;

            const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
            const jpegImageBytes = await fetch(jpegDataUrl).then(res => res.arrayBuffer());
            const jpegImage = await newPdfDoc.embedJpg(jpegImageBytes);

            const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
            newPage.drawImage(jpegImage, {
                x: 0,
                y: 0,
                width: newPage.getWidth(),
                height: newPage.getHeight(),
            });
        }
        const pdfBytes = await newPdfDoc.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
      };

      let quality = pdfSettings.quality;
      let blob = await getProcessedPdfBlob(quality);
      let attempt = 0;
      const maxAttempts = 10;

      while (blob.size / 1024 > pdfSettings.maxSizeKB && attempt < maxAttempts) {
          quality -= 0.1;
          if (quality <= 0) quality = 0.01;
          blob = await getProcessedPdfBlob(quality);
          attempt++;
      }

      if (blob.size / 1024 > pdfSettings.maxSizeKB) {
        setError(`Could not meet the size requirement. Final size: ${(blob.size / 1024).toFixed(1)} KB.`);
      }
      
      const processedSrc = URL.createObjectURL(blob);
      setProcessedPdf({ src: processedSrc, size: blob.size / 1024 });

    } catch (e: any) {
        setError(`An error occurred during PDF processing: ${e.message}`);
    } finally {
        setIsProcessing(false);
    }
  }, [originalPdfFile, pdfSettings]);

  const handleImageDownload = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage.src;
    const extension = imageSettings.format;
    const fileName = `processed-image.${extension}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePdfDownload = () => {
    if (!processedPdf) return;
    const link = document.createElement('a');
    link.href = processedPdf.src;
    link.download = 'processed-document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen text-gray-200 font-sans">
      <header className="bg-slate-900/70 backdrop-blur-sm border-b border-fuchsia-500/50 shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400 tracking-tight">Doc Resizer</h1>
          <p className="text-sm sm:text-base text-gray-400 mt-1">Resize, convert, and compress images & documents</p>
        </div>
      </header>
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <ModeSwitcher mode={mode} setMode={setMode} />
        
        {error && (
            <div className="bg-red-900/50 border-l-4 border-red-500 text-red-300 p-4 mb-6 rounded-md" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
            </div>
        )}
        
        {mode === 'image' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <FileUpload onFileSelect={handleFileSelect} />
              {originalImage && (
                <ControlsPanel
                  settings={imageSettings}
                  setSettings={setImageSettings}
                  originalImage={originalImage}
                  processImage={processImage}
                  isProcessing={isProcessing}
                />
              )}
            </div>
            <div className="lg:col-span-2">
              <ImagePreview 
                originalImageSrc={originalImageSrc}
                originalImageSize={originalImage ? { width: originalImage.width, height: originalImage.height } : null}
                originalFileSize={originalFileSize}
                processedImage={processedImage}
                processedImageSize={processedImage ? { width: imageSettings.width, height: imageSettings.height } : null}
                onDownload={handleImageDownload}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <PDFFileUpload onFileSelect={handlePdfFileSelect} />
                {originalPdfFile && (
                    <PDFControlsPanel
                        settings={pdfSettings}
                        setSettings={setPdfSettings}
                        originalPdfInfo={originalPdfInfo}
                        processPdf={processPdf}
                        isProcessing={isProcessing}
                    />
                )}
            </div>
            <div className="lg:col-span-2">
                <PDFPreview
                    pdfFile={originalPdfFile}
                    originalPdfInfo={originalPdfInfo}
                    processedPdf={processedPdf}
                    onDownload={handlePdfDownload}
                />
            </div>
          </div>
        )}
      </main>

      <footer className="text-center py-4 text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Doc Resizer. Built for simplicity.</p>
      </footer>
    </div>
  );
};

export default App;