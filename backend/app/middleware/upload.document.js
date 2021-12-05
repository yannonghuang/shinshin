const util = require("util");
const path = require("path");
const multer = require("multer");

var storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join(`${__dirname}/../../upload`));
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

var uploadDocument = multer({ storage: storage }).array("documents", 10);
var uploadDocumentMiddleware = util.promisify(uploadDocument);
module.exports = uploadDocumentMiddleware;
