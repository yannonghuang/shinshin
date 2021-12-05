const { authJwt } = require("../middleware");
const express = require("express");
const router = express.Router();
const homeController = require("../controllers/upload-home");
const uploadController = require("../controllers/upload");

let routes = app => {
  router.get("/", homeController.getHome);

  router.post("/multiple-upload", uploadController.multipleUpload);

  // school photo & documents upload
  router.post("/api/single-upload/:id", uploadController.singleUpload);
  router.post("/api/documents-upload/:id",
            uploadController.documentsUpload);

  // project photo & documents upload
  router.post("/api/single-project-upload/:id", uploadController.singleProjectUpload);
  router.post("/api/dossiers-upload/:id",
            uploadController.dossiersUpload);

  return app.use("/", router);
};

module.exports = routes;