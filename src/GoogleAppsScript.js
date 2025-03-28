/**
 * Google Apps Script for GhibliSnap
 * This script handles image uploads and data storage for GhibliSnap service
 */

// Configuration - These are the correct IDs
var SPREADSHEET_ID = "1CLxVXwiGWu5Vg0p6ITwypKY98R6pW-cXoXPT5zcdkos";
var PARENT_FOLDER_ID = "1p2khbgRt-JxH5lOvkqtUHXWRpCguQWCt";

// Add CORS headers
function setCorsHeaders(output) {
  var headers = {};
  headers["Access-Control-Allow-Origin"] = "*";
  headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS";
  headers["Access-Control-Allow-Headers"] = "Content-Type";
  return output.setHeaders(headers);
}

// Handle POST requests
function doPost(e) {
  try {
    Logger.log("Received request");
    Logger.log("Content type: " + (e.postData ? e.postData.type : "none"));
    Logger.log("Parameters: " + JSON.stringify(e.parameter));
    Logger.log("Post data: " + JSON.stringify(e.postData));

    // Parse form data
    var data = {};

    if (e.postData && e.postData.type === "multipart/form-data") {
      data = parseMultipartFormData(e.postData.contents);
      Logger.log("Parsed multipart data: " + JSON.stringify(data));
    } else {
      throw new Error("Expected multipart/form-data");
    }

    // Verify file data
    if (!data.file || !data.file.blob) {
      throw new Error("No file received in request");
    }

    // Save image and get link
    var imageLink = saveImageToDrive(data);
    Logger.log("Image saved at: " + imageLink);

    // Log to spreadsheet
    logToSpreadsheet(data, imageLink);
    Logger.log("Data logged to spreadsheet");

    // Return success response with CORS headers
    return setCorsHeaders(ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message: "Upload successful",
        imageLink: imageLink
      })
    ).setMimeType(ContentService.MimeType.JSON));

  } catch (error) {
    Logger.log("Error: " + error.toString());
    return setCorsHeaders(ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.toString()
      })
    ).setMimeType(ContentService.MimeType.JSON));
  }
}

// Parse multipart form data
function parseMultipartFormData(contents) {
  var data = {};
  
  try {
    // Extract boundary
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
            // Handle file
            var filename = fileMatch[1];
            var contentTypeMatch = part.match(/Content-Type: (.+)/);
            var contentType = contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream';
            
            var headerEndIndex = part.indexOf('\r\n\r\n');
            if (headerEndIndex !== -1) {
              var fileContent = part.substring(headerEndIndex + 4);
              if (fileContent.endsWith('\r\n')) {
                fileContent = fileContent.substring(0, fileContent.length - 2);
              }
              
              // Create blob with proper encoding
              var fileBlob = Utilities.newBlob(
                Utilities.base64Decode(fileContent), 
                contentType, 
                filename
              ).setContentTypeFromExtension();
              
              data[name] = {
                name: filename,
                type: contentType,
                blob: fileBlob
              };
              
              Logger.log("File processed: " + filename);
            }
          } else {
            // Handle regular form field
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
    Logger.log("Error parsing form data: " + error.toString());
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
  return setCorsHeaders(ContentService.createTextOutput(
    JSON.stringify({
      status: "active",
      message: "GhibliSnap API is running"
    })
  ).setMimeType(ContentService.MimeType.JSON));
}
