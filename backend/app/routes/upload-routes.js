const { authJwt } = require("../middleware");
const express = require("express");
const router = express.Router();
const homeController = require("../controllers/upload-home");
const uploadController = require("../controllers/upload");
const batchController = require("../controllers/batch.controller");
const geoController = require("../controllers/geo.controller");

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

  app.post("/api/materials-upload/:id",
    [authJwt.verifyToken],
    uploadController.materialsUpload);

  // donor photo
  app.post("/api/single-donor-upload/:id",
    [authJwt.verifyToken],
    uploadController.singleDonorUpload);

  app.post("/api/single-award-upload/:id",
    [authJwt.verifyToken],
    uploadController.singleAwardUpload);

  // batch upload
  app.post("/api/batch-upload",
    [authJwt.verifyToken],
    batchController.batchUpload);

  // geo upload
  app.post("/api/geo/upload/:filename",
  //  [authJwt.verifyToken],
    geoController.upload);

  // geo download
  app.get("/api/geo/download/:filename",
  //  [authJwt.verifyToken],
    geoController.download);
};
