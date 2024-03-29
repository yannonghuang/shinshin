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

  app.get("/api/auth/userTitles",
    controller.getUserTitles
  );

  app.get("/api/auth/volunteerDepartments",
    controller.getVolunteerDepartments
  );

  app.post("/api/auth/signin", controller.signin);

  app.post("/api/auth/reset", controller.reset);

  app.post("/api/auth/findByEmail", controller.findByEmail);

  app.post("/api/auth/signout", controller.signout);

  app.get("/api/auth/roles", controller.getRoles);

  app.post("/api/auth/users",
      [authJwt.verifyToken],
      controller.findAll2
    );

  // Retrieve "simple" list of users
  app.post("/api/auth/usersSimple",
    [authJwt.verifyToken],
    controller.findAllSimple);

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

  app.post(
    "/api/auth/createContactOnly",
    [authJwt.verifyToken],
    controller.createContactOnly
  );

  app.put("/api/auth/users/updateContactOnly/:id",
    [authJwt.verifyToken],
    controller.updateContactOnly);
};
