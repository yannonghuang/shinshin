const { verifySignUp } = require("../middleware");
const { authJwt } = require("../middleware");
const controller = require("../controllers/auth.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/signup",
    [
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted
    ],
    controller.signup
  );

  app.post("/api/auth/signin", controller.signin);

  app.get("/api/auth/roles", controller.getRoles);

  app.post("/api/auth/users",
      [authJwt.verifyToken],
      controller.findAll2
    );

  // Delete a user with id
  app.delete("/api/auth/users/:id",
    [authJwt.verifyToken],
    controller.delete);

  app.get("/api/auth/users/:id",
    [authJwt.verifyToken],
    controller.findOne);

  // Update a user with id
  app.put("/api/auth/users/update/:id",
    [authJwt.verifyToken],
    controller.update);
};
