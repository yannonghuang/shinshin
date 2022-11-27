const { authJwt } = require("../middleware");
const questionaires = require("../controllers/questionaire.controller.js");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/questionaires/",
    [authJwt.verifyToken],
    questionaires.create
  );

  app.get("/api/questionaires/",
    [authJwt.verifyToken],
    questionaires.findAll
  );

  app.post("/api/questionaires/all",
    [authJwt.verifyToken],
    questionaires.findAll2
  );

  app.get("/api/questionaires/published",
    [authJwt.verifyToken],
    questionaires.findAllPublished
  );

  // Retrieve a single Questionaire with id
  app.get("/api/questionaires/:id",
    //[authJwt.verifyToken],
  questionaires.findOne);

  // copy a Questionaire with id
  app.get("/api/questionairesCopy/:id",
    [authJwt.verifyToken],
    questionaires.copy);

  // publish a Questionaire with id
  app.get("/api/questionairesPublish/:id",
    [authJwt.verifyToken],
    questionaires.publish);

  // Update a Questionaire with id
  app.put("/api/questionaires/:id",
    [authJwt.verifyToken],
  questionaires.update);

  // Delete a Questionaire with id
  app.delete("/api/questionaires/:id",
    [authJwt.verifyToken],
  questionaires.delete);

  // Delete all Questionaires
  app.delete("/api/questionaires/",
    [authJwt.verifyToken],
  questionaires.deleteAll);
};
