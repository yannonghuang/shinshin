const { authJwt } = require("../middleware");
const schools = require("../controllers/school.controller.js");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/schools/",
    [authJwt.verifyToken],
    schools.create
  );

  app.get("/api/schools/",
    [authJwt.verifyToken],
    schools.findAll
  );

  app.get("/api/schools/regions",
    [authJwt.verifyToken],
    schools.getRegions
  );

  app.get("/api/schools/countsByRegion",
    [authJwt.verifyToken],
    schools.findCountsByRegion
  );

  app.get("/api/schools/stages",
    [authJwt.verifyToken],
    schools.getSchoolStages
  );

  app.get("/api/schools/statuses",
    [authJwt.verifyToken],
    schools.getSchoolStatuses
  );

  app.get("/api/schools/requests",
    [authJwt.verifyToken],
    schools.getSchoolRequests
  );

  app.get("/api/schools/categories",
    [authJwt.verifyToken],
    schools.getSchoolCategories
  );

  app.post("/api/schools/all",
    [authJwt.verifyToken],
    schools.findAll2
  );

  app.get("/api/schools/published",
    [authJwt.verifyToken],
    schools.findAllPublished
  );

  // Retrieve a single School with id
  app.get("/api/schools/:id",
    [authJwt.verifyToken],
    schools.findOne);

  // Retrieve a single School photo with id
  app.get("/api/schoolPhoto/:id",
    [authJwt.verifyToken],
    schools.findOnePhoto);

  // Retrieve "simple" list of Schools
  app.get("/api/schoolsSimple",
    [authJwt.verifyToken],
    schools.findAllSimple);

  // Update a School with id
  app.put("/api/schools/:id",
    [authJwt.verifyToken],
    schools.update);

  // Delete a School with id
  app.delete("/api/schools/:id",
    [authJwt.verifyToken],
    schools.delete);

  // Delete all Schools
  app.delete("/api/schools/",
    [authJwt.verifyToken],
    schools.deleteAll);
};
