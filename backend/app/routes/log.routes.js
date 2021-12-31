const { authJwt } = require("../middleware");
const logs = require("../controllers/log.controller.js");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/logs/",
    [authJwt.verifyToken],
    logs.create
  );

  app.post("/api/logs/all",
    [authJwt.verifyToken],
    logs.findAll2
  );

  // Retrieve a single Log with id
  app.get("/api/logs/:id",
    [authJwt.verifyToken],
  logs.findOne);


  // Update a Log with id
  app.put("/api/logs/:id",
    [authJwt.verifyToken],
  logs.update);

  // Delete a Log with id
  app.delete("/api/logs/:id",
    [authJwt.verifyToken],
  logs.delete);

  // Delete all Logs
  app.delete("/api/logs/",
    [authJwt.verifyToken],
  logs.deleteAll);
};
