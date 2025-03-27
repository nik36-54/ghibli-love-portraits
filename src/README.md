
# GhibliSnap

A vibrant e-commerce website that creates Ghibli-style portraits from user photos.

## Features

- Modern, responsive design with beautiful gradient colors
- Image upload functionality with validation
- User information collection form (name, email, Instagram, Twitter)
- Google Apps Script integration for storing data in Google Sheets and Google Drive
- Animated UI elements for a delightful user experience

## Setup Instructions

### Frontend Setup

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm run dev`

### Google Integrations Setup

1. **Google Sheets Setup**:
   - Create a new Google Sheet
   - Add columns: Timestamp, Name, Email, Instagram, Twitter, Image Link
   - Copy the Sheet ID from the URL (the long string in the URL)

2. **Google Drive Setup**:
   - Create a parent folder in Google Drive to store user images
   - Copy the Folder ID from the URL (the long string in the URL)

3. **Google Apps Script Setup**:
   - Go to [Google Apps Script](https://script.google.com/)
   - Create a new project
   - Copy the content from `src/GoogleAppsScript.js` into the script editor
   - Replace `YOUR_SPREADSHEET_ID` with your actual spreadsheet ID
   - Replace `YOUR_FOLDER_ID` with your actual folder ID
   - Save the script
   - Deploy as a web app:
     - Click Deploy > New Deployment
     - Select "Web app" as the deployment type
     - Set "Execute as" to "Me"
     - Set "Who has access" to "Anyone, even anonymous"
     - Click "Deploy"
     - Copy the Web App URL

4. **Update Frontend Code**:
   - Open `src/components/UploadSection.tsx`
   - Replace `'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec'` with your actual Web App URL

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- ShadcnUI
- Google Apps Script
- Google Sheets API
- Google Drive API

## Important Notes

- The Google Apps Script deployment must have the necessary permissions to:
  - Access and modify Google Sheets
  - Access and modify Google Drive
- CORS issues might occur when testing locally. When deployed, the frontend should properly interact with the Google Apps Script Web App.
- Make sure to handle user data in compliance with privacy regulations.
