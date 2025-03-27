
/**
 * Google Apps Script for GhibliSnap
 * This script handles image uploads and data storage for GhibliSnap service
 */

// Configuration - Replace these with your actual IDs
var SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
var PARENT_FOLDER_ID = 'YOUR_FOLDER_ID'; 

// Handle POST requests
function doPost(e) {
  try {
    // Get form data
    var data = parseFormData(e);
    
    // Create a user folder and save image
    var imageLink = saveImageToDrive(data);
    
    // Log data to spreadsheet
    logToSpreadsheet(data, imageLink);
    
    // Return success response
    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: true, 
        message: "Your photo has been received! We're creating your Ghibli portrait with love." 
      })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error("Error processing request: " + error);
    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: false, 
        error: error.toString() 
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Parse multipart form data
function parseFormData(e) {
  var data = {};
  
  // Handle multipart form data
  if (e.postData && e.postData.type === 'multipart/form-data') {
    var boundary = e.postData.contents.match(/boundary=(.+)/)[1];
    var parts = e.postData.contents.split(boundary);
    
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i];
      var match = part.match(/name="([^"]+)"/);
      
      if (match) {
        var name = match[1];
        var fileMatch = part.match(/filename="([^"]+)"/);
        
        if (fileMatch) {
          // This is a file
          var filename = fileMatch[1];
          var contentType = part.match(/Content-Type: (.+)/)[1].trim();
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
  } else if (e.postData) {
    // Handle JSON data
    data = JSON.parse(e.postData.contents);
  }
  
  return data;
}

// Save image to Drive and return the public link
function saveImageToDrive(data) {
  // Get the parent folder
  var parentFolder = DriveApp.getFolderById(PARENT_FOLDER_ID);
  
  // Create a user folder with their name and email
  var userFolderName = data.name.replace(/[^a-zA-Z0-9]/g, '_') + '_' + data.email.replace(/[^a-zA-Z0-9]/g, '_');
  var userFolders = parentFolder.getFoldersByName(userFolderName);
  var userFolder;
  
  if (userFolders.hasNext()) {
    userFolder = userFolders.next();
  } else {
    userFolder = parentFolder.createFolder(userFolderName);
  }
  
  // Add timestamp to filename for uniqueness
  var timestamp = new Date().getTime();
  var fileName = timestamp + '_' + data.file.name;
  
  // Create the file in Drive
  var file = userFolder.createFile(Utilities.newBlob(data.file.data, data.file.type, fileName));
  
  // Get link to the file
  var fileId = file.getId();
  var fileLink = "https://drive.google.com/file/d/" + fileId + "/view?usp=sharing";
  
  return fileLink;
}

// Log data to spreadsheet
function logToSpreadsheet(data, imageLink) {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = spreadsheet.getSheets()[0]; // First sheet
  
  var timestamp = new Date();
  
  // Add data to spreadsheet
  sheet.appendRow([
    timestamp,
    data.name,
    data.email,
    data.instagram || "",
    data.twitter || "",
    imageLink
  ]);
}

// Test function for deployment verification
function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ 
      status: "GhibliSnap API is running",
      message: "Send a POST request with form data to use this API"
    })
  ).setMimeType(ContentService.MimeType.JSON);
}
