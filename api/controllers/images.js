const mongoose = require('mongoose');
const jimp = require('jimp');
const fs = require('fs');

const SIZE_XS = 128;
const SIZE_SM = 256;
const SIZE_MD = 640;
const SIZE_LG = 1280;
const SIZE_XL = 1920;
const JPEG_QUALITY = 90;
const IMAGE_PATH = './images/';

const Image = require('../models/image');

const getSize = (size) => {
  switch(size) {
    case '128': return '128'
    case 'w128': return '128'
    case 'xs': return '128'
    case 'avatar': return '128'
    case '256': return '256'
    case 'w256': return '256'
    case 'sm': return '256'
    case 'small': return '256'
    case 'icon': return '256'
    case '640': return '640'
    case 'w640': return '640'
    case 'md': return '640'
    case 'medium': return '640'
    case '1280': return '1280'
    case 'w1280': return '1280'
    case 'lg': return '1280'
    case 'large': return '1280'
    case 'hd': return '1280'
    case '1920': return '1920'
    case 'w1920': return '1920'
    case 'xl': return '1920'
    case 'fullhd': return '1920'
    default: return '256'
  }
}

const getExtFromMimeType = (mimetype) => {
  const s = mimetype.split('/');
  return s[1];
}

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
              mimetype: doc.mimetype
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
          mimetype: doc.mimetype
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

exports.getFileById = (req, res, next) => {
  const id = req.params.id;
  const size = req.query.size;
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
      const file = IMAGE_PATH + doc.imageId + '/w' + getSize(size) + '.' + getExtFromMimeType(doc.mimetype);
      if (!fs.existsSync(file)) {
        const stub = './static/stub.jpg';
        if (fs.existsSync(stub)) {
          const stat = fs.statSync(stub);
          const responseHeaders = {
            'Content-Type': 'image/jpeg',
            'Content-Length': stat.size,
            'Accept-Ranges': 'bytes'
          }
          res.writeHead(200, responseHeaders);
          const filestream = fs.createReadStream(stub);
          filestream.on('open', () => {
            filestream.pipe(res);
          });
          return false;
        }
        return res.status(404).json({
          message: 'File not found.'
        });
      }
      const stat = fs.statSync(file);
      const responseHeaders = {
        'Content-Type': doc.mimetype,
        'Content-Length': stat.size,
        'Accept-Ranges': 'bytes'
      }
      res.writeHead(200, responseHeaders);
      const filestream = fs.createReadStream(file);
      filestream.on('open', () => {
        filestream.pipe(res);
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
          return res.status(500).json({
            message: 'File read error.'
          });
        }
        const ext = file.getExtension();
        file.resize(SIZE_XL, jimp.AUTO)
          .quality(JPEG_QUALITY)
          .write(IMAGE_PATH + result.imageId + '/w' + SIZE_XL + '.' + ext)
          .resize(SIZE_LG, jimp.AUTO)
          .write(IMAGE_PATH + result.imageId + '/w' + SIZE_LG + '.' + ext)
          .resize(SIZE_MD, jimp.AUTO)
          .write(IMAGE_PATH + result.imageId + '/w' + SIZE_MD + '.' + ext)
          .resize(SIZE_SM, jimp.AUTO)
          .write(IMAGE_PATH + result.imageId + '/w' + SIZE_SM + '.' + ext)
          .resize(SIZE_XS, jimp.AUTO)
          .write(IMAGE_PATH + result.imageId + '/w' + SIZE_XS + '.' + ext);
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
