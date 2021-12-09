const { authJwt } = require("../middleware");
const documents = require("../controllers/document.controller.js");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/documents/",
    [authJwt.verifyToken],
    documents.create
  );

  app.get("/api/documents/",
    [authJwt.verifyToken],
    documents.findAll
  );

  app.get("/api/documents/categories",
    [authJwt.verifyToken],
    documents.getCategories
  );

  app.post("/api/documents/all",
    [authJwt.verifyToken],
    documents.findAll2
  );

  app.get("/api/documents/published",
    [authJwt.verifyToken],
    documents.findAllPublished
  );

  // Retrieve a single Document with id
  app.get("/api/documents/:id",
    [authJwt.verifyToken],
  documents.findOne);

  // Retrieve a single Document with id return file contents
  app.get("/api/documentsContent/:id",
    [authJwt.verifyToken],
  documents.findOneContent);

  app.get("/api/documentsCount/:id",
    [authJwt.verifyToken],
  documents.count);

  // Update a Document with id
  app.put("/api/documents/:id",
    [authJwt.verifyToken],
  documents.update);

  // Delete a Document with id
  app.delete("/api/documents/:id",
    [authJwt.verifyToken],
  documents.delete);

  // Delete all Documents
  app.delete("/api/documents/",
    [authJwt.verifyToken],
  documents.deleteAll);
};
