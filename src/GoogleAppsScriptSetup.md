
# Setting Up Google Apps Script Integration for GhibliSnap

This guide will walk you through setting up the necessary Google services to handle file uploads and data storage for your GhibliSnap application.

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
   - Your spreadsheet is already created at: https://docs.google.com/spreadsheets/d/1CLxVXwiGWu5Vg0p6ITwypKY98R6pW-cXoXPT5zcdkos/edit
2. Add the following column headers in the first row:
   - Timestamp
   - Name
   - Email
   - Instagram
   - Twitter
   - Image Link

## Step 2: Create a Google Drive Folder

1. Go to [Google Drive](https://drive.google.com) and create a new folder named "GhibliSnap Images"
   - Your folder is already created at: https://drive.google.com/drive/folders/1B6meR_k44BffhPG-M0zTnSc8ZU0E9r0-

## Step 3: Deploy the Google Apps Script

1. Go to [Google Apps Script](https://script.google.com) and create a new project
2. Delete any existing code in the editor
3. Copy the entire content from `src/GoogleAppsScript.js` file and paste it into the editor
4. The script already has the correct IDs:
   - Spreadsheet ID: `1CLxVXwiGWu5Vg0p6ITwypKY98R6pW-cXoXPT5zcdkos`
   - Folder ID: `1B6meR_k44BffhPG-M0zTnSc8ZU0E9r0-`
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

1. Once you've deployed the script, copy the Web App URL
2. Open `src/components/UploadSection.tsx` in your project
3. Find this line:
   ```javascript
   const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyLPJETcwSCbxRd8oGgPZhNR6CNGqWXcfFjXrUbdyiAhiZhx__-ck5wUYqEr9JvI98i/exec';
   ```
4. Replace the URL with your actual deployment URL

## Important Permissions

For the Google Apps Script to work properly:
1. Make sure the Google Sheet is accessible to the account running the script
2. Make sure the Google Drive folder is accessible to the account running the script
3. When you authorize the script, accept all the permission requests:
   - Permission to access and modify your Google Sheets
   - Permission to access and modify your Google Drive files
   - Permission to connect to an external service (for receiving the form data)

## Troubleshooting Common Issues

1. **Data not appearing in Google Sheet**: 
   - Check the script execution logs in Google Apps Script (View > Logs)
   - Make sure your spreadsheet ID is correct
   - Verify you have granted the script permission to access your Google Sheets

2. **Files not appearing in Google Drive**:
   - Check the script execution logs in Google Apps Script (View > Logs)
   - Make sure your folder ID is correct
   - Verify you have granted the script permission to access your Google Drive

3. **CORS Errors**:
   - The `mode: 'no-cors'` setting in the fetch request handles CORS issues
   - This setup relies on the assumption that the request reached the server even without a response you can read
   - Check Google Apps Script logs to confirm if requests are actually being received

4. **Debugging Tips**:
   - In Google Apps Script editor, click on "Run" > "Debug function" > "doPost" to test the script
   - Check the Execution logs for any errors or issues
   - Use `Logger.log()` statements in the script to track execution flow
