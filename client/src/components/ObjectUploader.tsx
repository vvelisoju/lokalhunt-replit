import React, { useState } from "react";
import Uppy from "@uppy/core";
import { Dashboard } from "@uppy/react";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import AwsS3 from "@uppy/aws-s3";
import Button from "./ui/Button";

export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760, // 10MB default
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}) {
  const [showModal, setShowModal] = useState(false);
  
  const [uppy] = useState(() => {
    const uppyInstance = new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
        allowedFileTypes: ['image/*']
      },
      autoProceed: false,
    });

    uppyInstance.use(AwsS3, {
      shouldUseMultipart: false,
      getUploadParameters: async (file) => {
        console.log('Getting upload parameters for file:', file);
        try {
          const params = await onGetUploadParameters();
          console.log('Upload parameters:', params);
          return params;
        } catch (error) {
          console.error('Error getting upload parameters:', error);
          throw error;
        }
      },
    });

    uppyInstance.on("complete", (result) => {
      console.log('Upload complete:', result);
      if (onComplete) {
        onComplete(result);
      }
      setShowModal(false);
    });

    uppyInstance.on("upload-error", (file, error, response) => {
      console.error('Upload error:', error, response);
    });

    return uppyInstance;
  });

  return (
    <div>
      <Button onClick={() => setShowModal(true)} className={buttonClassName}>
        {children}
      </Button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
            <Dashboard
              uppy={uppy}
              proudlyDisplayPoweredByUppy={false}
              height={400}
            />
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setShowModal(false)} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}