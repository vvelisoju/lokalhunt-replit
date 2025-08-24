
const { Storage } = require("@google-cloud/storage");
const { randomUUID } = require("crypto");

class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

// Initialize Google Cloud Storage client
const initializeGCS = () => {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  const keyFilename = process.env.GOOGLE_CLOUD_STORAGE_KEY_FILE;
  const serviceAccountKey = process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY;

  if (!projectId) {
    throw new Error("GOOGLE_CLOUD_PROJECT_ID environment variable is required");
  }

  const config = { projectId };
  
  // Use service account key from environment variable (preferred for Replit)
  if (serviceAccountKey) {
    try {
      config.credentials = JSON.parse(serviceAccountKey);
    } catch (error) {
      console.error("Invalid GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY JSON:", error.message);
      throw new Error("Invalid service account key JSON format");
    }
  }
  // Use service account key file if provided
  else if (keyFilename) {
    config.keyFilename = keyFilename;
  }

  return new Storage(config);
};

// Initialize the storage client
let storage;
try {
  storage = initializeGCS();
} catch (error) {
  console.warn("Google Cloud Storage not properly configured:", error.message);
  console.warn("Please set GOOGLE_CLOUD_PROJECT_ID and optionally GOOGLE_CLOUD_STORAGE_KEY_FILE");
}

class ObjectStorageService {
  constructor() {
    this.bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME;
    
    if (!this.bucketName) {
      throw new Error("GOOGLE_CLOUD_BUCKET_NAME environment variable is required");
    }
    
    if (!storage) {
      throw new Error("Google Cloud Storage client not initialized");
    }
    
    this.bucket = storage.bucket(this.bucketName);
  }

  // Gets the public object search paths
  getPublicObjectSearchPaths() {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
    const paths = Array.from(
      new Set(
        pathsStr
          .split(",")
          .map((path) => path.trim())
          .filter((path) => path.length > 0)
      )
    );
    if (paths.length === 0) {
      console.warn("PUBLIC_OBJECT_SEARCH_PATHS not set. Using default 'public' directory.");
      return ["public"];
    }
    return paths;
  }

  // Gets the private object directory
  getPrivateObjectDir() {
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!dir) {
      console.warn("PRIVATE_OBJECT_DIR not configured, using default 'private' directory");
      return "private";
    }
    return dir;
  }

  // Search for a public object from the search paths
  async searchPublicObject(filePath) {
    for (const searchPath of this.getPublicObjectSearchPaths()) {
      const fullPath = `${searchPath}/${filePath}`;
      
      try {
        const file = this.bucket.file(fullPath);
        const [exists] = await file.exists();
        if (exists) {
          return file;
        }
      } catch (error) {
        console.warn(`Error checking object at ${fullPath}:`, error.message);
        continue;
      }
    }
    return null;
  }

  // Downloads an object to the response
  async downloadObject(file, res, cacheTtlSec = 3600) {
    try {
      // Get file metadata
      const [metadata] = await file.getMetadata();
      
      // Set appropriate headers
      res.set({
        "Content-Type": metadata.contentType || "application/octet-stream",
        "Content-Length": metadata.size,
        "Cache-Control": `public, max-age=${cacheTtlSec}`,
      });

      // Stream the file to the response
      const stream = file.createReadStream();

      stream.on("error", (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error streaming file" });
        }
      });

      stream.pipe(res);
    } catch (error) {
      console.error("Error downloading file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    }
  }

  // Gets the upload URL for an object entity
  async getObjectEntityUploadURL() {
    try {
      const privateObjectDir = this.getPrivateObjectDir();
      const objectId = randomUUID();
      const fileName = `${privateObjectDir}/uploads/${objectId}`;

      // Generate signed URL for upload
      const [signedUrl] = await this.bucket
        .file(fileName)
        .getSignedUrl({
          version: 'v4',
          action: 'write',
          expires: Date.now() + 15 * 60 * 1000, // 15 minutes
          contentType: 'application/octet-stream',
        });

      console.log("Generated object entity upload URL successfully");
      return signedUrl;
    } catch (error) {
      console.error("Error generating object entity upload URL:", error);
      throw new Error(`Failed to generate upload URL: ${error.message}`);
    }
  }

  // Gets the upload URL specifically for resumes
  async getResumeUploadURL(userId) {
    try {
      const objectId = randomUUID();
      const fileName = `resumes/${userId}/${objectId}.pdf`;

      console.log("Generating resume upload URL for:", fileName);

      // Generate signed URL for upload
      const [signedUrl] = await this.bucket
        .file(fileName)
        .getSignedUrl({
          version: 'v4',
          action: 'write',
          expires: Date.now() + 15 * 60 * 1000, // 15 minutes
          contentType: 'application/pdf',
        });

      console.log("Generated resume upload URL successfully");
      return signedUrl;
    } catch (error) {
      console.error("Error generating resume upload URL:", error);
      throw new Error(`Failed to generate resume upload URL: ${error.message}`);
    }
  }

  // Gets the upload URL specifically for profile images
  async getProfileImageUploadURL(userId, fileExtension = 'jpg') {
    try {
      const objectId = randomUUID();
      const fileName = `profiles/${userId}/${objectId}.${fileExtension}`;

      console.log("Generating profile image upload URL for:", fileName);

      // Determine content type based on extension
      const contentTypeMap = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg', 
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp'
      };
      const contentType = contentTypeMap[fileExtension.toLowerCase()] || 'image/jpeg';

      // Generate signed URL for upload with minimal signing requirements
      const [signedUrl] = await this.bucket
        .file(fileName)
        .getSignedUrl({
          version: 'v4',
          action: 'write',
          expires: Date.now() + 15 * 60 * 1000, // 15 minutes
          // Remove contentType to avoid signature mismatch issues
        });

      console.log("Generated profile image upload URL successfully:", signedUrl);
      return { signedUrl, fileName, publicUrl: `https://storage.googleapis.com/${this.bucketName}/${fileName}` };
    } catch (error) {
      console.error("Error generating profile image upload URL:", error);
      throw new Error(`Failed to generate profile image upload URL: ${error.message}`);
    }
  }

  // Gets the upload URL specifically for cover images
  async getCoverImageUploadURL(userId, fileExtension = 'jpg') {
    try {
      const objectId = randomUUID();
      const fileName = `covers/${userId}/${objectId}.${fileExtension}`;

      console.log("Generating cover image upload URL for:", fileName);

      // Determine content type based on extension
      const contentTypeMap = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png', 
        'gif': 'image/gif',
        'webp': 'image/webp'
      };
      const contentType = contentTypeMap[fileExtension.toLowerCase()] || 'image/jpeg';

      // Generate signed URL for upload with minimal signing requirements
      const [signedUrl] = await this.bucket
        .file(fileName)
        .getSignedUrl({
          version: 'v4',
          action: 'write',
          expires: Date.now() + 15 * 60 * 1000, // 15 minutes
          // Remove contentType to avoid signature mismatch issues
        });

      console.log("Generated cover image upload URL successfully:", signedUrl);
      return { signedUrl, fileName, publicUrl: `https://storage.googleapis.com/${this.bucketName}/${fileName}` };
    } catch (error) {
      console.error("Error generating cover image upload URL:", error);
      throw new Error(`Failed to generate cover image upload URL: ${error.message}`);
    }
  }

  // Validates file type for uploads
  validateFileType(fileName, allowedTypes) {
    const allowedTypesArray = allowedTypes.split(',').map(type => type.trim());
    const fileExtension = fileName.split('.').pop().toLowerCase();
    
    const extensionMap = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp'
    };

    const mimeType = extensionMap[fileExtension];
    return mimeType && allowedTypesArray.includes(mimeType);
  }

  // Gets the object entity file from the object path
  async getObjectEntityFile(objectPath) {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }

    const parts = objectPath.slice(1).split("/");
    if (parts.length < 2) {
      throw new ObjectNotFoundError();
    }

    const entityId = parts.slice(1).join("/");
    let entityDir = this.getPrivateObjectDir();
    if (!entityDir.endsWith("/")) {
      entityDir = `${entityDir}/`;
    }
    
    const objectEntityPath = `${entityDir}${entityId}`;
    const objectFile = this.bucket.file(objectEntityPath);
    
    const [exists] = await objectFile.exists();
    if (!exists) {
      throw new ObjectNotFoundError();
    }
    
    return objectFile;
  }

  // Normalize object entity path for Google Cloud Storage URLs
  normalizeObjectEntityPath(rawPath) {
    if (!rawPath.includes('storage.googleapis.com')) {
      return rawPath;
    }

    try {
      // Extract the path from the URL by removing query parameters and domain
      const url = new URL(rawPath);
      let rawObjectPath = url.pathname;
      
      // Remove bucket name from path if present
      if (rawObjectPath.startsWith(`/${this.bucketName}/`)) {
        rawObjectPath = rawObjectPath.substring(`/${this.bucketName}`.length);
      }
      
      let objectEntityDir = this.getPrivateObjectDir();
      if (!objectEntityDir.endsWith("/")) {
        objectEntityDir = `${objectEntityDir}/`;
      }

      // The rawObjectPath should contain the full path within the bucket
      const objectEntityDirIndex = rawObjectPath.indexOf(objectEntityDir);
      if (objectEntityDirIndex === -1) {
        return rawObjectPath;
      }

      // Extract the entity ID from the path
      const entityId = rawObjectPath.slice(objectEntityDirIndex + objectEntityDir.length);
      return `/objects/${entityId}`;
    } catch (error) {
      console.warn("Error normalizing object path:", error);
      return rawPath;
    }
  }

  // Get public URL for a file
  async getPublicUrl(filePath) {
    try {
      const file = this.bucket.file(filePath);
      
      // Make the file publicly readable
      await file.makePublic();
      
      // Return the public URL
      return `https://storage.googleapis.com/${this.bucketName}/${filePath}`;
    } catch (error) {
      console.error("Error getting public URL:", error);
      throw new Error(`Failed to get public URL: ${error.message}`);
    }
  }

  // Upload file directly (for server-side uploads)
  async uploadFile(buffer, fileName, contentType) {
    try {
      const file = this.bucket.file(fileName);
      
      const stream = file.createWriteStream({
        metadata: {
          contentType: contentType,
        },
        resumable: false,
      });

      return new Promise((resolve, reject) => {
        stream.on('error', (err) => {
          console.error('Upload error:', err);
          reject(err);
        });

        stream.on('finish', () => {
          console.log(`File ${fileName} uploaded successfully`);
          resolve(`https://storage.googleapis.com/${this.bucketName}/${fileName}`);
        });

        stream.end(buffer);
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  // Delete a file
  async deleteFile(fileName) {
    try {
      const file = this.bucket.file(fileName);
      const [exists] = await file.exists();
      
      if (exists) {
        await file.delete();
        console.log(`✅ File ${fileName} deleted successfully`);
      } else {
        console.log(`ℹ️  File ${fileName} does not exist, skipping deletion`);
      }
    } catch (error) {
      console.error("❌ Error deleting file:", error);
      // Don't throw error for deletion failures to prevent blocking new uploads
      console.warn(`⚠️  Failed to delete ${fileName}, but continuing with upload`);
    }
  }

  // Helper method to extract file path from various URL formats
  extractFilePathFromUrl(url) {
    if (!url) return null;
    
    try {
      // Handle full Google Cloud Storage URLs
      if (url.includes('storage.googleapis.com')) {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');
        // Remove empty first element and bucket name
        const bucketIndex = pathParts.findIndex(part => part === this.bucketName);
        if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
          return pathParts.slice(bucketIndex + 1).join('/');
        }
      }
      
      // Handle normalized paths (starting with /)
      if (url.startsWith('/')) {
        return url.substring(1); // Remove leading slash
      }
      
      // Handle direct file paths
      return url;
    } catch (error) {
      console.error('Error extracting file path from URL:', error);
      return null;
    }
  }
}

module.exports = {
  ObjectStorageService,
  ObjectNotFoundError,
  storage
};
