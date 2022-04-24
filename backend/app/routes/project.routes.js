const { authJwt } = require("../middleware");
const projects = require("../controllers/project.controller.js");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/projects/",
    [authJwt.verifyToken],
    projects.create
  );

  app.get("/api/projects/",
    [authJwt.verifyToken],
    projects.findAll
  );

  app.get("/api/projects/regions",
    [authJwt.verifyToken],
    projects.getRegions
  );

  app.post("/api/projects/all",
    //[authJwt.verifyToken],
    projects.findAll2
  );

  app.get("/api/projects/published",
    [authJwt.verifyToken],
    projects.findAllPublished
  );

  // Retrieve a single Project with id
  app.get("/api/projects/:id",
    //[authJwt.verifyToken],
    projects.findOne);


  // Retrieve a single Project photo with id
  app.get("/api/projectPhoto/:id",
    [authJwt.verifyToken],
    projects.findOnePhoto);

  // Retrieve "simple" list of Projects
  app.get("/api/projectsSimple",
    [authJwt.verifyToken],
    projects.findAllSimple);

  // Update a Project with id
  app.put("/api/projects/:id",
    [authJwt.verifyToken],
    projects.update);

  // Delete a Project with id
  app.delete("/api/projects/:id",
    [authJwt.verifyToken],
    projects.delete);

  // Delete all Projects
  app.delete("/api/projects/",
    [authJwt.verifyToken],
    projects.deleteAll);

  app.get("/api/projectsStatuses",
    [authJwt.verifyToken],
    projects.getStatuses);
};
