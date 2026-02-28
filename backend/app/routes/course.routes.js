const { authJwt } = require("../middleware");
const courses = require("../controllers/course.controller.js");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/courses/", [authJwt.verifyToken, authJwt.isVolunteerOrAdmin], courses.create);
  app.get("/api/courses/", courses.findAll);
  app.get("/api/courses/:id", courses.findOne);
  app.put("/api/courses/:id", [authJwt.verifyToken, authJwt.isVolunteerOrAdmin], courses.update);
  app.delete("/api/courses/:id", [authJwt.verifyToken, authJwt.isVolunteerOrAdmin], courses.delete);
};
