const express = require('express');
const router = express.Router();

const ImagesController = require('../controllers/images');

router.get('/', ImagesController.findAll);

router.get('/:id', ImagesController.findById);

router.post('/', ImagesController.add);

router.patch('/:id', ImagesController.update);

router.delete('/:id', ImagesController.delete);

module.exports = router;
