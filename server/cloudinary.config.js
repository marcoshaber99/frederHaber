const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'scholarship_files', // specify your folder name
    allowedFormats: ['jpg', 'png', 'jpeg', 'pdf', 'doc', 'docx'],
  },
});

const parser = multer({ storage: storage });

module.exports = parser;
