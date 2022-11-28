const { authJwt } = require("../middleware");
const awards = require("../controllers/award.controller.js");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/awards/",
    [authJwt.verifyToken],
    awards.create
  );

  app.get("/api/awards/categories",
    [authJwt.verifyToken],
    awards.getAwardCategories
  );

  app.post("/api/awards/all",
    //[authJwt.verifyToken],
    awards.findAll2
  );

  // Retrieve a single Award with id
  app.get("/api/awards/:id",
    //[authJwt.verifyToken],
    awards.findOne);


  // Retrieve a single Award photo with id
  app.get("/api/awardPhoto/:id",
    [authJwt.verifyToken],
    awards.findOnePhoto);

  // Update a Award with id
  app.put("/api/awards/:id",
    [authJwt.verifyToken],
    awards.update);

  // Delete a Award with id
  app.delete("/api/awards/:id",
    [authJwt.verifyToken],
    awards.delete);

  // Delete all Awards
  app.delete("/api/awards/",
    [authJwt.verifyToken],
    awards.deleteAll);

  app.get("/api/award/types",
    [authJwt.verifyToken],
    awards.getAwardTypes);
};
