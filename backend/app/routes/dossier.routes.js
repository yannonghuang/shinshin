const { authJwt } = require("../middleware");
const dossiers = require("../controllers/dossier.controller.js");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/dossiers/",
    [authJwt.verifyToken],
    dossiers.create
  );

  app.get("/api/dossiers/",
    [authJwt.verifyToken],
    dossiers.findAll
  );

  app.get("/api/dossiers/categories",
    [authJwt.verifyToken],
    dossiers.getCategories
  );

  app.post("/api/dossiers/all",
    [authJwt.verifyToken],
    dossiers.findAll2
  );

  app.get("/api/dossiers/published",
    [authJwt.verifyToken],
    dossiers.findAllPublished
  );

  // Retrieve a single Dossier with id
  app.get("/api/dossiers/:id",
    [authJwt.verifyToken],
  dossiers.findOne);

  // Retrieve a single Dossier with id return file contents
  app.get("/api/dossiersContent/:id",
//    [authJwt.verifyToken],
  dossiers.findOneContent);

  app.get("/api/dossiersCount/:id",
    [authJwt.verifyToken],
  dossiers.count);

  // Update a Dossier with id
  app.put("/api/dossiers/:id",
    [authJwt.verifyToken],
  dossiers.update);

  // Delete a Dossier with id
  app.delete("/api/dossiers/:id",
    [authJwt.verifyToken],
  dossiers.delete);

  // Delete all Dossiers
  app.delete("/api/dossiers/",
    [authJwt.verifyToken],
  dossiers.deleteAll);
};
