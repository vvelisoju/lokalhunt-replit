import React, { useState } from "react";
import Button from "./ui/Button";

export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760, // 10MB default
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
  allowedFileTypes = ['image/*'], // Make file types configurable
  uploadType = 'image', // 'image' or 'resume'
  useOptimizedUpload = false, // New prop for optimized uploads
  onDirectUpload // New prop for direct upload handler
}) {
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [progress, setProgress] = useState(0); // State for progress, as implied by new uploadFile logic

  const handleFileSelect = (event) => {
    const fileList = event.target.files;
    if (!fileList) return;

    const files = Array.from(fileList);

    // Validate file count
    if (files.length > maxNumberOfFiles) {
      alert(`Maximum ${maxNumberOfFiles} file(s) allowed`);
      return;
    }

    // Validate file size
    const oversizedFiles = files.filter(file => file.size > maxFileSize);
    if (oversizedFiles.length > 0) {
      alert(`File size must be less than ${Math.round(maxFileSize / 1024 / 1024)}MB`);
      return;
    }

    // Validate file type
    const invalidFiles = files.filter(file => {
      return !allowedFileTypes.some(type => {
        if (type === 'image/*') return file.type.startsWith('image/');
        if (type === 'application/pdf') return file.type === 'application/pdf';
        return file.type === type;
      });
    });

    if (invalidFiles.length > 0) {
      alert(`Invalid file type. Allowed types: ${allowedFileTypes.join(', ')}`);
      return;
    }

    setSelectedFiles(files);
  };

  // New or modified uploadFile function
  const uploadFile = async (file) => {
    try {
      console.log(`📤 Starting upload for: ${file.name}`);

      // The logic for optimized vs. direct upload is handled here based on props
      if (useOptimizedUpload && typeof onDirectUpload === 'function') {
        console.log(`🚀 Using optimized upload for: ${file.name}`);
        // Call the optimized upload handler
        const result = await onDirectUpload(file);
        console.log(`✅ Optimized upload completed for: ${file.name}`, result);
        
        // Return the result so it can be used in handleUpload
        return { success: true, file, result };
      } else {
        // Fallback to original upload logic using signed URL
        const uploadURL = await onGetUploadParameters();
        console.log(`🔗 Got upload URL for ${file.name}`);

        // Upload to storage, including Content-Type header as per implied changes
        const response = await fetch(uploadURL, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'No error text available');
          throw new Error(`Upload failed: ${response.status} ${errorText}`);
        }

        console.log(`✅ Upload completed for: ${file.name}`);

        // Return the clean URL (without query parameters)
        const cleanURL = uploadURL.split('?')[0];
        return { success: true, file, uploadURL: cleanURL };
      }

    } catch (error) {
      console.error(`❌ Upload failed for ${file.name}:`, error);
      return { success: false, file, error };
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    const results = { successful: [], failed: [] };

    try {
      for (const file of selectedFiles) {
        console.log(`🔄 [UPLOAD] Starting upload for: ${file.name} (${file.type})`);

        // Call the uploadFile function and get the result
        const uploadResult = await uploadFile(file);

        if (uploadResult.success) {
          console.log(`✅ [UPLOAD] Success for: ${file.name}`);
          
          // Create upload result object for onComplete callback
          const successResult = {
            uploadURL: uploadResult.uploadURL || uploadResult.result?.url,
            file: uploadResult.file,
            result: uploadResult.result
          };
          
          results.successful.push(successResult);
        } else {
          console.error(`❌ [UPLOAD] Failed for: ${file.name}`, uploadResult.error);
          results.failed.push({
            file: uploadResult.file,
            error: uploadResult.error
          });
        }
      }

      console.log('🎯 [UPLOAD] All uploads complete:', results);

      if (onComplete) {
        onComplete(results);
      }

      setShowModal(false);
      setSelectedFiles([]);
    } catch (error) {
      console.error('💥 [UPLOAD] Upload process failed:', error);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div>
      <Button onClick={() => setShowModal(true)} className={buttonClassName} disabled={uploading}>
        {children}
      </Button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Upload {uploadType === 'image' ? 'Image' : 'File'}</h3>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
              {selectedFiles.length === 0 ? (
                <div>
                  <input
                    type="file"
                    accept={allowedFileTypes.join(',')}
                    multiple={maxNumberOfFiles > 1}
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="text-gray-600 mb-2">
                      📁 Click to select {uploadType === 'image' ? 'image' : 'file'}(s)
                    </div>
                    <div className="text-sm text-gray-500">
                      Max {maxNumberOfFiles} file(s), up to {Math.round(maxFileSize / 1024 / 1024)}MB each
                    </div>
                    <div className="text-sm text-gray-500">
                      Allowed: {allowedFileTypes.join(', ')}
                    </div>
                  </label>
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Selected files:</h4>
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="text-sm text-gray-600 mb-1">
                        📄 {file.name} ({Math.round(file.size / 1024)}KB)
                      </div>
                    ))}
                  </div>

                  {!uploading && (
                    <Button onClick={() => setSelectedFiles([])} variant="outline" className="mr-2">
                      Clear
                    </Button>
                  )}

                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    {uploading ? '⬆️ Uploading...' : '⬆️ Upload'}
                  </Button>
                </div>
              )}
            </div>

            {uploading && (
              <div className="mb-4">
                <div className="text-center text-gray-600">Uploading to Google Cloud Storage...</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={() => setShowModal(false)} variant="outline" disabled={uploading}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}