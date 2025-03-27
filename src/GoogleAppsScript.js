
/**
 * Google Apps Script for GhibliSnap
 * This script handles image uploads and data storage for GhibliSnap service
 */

// Configuration - Replace these with your actual IDs
var SPREADSHEET_ID = '1CLxVXwiGWu5Vg0p6ITwypKY98R6pW-cXoXPT5zcdkos';
var PARENT_FOLDER_ID = '1B6meR_k44BffhPG-M0zTnSc8ZU0E9r0-'; 

// Handle POST requests
function doPost(e) {
  try {
    // Create a log of the request
    Logger.log("Received request: " + JSON.stringify(e.postData));
    
    // Parse form data
    var data = parseFormData(e);
    
    // Log the parsed data
    Logger.log("Parsed data: " + JSON.stringify(data));
    
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
    Logger.log("Error processing request: " + error.toString());
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
    var boundary = e.postData.contents.split('\r\n')[0];
    var parts = e.postData.contents.split(boundary);
    
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i];
      if (part.indexOf('Content-Disposition: form-data;') !== -1) {
        
        var nameMatch = part.match(/name="([^"]+)"/);
        if (nameMatch) {
          var name = nameMatch[1];
          var fileMatch = part.match(/filename="([^"]+)"/);
          
          if (fileMatch) {
            // This is a file
            var filename = fileMatch[1];
            var contentTypeMatch = part.match(/Content-Type: (.+)/);
            var contentType = contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream';
            
            // Find the position after headers
            var headerEndIndex = part.indexOf('\r\n\r\n');
            if (headerEndIndex !== -1) {
              var fileContent = part.substring(headerEndIndex + 4);
              // Remove the last \r\n if present
              if (fileContent.endsWith('\r\n')) {
                fileContent = fileContent.substring(0, fileContent.length - 2);
              }
              
              // Process the binary data
              data.file = {
                name: filename,
                type: contentType,
                data: Utilities.base64Decode(fileContent, Utilities.Charset.UTF_8)
              };
            }
          } else {
            // This is a regular form field
            var headerEndIndex = part.indexOf('\r\n\r\n');
            if (headerEndIndex !== -1) {
              var value = part.substring(headerEndIndex + 4);
              // Remove the last \r\n if present
              if (value.endsWith('\r\n')) {
                value = value.substring(0, value.length - 2);
              }
              data[name] = value;
            }
          }
        }
      }
    }
  } else if (e.postData) {
    // Handle JSON data
    try {
      data = JSON.parse(e.postData.contents);
    } catch (error) {
      Logger.log("Error parsing JSON: " + error.toString());
      data = {error: "Failed to parse JSON data"};
    }
  }
  
  return data;
}

// Save image to Drive and return the public link
function saveImageToDrive(data) {
  if (!data.file) {
    Logger.log("No file data found");
    return "No file uploaded";
  }
  
  try {
    // Get the parent folder
    var parentFolder = DriveApp.getFolderById(PARENT_FOLDER_ID);
    
    // Create a user folder with their name and email
    var userFolderName = (data.name || 'Unknown').replace(/[^a-zA-Z0-9]/g, '_') + '_' + (data.email || 'unknown').replace(/[^a-zA-Z0-9]/g, '_');
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
    var blob = Utilities.newBlob(data.file.data, data.file.type, fileName);
    var file = userFolder.createFile(blob);
    
    // Get link to the file
    var fileId = file.getId();
    var fileLink = "https://drive.google.com/file/d/" + fileId + "/view?usp=sharing";
    
    return fileLink;
  } catch (error) {
    Logger.log("Error saving to Drive: " + error.toString());
    return "Error saving file: " + error.toString();
  }
}

// Log data to spreadsheet
function logToSpreadsheet(data, imageLink) {
  try {
    var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = spreadsheet.getSheets()[0]; // First sheet
    
    var timestamp = new Date();
    
    // Add data to spreadsheet
    sheet.appendRow([
      timestamp,
      data.name || "",
      data.email || "",
      data.instagram || "",
      data.twitter || "",
      imageLink || ""
    ]);
    
    Logger.log("Data logged to spreadsheet successfully");
  } catch (error) {
    Logger.log("Error logging to spreadsheet: " + error.toString());
  }
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
