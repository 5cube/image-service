const mongoose = require('mongoose');

const Image = require('../models/image');

exports.findAll = (req, res, next) => {
  Image.find()
    .exec()
    .then(docs => {
      const total = docs.length;
      const offset = req.query.offset || 0;
      const limit = req.query.limit || total;
      const response = {
        total: docs.length,
        result: docs.slice(offset, offset + limit)
          .map(doc => {
            return {
              id: doc.fileId,
              createdAt: doc.createdAt,
              updatedAt: doc.updatedAt,
              status: doc.status,
              name: doc.name,
              type: doc.type,
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
};

exports.findById = (req, res, next) => {
  const id = req.params.id;
  Image.findById(id)
    .populate('category', '_id name info')
    .exec()
    .then(doc => {
      if (!doc) {
        return res.status(404).json({
          message: 'Not find.'
        });
      }
      res.status(200).json({
        result: {
          id: doc.fileId,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
          status: doc.status,
          name: doc.name,
          type: doc.type,
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
  const image = new Image({
    name: req.body.name,
    type: req.body.type,
    path: req.body.path
  });
  image
    .save()
    .then(result => {
      res.status(201).json({
        message: 'Created.',
        result: {
          id: result.fileId,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
          status: result.status,
          name: result.name,
          type: result.type,
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
  Image.findById(id)
    .exec()
    .then(doc => {
      if (!doc) {
        return res.status(404).json({
          message: 'Not find.'
        });
      }
      Image.update({
        _id: id
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
    _id: id
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
