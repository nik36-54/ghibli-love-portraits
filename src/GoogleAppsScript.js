/**
 * Google Apps Script for GhibliSnap
 * This script handles image uploads and data storage for GhibliSnap service
 */

// Configuration - These are the correct IDs
var SPREADSHEET_ID = "1CLxVXwiGWu5Vg0p6ITwypKY98R6pW-cXoXPT5zcdkos";
var PARENT_FOLDER_ID = "1p2khbgRt-JxH5lOvkqtUHXWRpCguQWCt";

// Handle POST requests
function doPost(e) {
  try {
    // Create a log of the request
    Logger.log(
      "Received request with content type: " +
        (e.postData ? e.postData.type : "none")
    );

    // Parse form data
    var data = {};

    // Handle form data from multipart request
    if (e.postData && e.postData.type === "multipart/form-data") {
      data = parseMultipartFormData(e.postData.contents);
    }
    // Handle data from application/x-www-form-urlencoded
    else if (
      e.postData &&
      e.postData.type === "application/x-www-form-urlencoded"
    ) {
      data = parseUrlEncodedFormData(e.postData.contents);
    }
    // Handle data from application/json
    else if (e.postData && e.postData.type.indexOf("application/json") !== -1) {
      data = JSON.parse(e.postData.contents);
    }
    // Handle form parameters (sent via URL parameters or simple form posts)
    else if (e.parameter) {
      data = e.parameter;
    }

    Logger.log("Parsed data: " + JSON.stringify(data));

    // Create a user folder and save image
    var imageLink = "No image uploaded";
    if (data.file) {
      imageLink = saveImageToDrive(data);
      Logger.log("Image saved at: " + imageLink);
    }

    // Log data to spreadsheet
    logToSpreadsheet(data, imageLink);
    Logger.log("Data logged to spreadsheet successfully");

    // Return success response
    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message:
          "Your photo has been received! We're creating your Ghibli portrait with love.",
          imageLink: imageLink,
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log("Error processing request: " + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.toString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Parse multipart form data
function parseMultipartFormData(contents) {
  var data = {};
  
  try {
    // Extract boundary from the first line
    var boundary = "--" + contents.split("--")[1].split("\r\n")[0];
    var parts = contents.split(boundary);
    
    for (var i = 1; i < parts.length - 1; i++) {
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
              
              // Remove the trailing new line and properly handle binary data
              if (fileContent.endsWith('\r\n')) {
                fileContent = fileContent.substring(0, fileContent.length - 2);
              }
              
              // Create blob directly from the raw binary data
              var fileBlob = Utilities.newBlob(Utilities.base64Decode(fileContent), contentType, filename);
              
              data[name] = {
                name: filename,
                type: contentType,
                blob: fileBlob
              };
            }
          } else {
            // This is a regular form field
            var valueStartIndex = part.indexOf('\r\n\r\n');
            if (valueStartIndex !== -1) {
              var value = part.substring(valueStartIndex + 4).trim();
              if (value.endsWith('\r\n')) {
                value = value.substring(0, value.length - 2);
              }
              data[name] = value;
            }
          }
        }
      }
    }
    return data;
  } catch (error) {
    Logger.log("Error parsing multipart form data: " + error.toString());
    throw error;
  }
}

// Parse URL encoded form data
function parseUrlEncodedFormData(contents) {
  var data = {};
  var pairs = contents.split("&");

  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split("=");
    var key = decodeURIComponent(pair[0]);
    var value = decodeURIComponent(pair[1] || "");
    data[key] = value;
  }

  return data;
}

// Save image to Drive and return the public link
function saveImageToDrive(data) {
  if (!data.file || !data.file.blob) {
    Logger.log("No valid file data found");
    return "No file uploaded";
  }
  
  try {
    // Get the parent folder
    var parentFolder = DriveApp.getFolderById(PARENT_FOLDER_ID);
    if (!parentFolder) {
      Logger.log("Parent folder not found with ID: " + PARENT_FOLDER_ID);
      return "Error: Parent folder not found";
    }
    
    // Create a sanitized user folder name
    var userFolderName = [
      (data.name || 'Unknown').replace(/[^a-zA-Z0-9]/g, '_'),
      (data.email || 'unknown').replace(/[^a-zA-Z0-9@.]/g, '_'),
      new Date().toISOString().split('T')[0]
    ].join('_');
    
    // Get or create user folder
    var userFolder;
    var userFolders = parentFolder.getFoldersByName(userFolderName);
    
    if (userFolders.hasNext()) {
      userFolder = userFolders.next();
    } else {
      userFolder = parentFolder.createFolder(userFolderName);
    }
    
    // Create unique filename with timestamp
    var timestamp = new Date().getTime();
    var fileName = timestamp + '_' + data.file.name;
    
    // Create the file in Drive
    var file = userFolder.createFile(data.file.blob.setName(fileName));
    
    // Make the file publicly accessible with a link
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Get the direct link to the file
    var fileId = file.getId();
    var fileLink = "https://drive.google.com/uc?id=" + fileId;
    
    Logger.log("File saved successfully. Link: " + fileLink);
    return fileLink;
    
  } catch (error) {
    Logger.log("Error saving to Drive: " + error.toString());
    throw new Error("Failed to save file: " + error.toString());
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
      imageLink || "",
    ]);

    Logger.log("Data logged to spreadsheet successfully");
  } catch (error) {
    Logger.log("Error logging to spreadsheet: " + error.toString());
    throw new Error("Failed to log to spreadsheet: " + error.toString());
  }
}

// Test function for deployment verification
function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({
      status: "GhibliSnap API is running",
      message: "Send a POST request with form data to use this API",
    })
  ).setMimeType(ContentService.MimeType.JSON);
}
