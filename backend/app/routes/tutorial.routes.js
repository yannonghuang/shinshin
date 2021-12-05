const { authJwt } = require("../middleware");
const tutorials = require("../controllers/tutorial.controller.js");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/tutorials/",
    [authJwt.verifyToken],
    tutorials.create
  );

  app.get("/api/tutorials/",
    [authJwt.verifyToken],
    tutorials.findAll
  );

  app.post("/api/tutorials/all",
    [authJwt.verifyToken],
    tutorials.findAll2
  );

  app.get("/api/tutorials/published",
    [authJwt.verifyToken],
    tutorials.findAllPublished
  );

  // Retrieve a single Tutorial with id
  app.get("/api/tutorials/:id",
    [authJwt.verifyToken],
  tutorials.findOne);

  // Update a Tutorial with id
  app.put("/api/tutorials/:id",
    [authJwt.verifyToken],
  tutorials.update);

  // Delete a Tutorial with id
  app.delete("/api/tutorials/:id",
    [authJwt.verifyToken],
  tutorials.delete);

  // Delete all Tutorials
  app.delete("/api/tutorials/",
    [authJwt.verifyToken],
  tutorials.deleteAll);
};
