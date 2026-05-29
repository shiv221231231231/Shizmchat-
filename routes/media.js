const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dywa8dxcf',
  api_key: process.env.CLOUDINARY_API_KEY || '224117555233613',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'OnnKpjWlSUAmBUS3DbAtpDvuWs4'
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ message: 'No file uploaded!' });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'shizm-chat'
    });

    res.json({
      message: 'Upload successful! 🎉',
      url: result.secure_url,
      type: result.resource_type
    });

  } catch (error) {
    res.json({ message: 'Error: ' + error.message });
  }
});

module.exports = router;
