const upload = require("../middleware/upload");
//const uploadDocument = require("../middleware/upload.document");

const db = require("../models");
const Attachment = db.attachments;
const School = db.schools;
const Project = db.projects;
const Document = db.documents;
const Dossier = db.dossiers;
const fs = require('fs');

const multipleUpload = async (req, res) => {
  try {
    await upload(req, res);
    console.log(req.files);
    console.log("req.body.responseId: " + req.body.responseId);

/**
    if (req.files.length <= 0) {
      return res.send(`You must select at least 1 file.`);
    }
*/

    // save attachment to db
    if (req.files != null) {
      for (var i = 0; i < req.files.length; i++) {
        var attachment = {
          originalname: req.files[i].originalname,
          encoding: req.files[i].encoding,
          mimetype: req.files[i].mimetype,
          destination: req.files[i].destination,
          filename: req.files[i].destination,
          path: req.files[i].path,
          responseId: req.body.responseId
        };
        try {
          var data = Attachment.create(attachment);
        } catch (err) {
          console.log(err.message || "Some error occurred while creating the Attachment.");
        }
      }
    }

    return res.send(`Files have been uploaded ... req.body.responseId: ` + req.body.responseId);

  } catch (error) {
    console.log(error);

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.send("Too many files to upload.");
    }
    return res.send(`Error when trying upload many files: ${error}`);
  }
};

const attachmentsUpload = async (req, res) => {
  try {
    await upload(req, res);
    console.log(req.files);
    console.log("req.params.id: " + req.params.id);

/**
    if (req.files.length <= 0) {
      return res.send(`You must select at least 1 file.`);
    }
*/

    // save attachment to db
    if (req.files != null) {
      for (var i = 0; i < req.files.length; i++) {
        var attachment = {
          originalname: req.files[i].originalname,
          encoding: req.files[i].encoding,
          mimetype: req.files[i].mimetype,
          destination: req.files[i].destination,
          filename: req.files[i].destination,
          path: req.files[i].path,
          responseId: req.params.id
        };
        try {
          var data = Attachment.create(attachment);
        } catch (err) {
          console.log(err.message || "Some error occurred while creating the Attachment.");
        }
      }
    }

    return res.send(`Files have been uploaded ... req.params.id: ` + req.params.id);

  } catch (error) {
    console.log(error);

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.send("Too many files to upload.");
    }
    return res.send(`Error when trying upload many files: ${error}`);
  }
};

const dossiersUpload = async (req, res) => {
  try {
    await upload(req, res);
    console.log(req.files);
    console.log("req.params.id: " + req.params.id);

    projectId = req.params.id;
    docCategory = req.body.docCategory;
/**
    if (req.files.length <= 0) {
      return res.send(`You must select at least 1 file.`);
    }
*/

    // save dossiers to db
    if (req.files != null) {
      for (var i = 0; i < req.files.length; i++) {
        var dossier = {
          originalname: req.files[i].originalname,
          encoding: req.files[i].encoding,
          mimetype: req.files[i].mimetype,
          destination: req.files[i].destination,
          filename: req.files[i].destination,
          path: req.files[i].path,
          projectId: projectId,
          docCategory: req.body.docCategory
        };
        try {
          var data = Dossier.create(dossier);
        } catch (err) {
          console.log(err.message || "Some error occurred while creating the Document.");
        }
      }
    }

    return res.send(`Files have been uploaded ... projectId: ` + projectId);

  } catch (error) {
    console.log(error);

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.send("Too many files to upload.");
    }
    return res.send(`Error when trying upload many files: ${error}`);
  }
};

const documentsUpload = async (req, res) => {
  try {
    await upload(req, res);
    console.log(req.files);
    console.log("req.params.id: " + req.params.id);


    schoolId = req.params.id;
    docCategory = req.body.docCategory;
/**
    if (req.files.length <= 0) {
      return res.send(`You must select at least 1 file.`);
    }
*/

    // save documents to db
    if (req.files != null) {
      for (var i = 0; i < req.files.length; i++) {
        var document = {
          originalname: req.files[i].originalname,
          encoding: req.files[i].encoding,
          mimetype: req.files[i].mimetype,
          destination: req.files[i].destination,
          filename: req.files[i].destination,
          path: req.files[i].path,
          schoolId: schoolId,
          docCategory: req.body.docCategory
        };
        try {
          var data = Document.create(document);
        } catch (err) {
          console.log(err.message || "Some error occurred while creating the Document.");
        }
      }
    }

    return res.send(`Files have been uploaded ... schoolId: ` + schoolId);

  } catch (error) {
    console.log(error);

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.send("Too many files to upload.");
    }
    return res.send(`Error when trying upload many files: ${error}`);
  }
};

const singleProjectUpload = async (req, res) => {
  try {
    await upload(req, res);
    console.log(req.files);
    console.log("req.params.id: " + req.params.id);

    projectId = req.params.id;

    if (req.files != null) {
      var imageData = fs.readFileSync(req.files[0].path);
      Project.update(
        {photo: imageData},
        {where: { id: projectId }}
      )
      .then(image => {
        res.json({ success: true, data: image })
      })
      fs.unlinkSync(req.files[0].path);
    }
  } catch (error) {
    console.log(error);

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.send("Too many files to upload.");
    }
    return res.send(`Error when trying upload files: ${error}`);
  }
};

const singleUpload = async (req, res) => {
  try {
    await upload(req, res);
    console.log(req.files);
    console.log("req.params.id: " + req.params.id);

    schoolId = req.params.id;

    if (req.files != null) {
      var imageData = fs.readFileSync(req.files[0].path);
      School.update(
        {photo: imageData},
        {where: { id: schoolId }}
      )
      .then(image => {
        res.json({ success: true, data: image })
      })
      fs.unlinkSync(req.files[0].path);
    }
  } catch (error) {
    console.log(error);

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.send("Too many files to upload.");
    }
    return res.send(`Error when trying upload files: ${error}`);
  }
};

module.exports = {
  multipleUpload: multipleUpload,
  singleUpload: singleUpload,
  documentsUpload: documentsUpload,
  singleProjectUpload: singleProjectUpload,
  dossiersUpload: dossiersUpload,
  attachmentsUpload: attachmentsUpload
};
