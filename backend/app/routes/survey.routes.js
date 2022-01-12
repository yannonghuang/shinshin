const { authJwt } = require("../middleware");
const surveys = require("../controllers/survey.controller.js");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/surveys/",
    [authJwt.verifyToken],
    surveys.create
  );

  app.post("/api/surveys/all",
    [authJwt.verifyToken],
    surveys.findAll2
  );

  // Retrieve a single Survey with id
  app.get("/api/surveys/:id",
    [authJwt.verifyToken],
  surveys.findOne);


  // Update a Survey with id
  app.put("/api/surveys/:id",
    [authJwt.verifyToken],
  surveys.update);

  // Delete a Survey with id
  app.delete("/api/surveys/:id",
    [authJwt.verifyToken],
  surveys.delete);

  // Delete all Surveys
  app.delete("/api/surveys/",
    [authJwt.verifyToken],
  surveys.deleteAll);
};
