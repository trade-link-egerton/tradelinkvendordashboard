import React, { useState, useRef } from 'react';
import { UploadCloud, X, File as FileIcon } from 'lucide-react';
interface FileUploadProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  onChange?: (files: File[]) => void;
}
export function FileUpload({
  label,
  accept,
  multiple = false,
  maxSize = 5,
  onChange
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const processFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const validFiles = Array.from(newFiles).filter((file) => {
      // Check size
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File ${file.name} is too large. Max size is ${maxSize}MB.`);
        return false;
      }
      return true;
    });
    const updatedFiles = multiple ?
    [...files, ...validFiles] :
    [validFiles[0]].filter(Boolean);
    setFiles(updatedFiles);
    onChange?.(updatedFiles);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };
  const removeFile = (indexToRemove: number) => {
    const updatedFiles = files.filter((_, index) => index !== indexToRemove);
    setFiles(updatedFiles);
    onChange?.(updatedFiles);
  };
  return (
    <div className="w-full">
      {label &&
      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          {label}
        </label>
      }

      <div
        className={`
          border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer
          ${isDragging ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10' : 'border-[var(--border-color)] hover:border-brand-400 bg-[var(--bg-secondary)]'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}>
        
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput} />
        

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-3 bg-[var(--bg-primary)] rounded-full shadow-sm">
            <UploadCloud
              className="text-brand-600 dark:text-brand-400"
              size={24} />
            
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Click to upload{' '}
              <span className="font-normal text-[var(--text-secondary)]">
                or drag and drop
              </span>
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              SVG, PNG, JPG or PDF (max. {maxSize}MB)
            </p>
          </div>
        </div>
      </div>

      {/* File Preview List */}
      {files.length > 0 &&
      <ul className="mt-4 space-y-2">
          {files.map((file, index) =>
        <li
          key={index}
          className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg">
          
              <div className="flex items-center space-x-3 overflow-hidden">
                <FileIcon
              size={16}
              className="text-[var(--text-secondary)] shrink-0" />
            
                <span className="text-sm text-[var(--text-primary)] truncate">
                  {file.name}
                </span>
                <span className="text-xs text-[var(--text-secondary)] shrink-0">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <button
            onClick={(e) => {
              e.stopPropagation();
              removeFile(index);
            }}
            className="p-1 text-[var(--text-secondary)] hover:text-destructive-600 hover:bg-destructive-50 dark:hover:bg-destructive-900/20 rounded transition-colors">
            
                <X size={16} />
              </button>
            </li>
        )}
        </ul>
      }
    </div>);

}