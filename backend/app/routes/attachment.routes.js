const { authJwt } = require("../middleware");
const attachments = require("../controllers/attachment.controller.js");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/attachments/",
    [authJwt.verifyToken],
    attachments.create
  );

  app.get("/api/attachments/",
    [authJwt.verifyToken],
    attachments.findAll
  );

  app.post("/api/attachments/all",
    [authJwt.verifyToken],
    attachments.findAll2
  );

  app.get("/api/attachments/published",
    [authJwt.verifyToken],
    attachments.findAllPublished
  );

  // Retrieve a single Attachment with id
  app.get("/api/attachments/:id",
    [authJwt.verifyToken],
  attachments.findOne);

  // Promote Attachment with id to become Attachment
  app.post("/api/attachmentsPromote/:id",
    [authJwt.verifyToken],
  attachments.promote);

  // Retrieve a single Attachment with id return file contents
  app.get("/api/attachmentsContent/:id",
    [authJwt.verifyToken],
  attachments.findOneContent);

  app.get("/api/attachmentsCount/:id",
    [authJwt.verifyToken],
  attachments.count);

  // Update a Attachment with id
  app.put("/api/attachments/:id",
    [authJwt.verifyToken],
  attachments.update);

  // Delete a Attachment with id
  app.delete("/api/attachments/:id",
    [authJwt.verifyToken],
  attachments.delete);

  // Delete all Attachments
  app.delete("/api/attachments/",
    [authJwt.verifyToken],
  attachments.deleteAll);
};
