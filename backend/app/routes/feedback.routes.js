const { authJwt } = require("../middleware");
const feedbacks = require("../controllers/feedback.controller.js");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/feedbacks/",
    //[authJwt.verifyToken],
    feedbacks.create
  );

  app.post("/api/feedbacks/all",
    //[authJwt.verifyToken],
    feedbacks.findAll2
  );

  app.get("/api/feedbacks/published",
    [authJwt.verifyToken],
    feedbacks.findAllPublished
  );

  // Retrieve a single Feedback with id
  app.get("/api/feedbacks/:id",
    //[authJwt.verifyToken],
  feedbacks.findOne);

  // Update a Feedback with id
  app.put("/api/feedbacks/:id",
    //[authJwt.verifyToken],
  feedbacks.update);

  // Delete a Feedback with id
  app.delete("/api/feedbacks/:id",
    [authJwt.verifyToken],
  feedbacks.delete);

  // Delete all Feedbacks
  app.delete("/api/feedbacks/",
    [authJwt.verifyToken],
  feedbacks.deleteAll);
};
