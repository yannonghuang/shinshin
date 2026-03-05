const { authJwt } = require("../middleware");
const artifacts = require("../controllers/artifact.controller.js");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/cases/:caseId/artifacts", [authJwt.verifyToken, authJwt.isVolunteerOrAdmin], artifacts.create);
  app.post("/api/cases/:caseId/artifacts/bulk", [authJwt.verifyToken, authJwt.isVolunteerOrAdmin], artifacts.bulkCreateFromZip);
  app.get("/api/cases/:caseId/artifacts", artifacts.findByCase);
  app.get("/api/cases/:caseId/artifacts/download", artifacts.downloadByCase);
  app.get("/api/artifacts/:id", artifacts.findOne);
  app.get("/api/artifacts/:id/download", artifacts.download);
  app.put("/api/artifacts/:id", [authJwt.verifyToken, authJwt.isVolunteerOrAdmin], artifacts.update);
  app.delete("/api/artifacts/:id", [authJwt.verifyToken, authJwt.isVolunteerOrAdmin], artifacts.delete);
};
