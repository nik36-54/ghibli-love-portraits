
# Google Apps Script Deployment Instructions

This document provides step-by-step instructions for deploying the Google Apps Script that integrates with the GhibliSnap website.

## Prerequisites

1. A Google account
2. Access to Google Drive and Google Sheets
3. The GhibliSnap frontend code

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com/) and create a new spreadsheet
2. Rename the spreadsheet to "GhibliSnap Orders"
3. Add the following column headers in row 1:
   - Timestamp
   - Name
   - Email
   - Instagram
   - Twitter
   - Image Link
4. Format the sheet as you prefer (colors, font styles, etc.)
5. Copy the Spreadsheet ID from the URL:
   - The URL will look like: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - Copy the `SPREADSHEET_ID` portion for later use

## Step 2: Create a Google Drive Folder

1. Go to [Google Drive](https://drive.google.com/)
2. Create a new folder called "GhibliSnap Images"
3. Open the folder and copy the Folder ID from the URL:
   - The URL will look like: `https://drive.google.com/drive/folders/FOLDER_ID`
   - Copy the `FOLDER_ID` portion for later use

## Step 3: Create and Deploy the Google Apps Script

1. Go to [Google Apps Script](https://script.google.com/)
2. Click on "New Project"
3. Rename the project to "GhibliSnap Integration"
4. Delete any code in the editor
5. Copy the entire content from `src/GoogleAppsScript.js` and paste it into the editor
6. Replace the placeholders:
   - Replace `YOUR_SPREADSHEET_ID` with the Spreadsheet ID you copied in Step 1
   - Replace `YOUR_FOLDER_ID` with the Folder ID you copied in Step 2
7. Click on the disk icon to save the project

## Step 4: Deploy the Web App

1. Click on "Deploy" > "New deployment"
2. Click the gear icon next to "Select type" and choose "Web app"
3. Fill in the deployment information:
   - Description: "GhibliSnap Integration v1"
   - Execute as: "Me (your email)"
   - Who has access: "Anyone, even anonymous"
4. Click "Deploy"
5. In the popup, copy the Web App URL (this is what you'll use in your frontend code)
6. Click "OK"

## Step 5: Update Your Frontend Code

1. Open `src/components/UploadSection.tsx` in your project
2. Find the line containing:
   ```typescript
   const response = await fetch('https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec', {
   ```
3. Replace `YOUR_DEPLOYMENT_ID` with your actual Web App URL

## Step 6: Test the Integration

1. Run your frontend application
2. Upload an image and fill in the form
3. Submit the form
4. Check your Google Sheet to see if the data was recorded
5. Check your Google Drive folder to see if the image was uploaded

## Troubleshooting

### CORS Issues
If you encounter CORS issues when testing locally:
- Make sure you set "Who has access" to "Anyone, even anonymous"
- Use the `mode: 'no-cors'` option in your fetch request (which is already included in the code)

### Permission Issues
If the script cannot access your spreadsheet or folder:
- Make sure you're logged into the same Google account that owns the spreadsheet and folder
- Check that you've correctly copied the IDs

### Updates Not Working
If updates to the script don't seem to be applied:
- After making changes to the script, create a new deployment version
- Update the Web App URL in your frontend code to use the new version

## Security Considerations

Remember that this setup is designed for simplicity. In a production environment, you might want to:

1. Add authentication to your Google Apps Script Web App
2. Use OAuth2 for more secure access to Google services
3. Implement rate limiting to prevent abuse
4. Add additional validation and error handling
