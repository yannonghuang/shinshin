const { authJwt } = require("../middleware");
const designations = require("../controllers/designation.controller.js");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/designations/",
    [authJwt.verifyToken],
    designations.create
  );

  app.get("/api/designations/",
    [authJwt.verifyToken],
    designations.findAll
  );

  // Retrieve a single designation photo with id
  app.get("/api/designationPhoto/:id",
    [authJwt.verifyToken],
    designations.findOnePhoto);

  app.post("/api/designations/all",
    //[authJwt.verifyToken],
    designations.findAll2
  );

  // Retrieve a single Designation with id
  app.get("/api/designations/:id",
    //[authJwt.verifyToken],
    designations.findOne);

  // Update a Designation with id
  app.put("/api/designations/:id",
    [authJwt.verifyToken],
    designations.update);

  // Delete a Designation with id
  app.delete("/api/designations/:id",
    [authJwt.verifyToken],
    designations.delete);

  // Delete all Designations
  app.delete("/api/designations/",
    [authJwt.verifyToken],
    designations.deleteAll);

};
