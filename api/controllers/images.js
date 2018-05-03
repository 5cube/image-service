const mongoose = require('mongoose');

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
  // console.log(req.body.file)
  const image = new Image({
    filename: req.body.filename,
    mimetype: req.body.mimetype,
    path: req.body.path
  });
  image
    .save()
    .then(result => {
      res.status(201).json({
        message: 'Created.',
        result: {
          id: result.imageId,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
          status: result.status,
          filename: result.filename,
          mimetype: result.mimetype,
          path: result.path
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
