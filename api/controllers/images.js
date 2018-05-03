const mongoose = require('mongoose');
const jimp = require('jimp');
const imagesPath = './images/';
const xs = 'w256';
const sm = 'w640';
const md = 'w1280';
const lg = 'w1920';

const Image = require('../models/image');

exports.findAll = (req, res, next) => {
  const offset = req.query.offset ? Number(req.query.offset) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  Image.count({}, (err, count) => {
    if (err) {
      console.log(err);
      res.status(500).json({
        error: err
      });
    }
    Image.find()
      .skip(offset)
      .limit(limit)
      .exec()
      .then(docs => {
        const response = {
          total: count,
          result: docs.map(doc => {
            return {
              id: doc.imageId,
              createdAt: doc.createdAt,
              updatedAt: doc.updatedAt,
              status: doc.status,
              filename: doc.filename,
              originalname: doc.originalname,
              mimetype: doc.mimetype,
              path: doc.path
            };
          })
        };
        res.status(200).json(response);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  })
};

exports.findById = (req, res, next) => {
  const id = req.params.id;
  Image.findOne({
    imageId: id
  })
    .exec()
    .then(doc => {
      if (!doc) {
        return res.status(404).json({
          message: 'Not found.'
        });
      }
      res.status(200).json({
        result: {
          id: doc.imageId,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
          status: doc.status,
          filename: doc.filename,
          originalname: doc.originalname,
          mimetype: doc.mimetype,
          path: doc.path
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.add = (req, res, next) => {
  const body = req.body;
  const file = req.file;
  if (!file) {
    return res.status(400).json({
      message: 'File not uploaded.'
    });
  }
  let params = {
    originalname: file.originalname,
    mimetype: file.mimetype
  };
  if (body && body.filename) {
    params.filename = body.filename
  }
  const image = new Image(params);
  image
    .save()
    .then(result => {
      jimp.read(file.buffer, (err, file) => {
        if (err) {
          return res.status(400).json({
            message: 'File write error.'
          });
        }
        const ext = file.getExtension();
        file.resize(1920, jimp.AUTO)
          .quality(95)
          .write(imagesPath + result.imageId + '/' + lg + '.' + ext);
        file.resize(1280, jimp.AUTO)
          .quality(95)
          .write(imagesPath + result.imageId + '/' + md + '.' + ext);
        file.resize(640, jimp.AUTO)
          .quality(95)
          .write(imagesPath + result.imageId + '/' + sm + '.' + ext);
        file.resize(256, jimp.AUTO)
          .quality(95)
          .write(imagesPath + result.imageId + '/' + xs + '.' + ext);
        res.status(201).json({
          message: 'Created.',
          result: {
            id: result.imageId,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
            status: result.status,
            filename: result.filename,
            originalname: result.originalname,
            mimetype: result.mimetype
          }
        });
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.update = (req, res, next) => {
  const id = req.params.id;
  const updateOps = {};
  for (const key in req.body) {
    const value = req.body[key];
    if (value && typeof value === 'object' && value.constructor === Object) {
      for (const okey in value) {
        updateOps[`${key}.${okey}`] = value[okey];
      }
    } else {
      updateOps[key] = req.body[key];
    }
  }
  Image.findOne({
    imageId: id
  })
    .exec()
    .then(doc => {
      if (!doc) {
        return res.status(404).json({
          message: 'Not found.'
        });
      }
      Image.update({
        imageId: id
      }, {
          $set: updateOps
        })
        .exec()
        .then(result => {
          res.status(200).json({
            message: 'Updated.'
          });
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({
            error: err
          });
        });
    }).catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.delete = (req, res, next) => {
  const id = req.params.id;
  Image.remove({
    imageId: id
  })
    .exec()
    .then(result => {
      res.status(200).json({
        message: 'Deleted.'
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};
