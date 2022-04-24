const { authJwt } = require("../middleware");
const forms = require("../controllers/form.controller.js");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/forms/",
    [authJwt.verifyToken],
    forms.create
  );

  app.get("/api/forms/",
    [authJwt.verifyToken],
    forms.findAll
  );

  app.post("/api/forms/all",
    [authJwt.verifyToken],
    forms.findAll2
  );

  app.get("/api/forms/published",
    [authJwt.verifyToken],
    forms.findAllPublished
  );

  // Retrieve a single Form with id
  app.get("/api/forms/:id",
    [authJwt.verifyToken],
  forms.findOne);

  // copy a Form with id
  app.get("/api/formsCopy/:id",
    [authJwt.verifyToken],
    forms.copy);

  // Update a Form with id
  app.put("/api/forms/:id",
    [authJwt.verifyToken],
  forms.update);

  // Delete a Form with id
  app.delete("/api/forms/:id",
    [authJwt.verifyToken],
  forms.delete);

  // Delete all Forms
  app.delete("/api/forms/",
    [authJwt.verifyToken],
  forms.deleteAll);
};
