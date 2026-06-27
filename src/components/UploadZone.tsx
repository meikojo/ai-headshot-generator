'use client';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, ImageIcon } from 'lucide-react';

interface Props {
  onFile: (file: File) => void;
  preview?: string;
  accept?: Record<string, string[]>;
  label?: string;
}

export function UploadZone({ onFile, preview, accept, label = 'Upload Image' }: Props) {
  const onDrop = useCallback((files: File[]) => {
    if (files[0]) onFile(files[0]);
  }, [onFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ?? { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  return (
    <div {...getRootProps()} className={`upload-zone min-h-64 relative ${
      isDragActive ? 'border-accent bg-accent/5' : 'hover:bg-surface/50'
    }`}>
      <input
        {...getInputProps()}
        data-testid="upload-zone"
        style={{
          display: 'block',
          opacity: 0,
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          cursor: 'pointer',
        }}
      />
      {preview ? (
        <img src={preview} alt="Preview" className="max-h-64 max-w-full rounded-xl object-contain" />
      ) : (
        <>
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
            {isDragActive ? <ImageIcon className="text-accent" size={28} /> : <Upload className="text-accent" size={28} />}
          </div>
          <p className="text-text-primary font-semibold mb-1">{isDragActive ? 'Drop it here!' : label}</p>
          <p className="text-muted text-sm">Drag & drop or click to browse</p>
          <p className="text-muted text-xs mt-2">JPEG, PNG, WebP · max 10MB</p>
        </>
      )}
    </div>
  );
}
