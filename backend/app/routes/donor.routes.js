const { authJwt } = require("../middleware");
const donors = require("../controllers/donor.controller.js");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/donors/",
    [authJwt.verifyToken],
    donors.create
  );

  app.get("/api/donors/",
    [authJwt.verifyToken],
    donors.findAll
  );

  // Retrieve a single donor photo with id
  app.get("/api/donorPhoto/:id",
    [authJwt.verifyToken],
    donors.findOnePhoto);

  app.post("/api/donors/all",
    //[authJwt.verifyToken],
    donors.findAll2
  );

  // Retrieve a single Donor with id
  app.get("/api/donors/:id",
    //[authJwt.verifyToken],
    donors.findOne);

  // Update a Donor with id
  app.put("/api/donors/:id",
    [authJwt.verifyToken],
    donors.update);

  // Delete a Donor with id
  app.delete("/api/donors/:id",
    [authJwt.verifyToken],
    donors.delete);

  // Delete all Donors
  app.delete("/api/donors/",
    [authJwt.verifyToken],
    donors.deleteAll);

};
