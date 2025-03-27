
# Setting Up Google Apps Script Integration for GhibliSnap

This guide will walk you through setting up the necessary Google services to handle file uploads and data storage for your GhibliSnap application.

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Add the following column headers in the first row:
   - Timestamp
   - Name
   - Email
   - Instagram
   - Twitter
   - Image Link
3. Copy the spreadsheet ID from the URL (the long string in the URL between `/d/` and `/edit`)

## Step 2: Create a Google Drive Folder

1. Go to [Google Drive](https://drive.google.com) and create a new folder named "GhibliSnap Images"
2. Open the folder and copy the folder ID from the URL (the long string at the end of the URL)

## Step 3: Deploy the Google Apps Script

1. Go to [Google Apps Script](https://script.google.com) and create a new project
2. Delete any existing code in the editor
3. Copy the entire content from `src/GoogleAppsScript.js` file and paste it into the editor
4. Replace the placeholders in the script:
   - Replace `YOUR_SPREADSHEET_ID` with the spreadsheet ID you copied in Step 1
   - Replace `YOUR_FOLDER_ID` with the folder ID you copied in Step 2
5. Save the project (File > Save)
6. Deploy the script as a web app:
   - Click Deploy > New deployment
   - Select "Web app" as the deployment type
   - Set "Execute as" to "Me (your email)"
   - Set "Who has access" to "Anyone, even anonymous"
   - Click "Deploy"
   - Authorize the application when prompted
   - Copy the Web App URL provided after deployment

## Step 4: Update Your Frontend Code

1. Open `src/components/UploadSection.tsx` in your project
2. Find this line:
   ```javascript
   const response = await fetch('https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec', {
   ```
3. Replace `YOUR_DEPLOYMENT_ID` with the Web App URL you received when deploying the Google Apps Script

## Testing Your Integration

1. Run your GhibliSnap application
2. Upload an image and submit the form
3. Check your Google Sheet to verify the data is being recorded
4. Check your Google Drive folder to verify the images are being uploaded

## Common Issues and Solutions

- **CORS Errors**: These are normal when testing locally. The `no-cors` mode in the fetch request handles this.
- **Permission Errors**: Make sure you've authorized the Apps Script to access your Google Drive and Sheets.
- **Form Data Issues**: If form data isn't being processed correctly, check the multipart form data handling in the Google Apps Script.
