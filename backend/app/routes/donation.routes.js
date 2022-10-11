const { authJwt } = require("../middleware");
const donations = require("../controllers/donation.controller.js");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/donations/",
    [authJwt.verifyToken],
    donations.create
  );

  app.get("/api/donations/",
    [authJwt.verifyToken],
    donations.findAll
  );

  // Retrieve a single donation photo with id
  app.get("/api/donationPhoto/:id",
    [authJwt.verifyToken],
    donations.findOnePhoto);

  app.post("/api/donations/all",
    //[authJwt.verifyToken],
    donations.findAll2
  );

  // Retrieve a single Donation with id
  app.get("/api/donations/:id",
    //[authJwt.verifyToken],
    donations.findOne);

  // Update a Donation with id
  app.put("/api/donations/:id",
    [authJwt.verifyToken],
    donations.update);

  // Delete a Donation with id
  app.delete("/api/donations/:id",
    [authJwt.verifyToken],
    donations.delete);

  // Delete all Donations
  app.delete("/api/donations/",
    [authJwt.verifyToken],
    donations.deleteAll);

};
