const { authJwt } = require("../middleware");
const materials = require("../controllers/material.controller.js");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/materials/",
    [authJwt.verifyToken],
    materials.create
  );

  app.get("/api/materials/",
    [authJwt.verifyToken],
    materials.findAll
  );

  app.get("/api/materials/categories",
    [authJwt.verifyToken],
    materials.getCategories
  );

  app.post("/api/materials/all",
    [authJwt.verifyToken],
    materials.findAll2
  );

  app.get("/api/materials/published",
    [authJwt.verifyToken],
    materials.findAllPublished
  );

  // Retrieve a single Material with id
  app.get("/api/materials/:id",
    [authJwt.verifyToken],
  materials.findOne);

  // Retrieve a single Material with id return file contents
  app.get("/api/materialsContent/:id",
    [authJwt.verifyToken],
  materials.findOneContent);

  app.get("/api/materialsCount/:id",
    [authJwt.verifyToken],
  materials.count);

  // Update a Material with id
  app.put("/api/materials/:id",
    [authJwt.verifyToken],
  materials.update);

  // Delete a Material with id
  app.delete("/api/materials/:id",
    [authJwt.verifyToken],
  materials.delete);

  // Delete all Materials
  app.delete("/api/materials/",
    [authJwt.verifyToken],
  materials.deleteAll);
};
