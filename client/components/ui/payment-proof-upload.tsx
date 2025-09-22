import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, FileText, Image } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentProofUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile?: File | null;
  className?: string;
}

export function PaymentProofUpload({ 
  onFileSelect, 
  selectedFile, 
  className 
}: PaymentProofUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (isValidFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault(); // Prevent form submission
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (isValidFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const isValidFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid file type (JPEG, PNG, WebP, or PDF)');
      return false;
    }
    
    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      return false;
    }
    
    return true;
  };

  const removeFile = () => {
    onFileSelect(null);
  };

  const getFileIcon = () => {
    if (!selectedFile) return <Upload className="w-6 h-6" />;
    
    if (selectedFile.type.startsWith('image/')) {
      return <Image className="w-6 h-6" />;
    }
    
    return <FileText className="w-6 h-6" />;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Label htmlFor="payment-proof">Payment Proof</Label>
      
      {!selectedFile ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
            dragActive 
              ? "border-blue-500 bg-blue-50" 
              : "border-gray-300 hover:border-gray-400"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-2">
            {getFileIcon()}
            <div className="text-sm text-gray-600">
              <p>Drag and drop payment proof here, or</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => document.getElementById('payment-proof')?.click()}
              >
                Browse Files
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Supports: JPEG, PNG, WebP, PDF (Max 5MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getFileIcon()}
              <div>
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
      
      <Input
        id="payment-proof"
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileInput}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
          }
        }}
        onClick={(e) => e.stopPropagation()}
        className="hidden"
      />
    </div>
  );
}
