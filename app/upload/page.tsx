'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  X, 
  AlertCircle,
  File,
  Sparkles
} from 'lucide-react';

interface UploadResponse {
  success: boolean;
  resume: {
    id: string;
    fileName: string;
    fileUrl: string;
    createdAt: string;
  };
  message: string;
}

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Validate file before setting
  const validateAndSetFile = useCallback((selectedFile: File) => {
    setError('');
    setSuccess(false);

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (selectedFile.size > maxSize) {
      setError('File size must be less than 5MB');
      return false;
    }

    // Check file type
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const isValidType =
      validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.docx');

    if (!isValidType) {
      setError('Invalid file type. Please upload PDF or DOCX files only.');
      return false;
    }

    setFile(selectedFile);
    return true;
  }, []);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        validateAndSetFile(droppedFile);
      }
    },
    [validateAndSetFile]
  );

  // Handle upload
  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress (since we can't track actual upload progress easily)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data: UploadResponse | { error: string } = await response.json();

      if (!response.ok) {
        throw new Error('error' in data ? data.error : 'Upload failed');
      }

      if ('success' in data && data.success) {
        setSuccess(true);
        setUploadedFileUrl(data.resume.fileUrl);
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setFile(null);
    setError('');
    setSuccess(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Upload Resume
        </h1>
        <p className="text-gray-600 mt-2">
          Upload your resume to start analyzing job matches with AI
        </p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Select Resume File</CardTitle>
          <CardDescription>
            Upload a PDF or DOCX file (maximum 5MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-xl p-12 text-center transition-all
              ${isDragging 
                ? 'border-purple-500 bg-purple-50 scale-[1.02]' 
                : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/30'
              }
              ${isUploading || success ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              id="file-upload"
              className="hidden"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              disabled={isUploading || success}
            />
            
            <label 
              htmlFor="file-upload" 
              className="cursor-pointer flex flex-col items-center"
            >
              <div className="mb-4 p-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl">
                <Upload className="h-10 w-10 text-purple-600" />
              </div>
              
              <p className="text-lg font-semibold text-gray-900 mb-2">
                {isDragging ? 'Drop your file here' : 'Drag and drop your resume'}
              </p>
              
              <p className="text-sm text-gray-600 mb-4">
                or click to browse files
              </p>
              
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                <File className="h-4 w-4" />
                <span>PDF or DOCX • Max 5MB</span>
              </div>
            </label>
          </div>

          {/* Selected File Display */}
          {file && !success && (
            <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-purple-50 to-blue-50 border-0 rounded-xl shadow-sm">
              <div className="flex-shrink-0">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-md">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{file.name}</p>
                <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
              </div>
              
              {!isUploading && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="flex-shrink-0 hover:bg-red-50 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 font-medium">Uploading...</span>
                <span className="font-bold text-purple-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-full transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900">Upload Failed</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl shadow-sm">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-900">Upload Successful!</p>
                <p className="text-sm text-green-700 mt-1">
                  Your resume has been uploaded and processed. Redirecting to dashboard...
                </p>
                {uploadedFileUrl && (
                  <a
                    href={uploadedFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 hover:text-green-700 underline mt-2 inline-block font-medium"
                  >
                    View uploaded file
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!file || isUploading || success}
            className="w-full h-12 text-base bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all"
            size="lg"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Uploading Resume...
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Upload Complete
              </>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Upload Resume
              </>
            )}
          </Button>

          {/* Info Section */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Supported File Formats
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full" />
                <span>PDF (.pdf)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full" />
                <span>Word (.docx)</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-3 leading-relaxed">
              Your resume will be securely stored and analyzed using AI to match with job descriptions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
