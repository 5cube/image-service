const express = require('express');
const router = express.Router();
const multer = require('multer');

const ImagesController = require('../controllers/images');

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/bmp'];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed!'));
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

router.get('/data', ImagesController.findAll);

router.get('/data/:id', ImagesController.findById);

router.get('/:id', ImagesController.getFileById);

router.post('/', upload.single('file'), ImagesController.addFile);

router.patch('/:id', ImagesController.update);

router.delete('/:id', ImagesController.delete);

module.exports = router;
