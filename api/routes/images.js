const express = require('express');
const router = express.Router();
const multer = require('multer');

const ImagesController = require('../controllers/images');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

router.get('/', ImagesController.findAll);

router.get('/:id', ImagesController.findById);

router.post('/', ImagesController.add);

router.patch('/:id', ImagesController.update);

router.delete('/:id', ImagesController.delete);

module.exports = router;
