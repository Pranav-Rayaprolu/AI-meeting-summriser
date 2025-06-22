import React, { useState, useCallback } from "react";
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";

const FileUploader: React.FC = () => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const { addMeeting } = useApp();
  const { state: authState } = useAuth();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (isValidFileType(file)) {
          setUploadedFile(file);
          if (!meetingTitle) {
            setMeetingTitle(file.name.replace(/\.[^/.]+$/, ""));
          }
        }
      }
    },
    [meetingTitle]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (isValidFileType(file)) {
        setUploadedFile(file);
        if (!meetingTitle) {
          setMeetingTitle(file.name.replace(/\.[^/.]+$/, ""));
        }
      }
    }
  };

  const isValidFileType = (file: File) => {
    const validTypes = [
      "text/plain",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    return validTypes.includes(file.type) || file.name.endsWith(".txt");
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  const handleUpload = async () => {
    if (!uploadedFile || !meetingTitle.trim() || !authState.user) return;

    setIsUploading(true);
    setUploadStatus("idle");

    try {
      const formData = new FormData();
      formData.append("title", meetingTitle.trim());
      formData.append("file", uploadedFile);

      await addMeeting(formData);
      setUploadStatus("success");
      setErrorMessage("");

      // Reset form
      setTimeout(() => {
        setUploadedFile(null);
        setMeetingTitle("");
        setUploadStatus("idle");
      }, 2000);
    } catch (error: any) {
      console.error("Upload failed:", error);
      setUploadStatus("error");
      setErrorMessage(
        error.response?.data?.detail || "An unexpected error occurred."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setMeetingTitle("");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card flex flex-col items-center justify-center">
        <h2 className="text-primary text-2xl font-bold mb-4">
          Upload Meeting Transcript
        </h2>
        <input
          className="w-full rounded-xl bg-light-bg dark:bg-dark-elevated text-primary placeholder:text-secondary border border-light-border dark:border-dark-border focus:ring-2 focus:ring-dark-accent focus:border-dark-accent shadow-sm dark:shadow-[0_1px_4px_rgba(187,134,252,0.08)] p-3 mb-4 transition-all"
          id="meetingTitle"
          type="text"
          value={meetingTitle}
          onChange={(e) => setMeetingTitle(e.target.value)}
          placeholder="Enter meeting title..."
        />
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
            isDragActive
              ? "border-blue-400 bg-blue-50"
              : uploadedFile
                ? "border-green-300 bg-green-50"
                : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            onChange={handleFileInput}
            accept=".txt,.pdf,.docx"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />

          {uploadedFile ? (
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 inline-block">
                <div className="flex items-center space-x-3">
                  <File className="w-8 h-8 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {uploadedFile.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(uploadedFile.size)}
                    </p>
                  </div>
                  <button
                    onClick={removeFile}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    disabled={isUploading}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {isDragActive
                  ? "Drop your file here"
                  : "Upload your meeting transcript"}
              </h3>
              <p className="text-gray-500 mb-4">
                Drag and drop your file here, or click to browse
              </p>
              <p className="text-sm text-gray-400">
                Supported formats: TXT, PDF, DOCX (Max 10MB)
              </p>
            </div>
          )}
        </div>

        {/* Status Messages */}
        {uploadStatus === "success" && (
          <div className="mt-4 p-4 bg-green-100 border border-green-200 text-green-700 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 mr-3" />
            File uploaded successfully! Your meeting summary will be ready
            shortly.
          </div>
        )}
        {uploadStatus === "error" && (
          <div className="mt-4 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-3" />
            {errorMessage}
          </div>
        )}

        {/* Upload Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleUpload}
            disabled={!uploadedFile || !meetingTitle.trim() || isUploading}
            className={`mt-6 w-60 flex items-center justify-center px-7 py-3 rounded-full font-extrabold text-lg transition-all shadow-xl
              ${
                isUploading
                  ? "bg-gray-300 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-appleblue to-applepurple text-white drop-shadow-lg hover:scale-105 hover:shadow-2xl focus:ring-4 focus:ring-appleblue/40 active:scale-98"
              }
            `}
          >
            <Upload className="w-6 h-6 mr-2 -ml-1" />
            {isUploading ? "Uploading..." : "Upload & Process"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
