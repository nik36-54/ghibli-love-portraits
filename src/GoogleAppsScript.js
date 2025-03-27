
/**
 * Google Apps Script for GhibliSnap
 * This script should be deployed as a Web App in Google Apps Script
 * Instructions:
 * 1. Create a new Google Apps Script project
 * 2. Copy this code into the script editor
 * 3. Create a Google Sheet with columns: Timestamp, Name, Email, Instagram, Twitter, Image Link
 * 4. Create a Google Drive folder to store the images
 * 5. Deploy as a Web App with access to "Anyone, even anonymous"
 * 6. Use the Web App URL in your React application
 */

// Sheet IDs and folder IDs - Replace these with your actual IDs
var SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
var PARENT_FOLDER_ID = 'YOUR_FOLDER_ID'; 

// Handle POST request for the web app
function doPost(e) {
  try {
    // Parse the form data
    var data = parseFormData(e);
    
    // Save image to Drive
    var imageLink = saveFileToDrive(data);
    
    // Log data to spreadsheet
    logDataToSpreadsheet(data, imageLink);
    
    // Return success response
    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: true, 
        message: "Data received successfully" 
      })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Log the error and return error response
    console.error("Error processing request: " + error);
    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: false, 
        error: error.toString() 
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Parse the form data from the request
function parseFormData(e) {
  var data = {};
  
  // Handle multipart form data
  if (e.postData && e.postData.type === 'multipart/form-data') {
    // Get the boundary
    var boundary = e.postData.contents.match(/boundary=(.+)/)[1];
    
    // Split the payload into parts
    var parts = e.postData.contents.split(boundary);
    
    // Process each part
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i];
      
      // Find content-disposition header
      var match = part.match(/name="([^"]+)"/);
      if (match) {
        var name = match[1];
        
        // Check if this is a file part
        var fileMatch = part.match(/filename="([^"]+)"/);
        if (fileMatch) {
          // This is a file part
          var filename = fileMatch[1];
          var contentType = part.match(/Content-Type: (.+)/)[1].trim();
          
          // Get the file data (everything after the double newline)
          var fileData = part.split(/\r\n\r\n/)[1].trim();
          
          data.file = {
            name: filename,
            type: contentType,
            data: Utilities.base64Decode(fileData, Utilities.Charset.UTF_8)
          };
        } else {
          // This is a regular form field
          var value = part.split(/\r\n\r\n/)[1].trim();
          data[name] = value;
        }
      }
    }
  } else {
    // Handle non-multipart form data (though this shouldn't happen with file uploads)
    data = JSON.parse(e.postData.contents);
  }
  
  return data;
}

// Save the file to Google Drive
function saveFileToDrive(data) {
  try {
    // Get the parent folder
    var parentFolder = DriveApp.getFolderById(PARENT_FOLDER_ID);
    
    // Create a user-specific folder (if it doesn't exist)
    var userFolderName = data.name.replace(/[^a-zA-Z0-9]/g, '_') + '_' + data.email.replace(/[^a-zA-Z0-9]/g, '_');
    var userFolders = parentFolder.getFoldersByName(userFolderName);
    var userFolder;
    
    if (userFolders.hasNext()) {
      userFolder = userFolders.next();
    } else {
      userFolder = parentFolder.createFolder(userFolderName);
    }
    
    // Create timestamp for unique filename
    var timestamp = new Date().getTime();
    var fileName = timestamp + '_' + data.file.name;
    
    // Create the file in the user's folder
    var file = userFolder.createFile(Utilities.newBlob(data.file.data, data.file.type, fileName));
    
    // Create a direct link to the file
    var fileId = file.getId();
    var fileLink = "https://drive.google.com/file/d/" + fileId + "/view?usp=sharing";
    
    return fileLink;
    
  } catch (error) {
    console.error("Error saving file to Drive: " + error);
    throw error;
  }
}

// Log the data to a Google Sheet
function logDataToSpreadsheet(data, imageLink) {
  try {
    // Open the spreadsheet
    var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = spreadsheet.getSheets()[0]; // Assuming first sheet
    
    // Create timestamp
    var timestamp = new Date();
    
    // Append data to the sheet
    sheet.appendRow([
      timestamp,
      data.name,
      data.email,
      data.instagram || "",
      data.twitter || "",
      imageLink
    ]);
    
  } catch (error) {
    console.error("Error logging data to spreadsheet: " + error);
    throw error;
  }
}

// Handle GET request - Used for testing the deployment
function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ 
      status: "GhibliSnap API is running",
      instructions: "Send a POST request with form data to use this API"
    })
  ).setMimeType(ContentService.MimeType.JSON);
}
