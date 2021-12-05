const { authJwt } = require("../middleware");
const responses = require("../controllers/response.controller.js");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/responses/",
    [authJwt.verifyToken],
    responses.create
  );

  app.get("/api/responses/",
    [authJwt.verifyToken],
    responses.findAll
  );

  app.post("/api/responses/all",
    [authJwt.verifyToken],
    responses.findAll2
  );

  app.get("/api/responses/published",
    [authJwt.verifyToken],
    responses.findAllPublished
  );

  // Retrieve a single Response with id
  app.get("/api/responses/:id",
    [authJwt.verifyToken],
  responses.findOne);

  // Update a Response with id
  app.put("/api/responses/:id",
    [authJwt.verifyToken],
  responses.update);

  // Delete a Response with id
  app.delete("/api/responses/:id",
    [authJwt.verifyToken],
  responses.delete);

  // Delete all Responses
  app.delete("/api/responses/",
    [authJwt.verifyToken],
  responses.deleteAll);
};
