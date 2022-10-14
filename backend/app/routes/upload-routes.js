const { authJwt } = require("../middleware");
const express = require("express");
const router = express.Router();
const homeController = require("../controllers/upload-home");
const uploadController = require("../controllers/upload");
const batchController = require("../controllers/batch.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });


  // response attachments
  app.post("/multiple-upload",
    //[authJwt.verifyToken],
    uploadController.multipleUpload);

  app.post("/api/attachments-upload/:id",
    [authJwt.verifyToken],
    uploadController.attachmentsUpload);

  // school photo & documents upload
  app.post("/api/single-upload/:id",
    [authJwt.verifyToken],
    uploadController.singleUpload);

  app.post("/api/documents-upload/:id",
    [authJwt.verifyToken],
    uploadController.documentsUpload);

  // project photo & documents upload
  app.post("/api/single-project-upload/:id",
    [authJwt.verifyToken],
    uploadController.singleProjectUpload);

  app.post("/api/dossiers-upload/:id",
    [authJwt.verifyToken],
    uploadController.dossiersUpload);

  // donor photo
  app.post("/api/single-donor-upload/:id",
    [authJwt.verifyToken],
    uploadController.singleDonorUpload);

  // batch upload
  app.post("/api/batch-upload",
    [authJwt.verifyToken],
    batchController.batchUpload);
};
