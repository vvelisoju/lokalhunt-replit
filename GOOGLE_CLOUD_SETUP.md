
# Google Cloud Storage Setup

This guide will help you configure Google Cloud Storage for file uploads in your LokalHunt application.

## Prerequisites

1. A Google Cloud Project
2. Google Cloud Storage API enabled
3. A storage bucket created
4. Service account with appropriate permissions

## Setup Steps

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note the Project ID

### 2. Enable Google Cloud Storage API

1. In the Google Cloud Console, navigate to "APIs & Services" → "Library"
2. Search for "Google Cloud Storage API"
3. Click "Enable"

### 3. Create a Storage Bucket

1. Navigate to "Cloud Storage" → "Buckets"
2. Click "Create Bucket"
3. Choose a globally unique bucket name
4. Select a region close to your users
5. Choose "Standard" storage class
6. For access control, choose "Uniform"
7. Create the bucket

### 4. Create a Service Account

1. Navigate to "IAM & Admin" → "Service Accounts"
2. Click "Create Service Account"
3. Give it a name like "lokalhunt-storage"
4. Assign the following roles:
   - Storage Object Admin
   - Storage Object Creator
   - Storage Object Viewer
5. Create and download the JSON key file

### 5. Configure Environment Variables

Update your `.env` file with the following variables:

```env
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_BUCKET_NAME=your-bucket-name
GOOGLE_CLOUD_STORAGE_KEY_FILE=./path/to/service-account-key.json
```

### 6. Set Up Replit Secrets

Since you're using Replit, you should store the service account key as a secret:

1. In your Replit, open the Secrets tab
2. Create a secret named `GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY`
3. Paste the entire contents of your service account JSON file as the value
4. Update your `.env` to use the secret (this is handled automatically by the code)

### 7. Alternative: Use Application Default Credentials

If you're deploying to Google Cloud Run or App Engine, you can use Application Default Credentials instead of a service account key file. Just remove the `GOOGLE_CLOUD_STORAGE_KEY_FILE` environment variable.

## Security Notes

1. Never commit service account key files to your repository
2. Use Replit Secrets for sensitive credentials
3. Set appropriate bucket permissions
4. Consider using signed URLs with shorter expiration times for sensitive files

## Troubleshooting

1. **Authentication Error**: Verify your service account key is correct and has the right permissions
2. **Bucket Not Found**: Ensure the bucket name in your environment variables matches exactly
3. **Permission Denied**: Check that your service account has the required Storage roles
4. **CORS Issues**: If uploading from the browser, configure CORS on your bucket

## Testing

After setup, test the file upload functionality:

1. Try uploading a resume in the candidate profile
2. Try uploading a profile image
3. Check that files appear in your Google Cloud Storage bucket
4. Verify that files can be downloaded/viewed through your application
