const { authJwt } = require("../middleware");
const comments = require("../controllers/comment.controller.js");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/comments/",
    [authJwt.verifyToken],
    comments.create
  );

  app.post("/api/comments/all",
    [authJwt.verifyToken],
    comments.findAll2
  );

  // Retrieve a single Comment with id
  app.get("/api/comments/:id",
    [authJwt.verifyToken],
  comments.findOne);


  // Update a Comment with id
  app.put("/api/comments/:id",
    [authJwt.verifyToken],
  comments.update);

  // Delete a Comment with id
  app.delete("/api/comments/:id",
    [authJwt.verifyToken],
  comments.delete);

  // Delete all Comments
  app.delete("/api/comments/",
    [authJwt.verifyToken],
  comments.deleteAll);
};
