const util = require("util");
const path = require("path");
const multer = require("multer");
const fs = require('fs');

const db = require("../models");
const School = db.schools;

const getDirectory = async (req) => {
  let type = '';
  let code = '';

  if (req.originalUrl.includes('documents')) {
    type = 'School';
    if (req.params.id) { // school id
      try {
        let school = await School.findByPk(req.params.id);
        code = '' + school.code;
      } catch (e) {
        console.log(e);
      }
    }
  }

  if (req.originalUrl.includes('dossiers')) {
    type = 'Project';
    code = '' + req.params.id;
  }

  if (req.originalUrl.includes('attachments')) {
    type = 'response';
    code = '' + req.params.id;
  }

  let dir = path.join(`${__dirname}/../../upload`, type, code);

  if (!fs.existsSync(dir)) {
	fs.mkdirSync(dir, {recursive: true});
  }

  return dir;
}

var storage = multer.diskStorage({
  destination: async (req, file, callback) => {
    callback(null, await getDirectory(req));
    //callback(null, path.join(`${__dirname}/../../upload`));
  },
  filename: (req, file, callback) => {
/**
    const match = ["image/png", "image/jpeg"];
    if (match.indexOf(file.mimetype) === -1) {
      var message = `${file.originalname} is invalid. Only accept png/jpeg.`;
      return callback(message, null);
    }
*/
    var filename = `${Date.now()}-${file.originalname}`;
    callback(null, filename);
  }
});

var uploadFiles = multer({ storage: storage }).array("multi-files", 10);
var uploadFilesMiddleware = util.promisify(uploadFiles);
module.exports = uploadFilesMiddleware;
