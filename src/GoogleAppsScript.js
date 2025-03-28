// /**
//  * Google Apps Script for GhibliSnap
//  * This script handles image uploads and data storage for GhibliSnap service
//  */

// // Configuration - These are the correct IDs
// var SPREADSHEET_ID = "1CLxVXwiGWu5Vg0p6ITwypKY98R6pW-cXoXPT5zcdkos";
// var PARENT_FOLDER_ID = "1p2khbgRt-JxH5lOvkqtUHXWRpCguQWCt";

// // Add CORS headers
// function setCorsHeaders(output) {
//   var headers = {};
//   headers["Access-Control-Allow-Origin"] = "*";
//   headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS";
//   headers["Access-Control-Allow-Headers"] = "Content-Type";
//   return output.setHeaders(headers);
// }

// // Handle POST requests
// // function doPost(e) {
// //   try {
// //     Logger.log("Received request");
// //     Logger.log("Content type: " + (e.postData ? e.postData.type : "none"));
// //     Logger.log("Parameters: " + JSON.stringify(e.parameter));
// //     Logger.log("Post data: " + JSON.stringify(e.postData));

// //     // Parse form data
// //     var data = {};

// //     if (e.postData && e.postData.type === "multipart/form-data") {
// //       data = parseMultipartFormData(e.postData.contents);
// //       Logger.log("Parsed multipart data: " + JSON.stringify(data));
// //     } else {
// //       throw new Error("Expected multipart/form-data");
// //     }

// //     // Verify file data
// //     if (!data.file || !data.file.blob) {
// //       throw new Error("No file received in request");
// //     }
// //     console.log("File data:", data.file.blob);

// //     // Save image and get link
// //     var imageLink = saveImageToDrive(data);
// //     Logger.log("Image saved at: " + imageLink);

// //     // Log to spreadsheet
// //     logToSpreadsheet(data, imageLink);
// //     Logger.log("Data logged to spreadsheet");

// //     // Return success response with CORS headers
// //     return setCorsHeaders(
// //       ContentService.createTextOutput(
// //         JSON.stringify({
// //           success: true,
// //           message: "Upload successful",
// //           imageLink: imageLink,
// //         })
// //       ).setMimeType(ContentService.MimeType.JSON)
// //     );
// //   } catch (error) {
// //     Logger.log("Error: " + error.toString());
// //     return setCorsHeaders(
// //       ContentService.createTextOutput(
// //         JSON.stringify({
// //           success: false,
// //           error: error.toString(),
// //         })
// //       ).setMimeType(ContentService.MimeType.JSON)
// //     );
// //   }
// // }
// function doPost(e) {
//   console.log("Received POST request");
//   try {
//     // Log the raw request data
//     console.log("Raw request parameters:", e.parameter);

//     // Parse the data from form-encoded parameter
//     const data = JSON.parse(e.parameter.data);
//     console.log(
//       "Parsed data:",
//       JSON.stringify({
//         userName: data.userName,
//         userEmail: data.userEmail,
//         imageCount: data.images.length,
//       })
//     );

//     // Validate required fields
//     if (
//       !data.userName ||
//       !data.userEmail ||
//       !data.images ||
//       !data.images.length
//     ) {
//       console.error("Missing required data");
//       return ContentService.createTextOutput("Error: Missing required data");
//     }

//     // // Set up the spreadsheet
//     console.log("Setting up spreadsheet...");
//     const sheet = setupSpreadsheet();
//     if (!sheet) {
//       console.error("Failed to setup spreadsheet");
//       throw new Error("Failed to setup spreadsheet");
//     }
//     console.log("Spreadsheet setup complete");

//     // Create a folder for this user
//     console.log("Creating user folder...");
//     const folder = createUserFolder(data.userName, data.userEmail);
//     const folderUrl = folder.getUrl();
//     console.log("Created folder:", folderUrl);

//     // Save each image to the folder
//     console.log("Saving images...");
//     const imageUrls = [];
//     data.images.forEach((imageData, index) => {
//       try {
//         const imageUrl = saveImageToFolder(folder, imageData, index);
//         imageUrls.push(imageUrl);
//         console.log(`Saved image ${index + 1}`);
//       } catch (imageError) {
//         console.error(`Error saving image ${index + 1}:`, imageError);
//         throw imageError;
//       }
//     });

//     // Record the user data in the spreadsheet
//     console.log("Recording user data...");
//     recordUserData(sheet, data, folderUrl, data.images.length);
//     console.log("User data recorded");

//     return ContentService.createTextOutput("Success");
//   } catch (error) {
//     console.error("Error processing request:", error.toString());
//     console.error("Stack trace:", error.stack);
//     return ContentService.createTextOutput("Error: " + error.toString());
//   }
// }
// // Parse multipart form data
// function parseMultipartFormData(contents) {
//   var data = {};

//   try {
//     // Extract boundary
//     var boundary = "--" + contents.split("--")[1].split("\r\n")[0];
//     var parts = contents.split(boundary);

//     for (var i = 1; i < parts.length - 1; i++) {
//       var part = parts[i];

//       if (part.indexOf("Content-Disposition: form-data;") !== -1) {
//         var nameMatch = part.match(/name="([^"]+)"/);
//         if (nameMatch) {
//           var name = nameMatch[1];
//           var fileMatch = part.match(/filename="([^"]+)"/);

//           if (fileMatch) {
//             // Handle file
//             var filename = fileMatch[1];
//             var contentTypeMatch = part.match(/Content-Type: (.+)/);
//             var contentType = contentTypeMatch
//               ? contentTypeMatch[1].trim()
//               : "application/octet-stream";

//             var headerEndIndex = part.indexOf("\r\n\r\n");
//             if (headerEndIndex !== -1) {
//               var fileContent = part.substring(headerEndIndex + 4);
//               if (fileContent.endsWith("\r\n")) {
//                 fileContent = fileContent.substring(0, fileContent.length - 2);
//               }

//               // Create blob with proper encoding
//               var fileBlob = Utilities.newBlob(
//                 Utilities.base64Decode(fileContent),
//                 contentType,
//                 filename
//               ).setContentTypeFromExtension();

//               data[name] = {
//                 name: filename,
//                 type: contentType,
//                 blob: fileBlob,
//               };

//               Logger.log("File processed: " + filename);
//             }
//           } else {
//             // Handle regular form field
//             var valueStartIndex = part.indexOf("\r\n\r\n");
//             if (valueStartIndex !== -1) {
//               var value = part.substring(valueStartIndex + 4).trim();
//               if (value.endsWith("\r\n")) {
//                 value = value.substring(0, value.length - 2);
//               }
//               data[name] = value;
//             }
//           }
//         }
//       }
//     }
//     return data;
//   } catch (error) {
//     Logger.log("Error parsing form data: " + error.toString());
//     throw error;
//   }
// }

// // Parse URL encoded form data
// function parseUrlEncodedFormData(contents) {
//   var data = {};
//   var pairs = contents.split("&");

//   for (var i = 0; i < pairs.length; i++) {
//     var pair = pairs[i].split("=");
//     var key = decodeURIComponent(pair[0]);
//     var value = decodeURIComponent(pair[1] || "");
//     data[key] = value;
//   }

//   return data;
// }

// // Save image to Drive and return the public link
// function saveImageToDrive(data) {
//   console.log("Saving image to Drive", data.file.blob);
//   if (!data.file || !data.file.blob) {
//     Logger.log("No valid file data found");
//     return "No file uploaded";
//   }

//   try {
//     // Get the parent folder
//     var parentFolder = DriveApp.getFolderById(PARENT_FOLDER_ID);
//     if (!parentFolder) {
//       Logger.log("Parent folder not found with ID: " + PARENT_FOLDER_ID);
//       return "Error: Parent folder not found";
//     }

//     // Create a sanitized user folder name
//     var userFolderName = [
//       (data.name || "Unknown").replace(/[^a-zA-Z0-9]/g, "_"),
//       (data.email || "unknown").replace(/[^a-zA-Z0-9@.]/g, "_"),
//       new Date().toISOString().split("T")[0],
//     ].join("_");

//     // Get or create user folder
//     var userFolder;
//     var userFolders = parentFolder.getFoldersByName(userFolderName);

//     if (userFolders.hasNext()) {
//       userFolder = userFolders.next();
//     } else {
//       userFolder = parentFolder.createFolder(userFolderName);
//     }

//     // Create unique filename with timestamp
//     var timestamp = new Date().getTime();
//     var fileName = timestamp + "_" + data.file.name;

//     // Create the file in Drive
//     var file = userFolder.createFile(data.file.blob.setName(fileName));

//     // Make the file publicly accessible with a link
//     file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

//     // Get the direct link to the file
//     var fileId = file.getId();
//     var fileLink = "https://drive.google.com/uc?id=" + fileId;

//     Logger.log("File saved successfully. Link: " + fileLink);
//     return fileLink;
//   } catch (error) {
//     Logger.log("Error saving to Drive: " + error.toString());
//     throw new Error("Failed to save file: " + error.toString());
//   }
// }

// // Log data to spreadsheet
// function logToSpreadsheet(data, imageLink) {
//   try {
//     var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
//     var sheet = spreadsheet.getSheets()[0]; // First sheet

//     var timestamp = new Date();

//     // Add data to spreadsheet
//     sheet.appendRow([
//       timestamp,
//       data.name || "",
//       data.email || "",
//       data.instagram || "",
//       data.twitter || "",
//       imageLink || "",
//     ]);

//     Logger.log("Data logged to spreadsheet successfully");
//   } catch (error) {
//     Logger.log("Error logging to spreadsheet: " + error.toString());
//     throw new Error("Failed to log to spreadsheet: " + error.toString());
//   }
// }

// // Test function for deployment verification
// function doGet() {
//   return setCorsHeaders(
//     ContentService.createTextOutput(
//       JSON.stringify({
//         status: "active",
//         message: "GhibliSnap API is running",
//       })
//     ).setMimeType(ContentService.MimeType.JSON)
//   );
// }
/**
 * GhibliSnap Google Apps Script
 *
 * This script handles data submission from the GhibliSnap web app:
 * - Creates a folder for each user in Google Drive
 * - Saves user's images to their folder
 * - Records user info and folder link in Google Sheets
 *
 * Setup Instructions:
 * 1. Create a new Google Apps Script project at https://script.google.com/
 * 2. Copy this code into the project
 * 3. Fill in your SPREADSHEET_ID and PARENT_FOLDER_ID values
 * 4. Deploy as a Web App (Publish > Deploy as web app)
 *    - Execute as: your Google account
 *    - Who has access: Anyone (for public access) or specific accounts if private
 * 5. Copy the web app URL and paste it into src/utils/googleIntegration.ts
 */

// Configure these values to match your Google resources
// const SPREADSHEET_ID = "1BD7U6NVIc3VIjuYEo_TWoOfJCaJxNxfva8EbMwgGH1U";
// const PARENT_FOLDER_ID = "1IoPapaqw89NgO6TUqOXiU7FX5C6KTH8Y";
var SPREADSHEET_ID = "1CLxVXwiGWu5Vg0p6ITwypKY98R6pW-cXoXPT5zcdkos";
var PARENT_FOLDER_ID = "1p2khbgRt-JxH5lOvkqtUHXWRpCguQWCt";
const SHEET_NAME = "Sheet1";
// Creates necessary sheet with headers if it doesn't exist
function setupSpreadsheet() {
  try {
    console.log("Opening spreadsheet with ID:", SPREADSHEET_ID);
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      console.log("Sheet not found, creating new sheet...");
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      sheet.appendRow([
        "Timestamp",
        "Name",
        "Email",
        "Twitter",
        "Share on Twitter",
        "Number of Images",
        "Folder Link",
      ]);
      sheet.getRange(1, 1, 1, 7).setFontWeight("bold");
      console.log("New sheet created and formatted");
    }

    return sheet;
  } catch (error) {
    console.error("Error in setupSpreadsheet:", error);
    throw error;
  }
}

// Create a folder for the user in Google Drive
function createUserFolder(userName, userEmail) {
  try {
    console.log("Accessing parent folder:", PARENT_FOLDER_ID);
    const parentFolder = DriveApp.getFolderById(PARENT_FOLDER_ID);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const folderName = `${userName}_${timestamp}`;

    console.log("Creating new folder:", folderName);
    const folder = parentFolder.createFolder(folderName);
    return folder;
  } catch (error) {
    console.error("Error in createUserFolder:", error);
    throw error;
  }
}

// Save an image to the user's folder
function saveImageToFolder(folder, imageData, index) {
  try {
    console.log(`Processing image ${index + 1}`);
    const base64Data = imageData.split(",")[1];
    const blob = Utilities.newBlob(
      Utilities.base64Decode(base64Data),
      "image/png",
      `image_${index}.png`
    );

    console.log(`Saving image ${index + 1} to Drive`);
    const file = folder.createFile(blob);
    return file.getUrl();
  } catch (error) {
    console.error(`Error in saveImageToFolder for image ${index}:`, error);
    throw error;
  }
}

// Add user data to the spreadsheet
function recordUserData(sheet, userData, folderUrl, numImages) {
  try {
    console.log("Recording user data in spreadsheet");
    sheet.appendRow([
      new Date().toISOString(),
      userData.userName,
      userData.userEmail,
      userData.userTwitter || "N/A",
      userData.shareOnTwitter ? "Yes" : "No",
      numImages,
      folderUrl,
    ]);
    console.log("User data recorded successfully");
  } catch (error) {
    console.error("Error in recordUserData:", error);
    throw error;
  }
}

// Main function that handles the POST request from the web app
function doPost(e) {
  console.log("Received POST request");
  try {
    // Log the raw request data
    console.log("Raw request parameters:", e.parameter);

    // Parse the data from form-encoded parameter
    const data = JSON.parse(e.parameter.data);
    console.log(
      "Parsed data:",
      JSON.stringify({
        userName: data.userName,
        userEmail: data.userEmail,
        imageCount: data.images.length,
      })
    );

    // Validate required fields
    if (
      !data.userName ||
      !data.userEmail ||
      !data.images ||
      !data.images.length
    ) {
      console.error("Missing required data");
      return ContentService.createTextOutput("Error: Missing required data");
    }

    // Set up the spreadsheet
    console.log("Setting up spreadsheet...");
    const sheet = setupSpreadsheet();
    if (!sheet) {
      console.error("Failed to setup spreadsheet");
      throw new Error("Failed to setup spreadsheet");
    }
    console.log("Spreadsheet setup complete");

    // Create a folder for this user
    console.log("Creating user folder...");
    const folder = createUserFolder(data.userName, data.userEmail);
    const folderUrl = folder.getUrl();
    console.log("Created folder:", folderUrl);

    // Save each image to the folder
    console.log("Saving images...");
    const imageUrls = [];
    data.images.forEach((imageData, index) => {
      try {
        const imageUrl = saveImageToFolder(folder, imageData, index);
        imageUrls.push(imageUrl);
        console.log(`Saved image ${index + 1}`);
      } catch (imageError) {
        console.error(`Error saving image ${index + 1}:`, imageError);
        throw imageError;
      }
    });

    // Record the user data in the spreadsheet
    console.log("Recording user data...");
    recordUserData(sheet, data, folderUrl, data.images.length);
    console.log("User data recorded");

    return ContentService.createTextOutput("Success");
  } catch (error) {
    console.error("Error processing request:", error.toString());
    console.error("Stack trace:", error.stack);
    return ContentService.createTextOutput("Error: " + error.toString());
  }
}

// Test function that you can run manually to verify the setup
function testSetup() {
  const sheet = setupSpreadsheet();
  const testFolder = DriveApp.getFolderById(PARENT_FOLDER_ID);

  // Log success if everything is set up correctly
  Logger.log("Spreadsheet ready: " + (sheet !== null));
  Logger.log("Parent folder accessible: " + (testFolder !== null));

  return "Setup test complete. Check the logs for results.";
}

// CORS handling for web requests
function doOptions(e) {
  return ContentService.createTextOutput()
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}
