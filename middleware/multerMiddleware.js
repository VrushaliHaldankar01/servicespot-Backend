const multer = require('multer');
const path = require('path');
const admin = require('firebase-admin');
require('dotenv').config();
const fs = require('fs');
//const serviceAccount = require('../config/serviceAccountKey.json');

const serviceAccount = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY,
  // private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
};

// fs.writeFileSync(
//   'config/serviceAccountKey.json',
//   JSON.stringify(serviceAccount)
// );

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'servicespot-51527.appspot.com', // Replace with your Firebase Storage bucket URL
});

const bucket = admin.storage().bucket();

// Configure Multer for file upload
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB file size limit
  },
});

// Middleware for handling single file upload
// const uploadSingle = (fieldName) => (req, res, next) => {
//   upload.single(fieldName)(req, res, async (err) => {
//     if (err) {
//       console.error('Error uploading file:', err);
//       return res.status(500).send('Error uploading file');
//     }

//     if (!req.file) {
//       req.file = {};
//       //return res.status(400).send('No file uploaded');
//     }

//     try {
//       const file = req.file;
//       const folderPath = fieldName;

//       // Upload file to Firebase Cloud Storage
//       // const blob = bucket.file(file.originalname);
//       const blob = bucket.file(`${folderPath}/${file.originalname}`);
//       const blobStream = blob.createWriteStream({
//         metadata: {
//           contentType: file.mimetype,
//         },
//       });

//       blobStream.on('error', (err) => {
//         console.error('Error uploading to Firebase:', err);
//         res.status(500).send('Error uploading to Firebase');
//       });

//       blobStream.on('finish', async () => {
//         await blob.makePublic();
//         // Generate public URL for the uploaded file
//         const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

//         // Attach Firebase URL to req.file object if needed
//         req.file.firebaseUrl = publicUrl;

//         next(); // Call next middleware or request handler
//       });

//       blobStream.end(file.buffer); // Write file buffer to Cloud Storage
//     } catch (error) {
//       console.error('Error:', error);
//       res.status(500).send('Server Error');
//     }
//   });
// };
// Middleware for handling single file upload
const uploadSingle = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, async (err) => {
    if (err) {
      console.error('Error uploading file:', err);
      return res.status(500).send('Error uploading file');
    }

    if (!req.file) {
      console.log('No file uploaded.');
      req.file = {};
      return next(); // Proceed without file
    }

    try {
      const file = req.file;
      const folderPath = fieldName;
      const blob = bucket.file(`${folderPath}/${file.originalname}`);
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      blobStream.on('error', (err) => {
        console.error('Error uploading to Firebase:', err);
        res.status(500).send('Error uploading to Firebase');
      });

      blobStream.on('finish', async () => {
        await blob.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        console.log('Generated public URL:', publicUrl);
        req.file.firebaseUrl = publicUrl;
        next(); // Proceed to the next middleware or request handler
      });

      blobStream.end(file.buffer); // Write file buffer to Cloud Storage
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Server Error');
    }
  });
};

// Middleware for handling multiple file uploads (up to 3 files)
const uploadMultiple = (fieldName) => (req, res, next) => {
  upload.array(fieldName, 3)(req, res, async (err) => {
    if (err) {
      console.error('Error uploading files:', err);
      return res.status(500).send('Error uploading files');
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).send('No files uploaded');
    }

    try {
      const files = req.files;
      const folderPath = fieldName;
      // Process each file upload to Firebase Cloud Storage
      const uploadPromises = files.map((file) => {
        return new Promise((resolve, reject) => {
          const blob = bucket.file(`${folderPath}/${file.originalname}`);
          // const blob = bucket.file(file.originalname);
          const blobStream = blob.createWriteStream({
            metadata: {
              contentType: file.mimetype,
            },
          });

          blobStream.on('error', (err) => {
            console.error('Error uploading to Firebase:', err);
            reject('Error uploading to Firebase');
          });

          blobStream.on('finish', async () => {
            await blob.makePublic();
            // Generate public URL for the uploaded file
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            console.log('public url', publicUrl);
            file.firebaseUrl = publicUrl; // Attach Firebase URL to file object
            resolve();
          });

          blobStream.end(file.buffer); // Write file buffer to Cloud Storage
        });
      });

      await Promise.all(uploadPromises);
      next(); // Call next middleware or request handler
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Server Error');
    }
  });
};

module.exports = {
  uploadSingle,
  uploadMultiple,
};
