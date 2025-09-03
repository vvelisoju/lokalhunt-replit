import React, { useState, useEffect } from "react";
import {
  DocumentIcon,
  CloudArrowUpIcon,
  EyeIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon, // Added this import
  PlusIcon, // Added this import
} from "@heroicons/react/24/outline";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import Loader from "../../components/ui/Loader";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useCandidate } from "../../context/CandidateContext";
import { useCandidateAuth } from "../../hooks/useCandidateAuth";
import { candidateApi, getImageUrl } from "../../services/candidateApi";

const Resume = () => {
  const { user } = useCandidateAuth();
  const { uploadResume, deleteResume, loading } = useCandidate();
  const [resume, setResume] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchResumeData();
    }
  }, [user]);

  // Refresh resume data when page becomes visible (useful after onboarding)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        fetchResumeData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user]);

  const allowedFileTypes = [".pdf", ".doc", ".docx"];
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  const showAlert = (message, type = "error") => {
    // Create a temporary alert element
    const alertDiv = document.createElement("div");
    alertDiv.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
      type === "error"
        ? "bg-red-100 border border-red-400 text-red-700"
        : type === "warning"
          ? "bg-yellow-100 border border-yellow-400 text-yellow-700"
          : "bg-green-100 border border-green-400 text-green-700"
    }`;
    alertDiv.innerHTML = `
      <div class="flex">
        <div class="flex-1">
          <p class="text-sm font-medium">${message}</p>
        </div>
        <button class="ml-3 text-lg font-bold hover:opacity-70" onclick="this.parentElement.parentElement.remove()">&times;</button>
      </div>
    `;
    document.body.appendChild(alertDiv);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (alertDiv.parentElement) {
        alertDiv.remove();
      }
    }, 5000);
  };

  const handleFileSelect = (files) => {
    const file = files[0];
    if (!file) return;

    // Validate file type
    const fileExtension = "." + file.name.split(".").pop().toLowerCase();
    if (!allowedFileTypes.includes(fileExtension)) {
      showAlert(
        `Please select a valid file type: ${allowedFileTypes.join(", ")}`,
        "error",
      );
      return;
    }

    // Validate file size with user-friendly message
    if (file.size > maxFileSize) {
      const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      showAlert(
        `File size (${fileSizeInMB}MB) exceeds the 5MB limit. Please choose a smaller file.`,
        "warning",
      );
      return;
    }

    handleUpload(file);
  };

  const handleUpload = async (file) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const uploadedResume = await uploadResume(file);
      console.log("Uploaded resume:", uploadedResume);
      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        setResume(uploadedResume);
        setUploadProgress(0);
        setIsUploading(false);
        // Refresh the resume data from backend after successful upload
        fetchResumeData();
      }, 500);
    } catch (error) {
      setUploadProgress(0);
      setIsUploading(false);
      console.error("Upload failed:", error);

      // Show user-friendly error message
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to upload resume";
      showAlert(`Upload failed: ${errorMessage}`, "error");
    }
  };

  const fetchResumeData = async () => {
    try {
      console.log("🔍 Fetching resume data...");
      const response = await candidateApi.getResume();
      console.log("📄 Resume API response:", response.data);

      const resumeData = response.data?.data || response.data;
      console.log("📋 Processed resume data:", resumeData);

      // Check if we have valid resume data with a proper URL
      if (
        resumeData &&
        resumeData.url &&
        resumeData.url !== null &&
        resumeData.url !== "null"
      ) {
        // Verify the URL is not empty or just whitespace
        const cleanUrl = resumeData.url.trim();
        if (cleanUrl && cleanUrl.length > 0) {
          setResume(resumeData);
          console.log("✅ Resume data set successfully");
        } else {
          console.log("⚠️ Resume URL is empty or invalid");
          setResume(null);
        }
      } else {
        console.log("⚠️ No valid resume data found");
        setResume(null);
      }
    } catch (error) {
      console.error("❌ Error fetching resume:", error);
      setResume(null);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteResume();
      setResume(null);
      // Refresh data from backend to ensure UI is in sync
      fetchResumeData();
      showAlert("Resume deleted successfully!", "success");
    } catch (error) {
      console.error("Delete failed:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete resume";
      showAlert(`Delete failed: ${errorMessage}`, "error");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const extension = fileName?.split(".").pop()?.toLowerCase();
    return <DocumentIcon className="h-8 w-8 text-red-500" />;
  };

  const getResumeUrl = (resumeUrl) => {
    if (!resumeUrl) return null;

    // Use the same URL generation logic as getImageUrl for consistency
    return getImageUrl(resumeUrl);
  };

  const handlePreview = async () => {
    console.log("Handling resume preview...", resume);
    if (!resume?.url) {
      showAlert(
        "Resume URL not available. Please try refreshing the page.",
        "error",
      );
      return;
    }

    console.log("Original resume URL from API:", resume.url);
    const url = getResumeUrl(resume.url);
    console.log("Generated preview URL:", url);
    console.log("Window location:", window.location.origin);

    if (!url) {
      showAlert(
        "Unable to generate preview URL. Please try downloading instead.",
        "error",
      );
      return;
    }

    try {
      // Test if the URL is accessible before opening
      console.log("Testing URL accessibility:", url);
      const response = await fetch(url, { method: "HEAD" });
      console.log("Response status:", response.status, "OK:", response.ok);

      if (response.ok) {
        // Show loading indicator
        showAlert("Opening resume preview...", "success");
        window.open(url, "_blank");
      } else {
        console.error(
          "Resume URL not accessible:",
          response.status,
          response.statusText,
        );
        showAlert(
          `Resume not accessible (${response.status}). Please try re-uploading your resume.`,
          "error",
        );
      }
    } catch (error) {
      console.error("Error accessing resume URL:", error);
      showAlert(
        "Unable to preview resume. Please check your internet connection or try downloading instead.",
        "error",
      );
    }
  };

  const handleDownload = async () => {
    if (!resume?.url) {
      showAlert(
        "Resume URL not available. Please try refreshing the page.",
        "error",
      );
      return;
    }

    console.log("Original resume URL for download:", resume.url);
    const url = getResumeUrl(resume.url);
    console.log("Generated download URL:", url);

    if (!url) {
      showAlert(
        "Unable to generate download URL. Please try re-uploading your resume.",
        "error",
      );
      return;
    }

    try {
      // Show loading indicator
      showAlert("Starting download...", "success");

      // Test if the URL is accessible
      console.log("Testing download URL accessibility:", url);
      const response = await fetch(url, { method: "HEAD" });
      console.log(
        "Download URL response status:",
        response.status,
        "OK:",
        response.ok,
      );

      if (!response.ok) {
        console.error(
          "Resume URL not accessible:",
          response.status,
          response.statusText,
        );
        showAlert(
          `Resume not accessible (${response.status}). Please try re-uploading your resume.`,
          "error",
        );
        return;
      }

      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = resume.fileName || "resume.pdf";
      link.target = "_blank";

      // Add error handling
      link.onerror = () => {
        showAlert(
          "Download failed. Please try again or contact support.",
          "error",
        );
      };

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Success feedback
      setTimeout(() => {
        showAlert("Download completed successfully!", "success");
      }, 1000);
    } catch (error) {
      console.error("Error downloading resume:", error);
      showAlert(
        "Unable to download resume. Please check your internet connection and try again.",
        "error",
      );
    }
  };

  return (
    <div>
      <div className="space-y-2">
        {/* Page Header */}
        <div className="p-2">
          <h1 className="text-xl font-bold text-gray-900">Manage Resume</h1>
        </div>

        {/* Resume Status Alert */}
        {!resume && (
          <Alert
            type="warning"
            title="Resume Required"
            message="Upload your resume to improve your chances of getting hired. Most employers require a resume to consider your application."
          />
        )}

        {resume && (
          <Alert
            type="success"
            title="Resume Uploaded"
            message="Your resume is ready! Employers can now view your qualifications when you apply for jobs."
          />
        )}

        {/* Upload/Current Resume Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Upload Area */}
          <Card>
            <Card.Header>
              <Card.Title className="text-lg sm:text-xl">
                {resume ? "Update Resume" : "Upload Resume"}
              </Card.Title>
            </Card.Header>
            <Card.Content>
              {isUploading ? (
                <div className="text-center py-8 sm:py-12">
                  <Loader size="lg" text="Uploading resume..." />
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {uploadProgress}% complete
                  </p>
                </div>
              ) : (
                <div
                  className={`
                  border-2 border-dashed rounded-lg p-4 sm:p-8 text-center transition-colors
                  ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}
                  hover:border-gray-400 cursor-pointer
                `}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() =>
                    document.getElementById("resume-upload").click()
                  }
                >
                  <CloudArrowUpIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                  <div className="mt-4">
                    <p className="text-sm sm:text-lg font-medium text-gray-900">
                      Drop your resume here, or click to browse
                    </p>
                    <p className="mt-2 text-xs sm:text-sm text-gray-600">
                      Supports PDF, DOC, DOCX up to 5MB
                    </p>
                  </div>

                  <input
                    id="resume-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileSelect(e.target.files)}
                  />

                  <div className="mt-4 sm:mt-6">
                    <Button variant="primary" className="w-full sm:w-auto">
                      Choose File
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-4 text-xs text-gray-500 space-y-1">
                <p>• Maximum file size: 5MB</p>
                <p>• Supported formats: PDF, DOC, DOCX</p>
                <p>• Make sure your resume is up-to-date and error-free</p>
              </div>
            </Card.Content>
          </Card>

          {/* Current Resume */}
          <Card>
            <Card.Header>
              <Card.Title className="text-lg sm:text-xl">
                Current Resume
              </Card.Title>
            </Card.Header>
            <Card.Content>
              {resume && resume.url && resume.url.trim() ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 border border-gray-200 rounded-lg">
                    {getFileIcon(resume.fileName)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {resume.fileName || "resume.pdf"}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {formatFileSize(resume.fileSize || 0)} • Uploaded{" "}
                        {new Date(
                          resume.uploadedAt || Date.now(),
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                  </div>

                  {/* Mobile: Stack buttons vertically */}
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 justify-center"
                      onClick={handlePreview}
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      Preview
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 justify-center"
                      onClick={handleDownload}
                    >
                      <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                      Download
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDelete}
                      className="text-red-600 hover:text-red-700 flex-1 sm:flex-initial justify-center"
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <DocumentTextIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No resume uploaded
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">
                    Upload your resume to start applying for jobs
                  </p>
                </div>
              )}
            </Card.Content>
          </Card>
        </div>

        {/* Resume Tips */}
        <Card>
          <Card.Header>
            <Card.Title className="text-lg sm:text-xl">Resume Tips</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">
                  What to Include
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Contact information and professional summary</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Relevant work experience with achievements</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Education and certifications</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Skills relevant to your target jobs</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Keywords from job descriptions</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">
                  Best Practices
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                  <li className="flex items-start">
                    <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Keep it concise (1-2 pages maximum)</span>
                  </li>
                  <li className="flex items-start">
                    <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Use a clean, professional format</span>
                  </li>
                  <li className="flex items-start">
                    <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Proofread for spelling and grammar</span>
                  </li>
                  <li className="flex items-start">
                    <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Tailor it for each job application</span>
                  </li>
                  <li className="flex items-start">
                    <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Save as PDF to preserve formatting</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={confirmDelete}
          title="Delete Resume"
          message="Are you sure you want to delete your resume? This action cannot be undone and you'll need to upload a new resume to apply for jobs."
          confirmText="Delete Resume"
          cancelText="Keep Resume"
          variant="danger"
        />
      </div>
    </div>
  );
};

export default Resume;
