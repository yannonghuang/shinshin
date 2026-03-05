const { authJwt } = require("../middleware");
const cases = require("../controllers/case.controller.js");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/cases/", [authJwt.verifyToken, authJwt.isVolunteerOrAdmin], cases.create);
  app.get("/api/cases/", cases.findAll);
  app.get("/api/cases/options", cases.getOptions);
  app.get("/api/cases/:id", cases.findOne);
  app.put("/api/cases/:id", [authJwt.verifyToken, authJwt.isVolunteerOrAdmin], cases.update);
  app.delete("/api/cases/:id", [authJwt.verifyToken, authJwt.isVolunteerOrAdmin], cases.delete);
};
