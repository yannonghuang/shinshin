const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
//app.use(express.json());
app.use(express.json({limit: '25mb'}));
app.use(express.urlencoded({limit: '25mb'}));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Pick up React index.html file
app.use(express.static(path.join(__dirname, "../react-app/build")));

const db = require("./app/models");
const Role = db.role;

db.sequelize.sync(/*{ force: true }*/).then(() => {
  //console.log("Drop and re-sync db.");
  //initial();
});

/** simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to application." });
});
*/

require("./app/routes/survey.routes")(app);
require("./app/routes/log.routes")(app);
require("./app/routes/comment.routes")(app);
require("./app/routes/dossier.routes")(app);
require("./app/routes/project.routes")(app);
require("./app/routes/document.routes")(app);
require("./app/routes/school.routes")(app);
require("./app/routes/attachment.routes")(app);
require("./app/routes/upload-routes")(app);
require("./app/routes/response.routes")(app);
require("./app/routes/form.routes")(app);
require("./app/routes/tutorial.routes")(app);
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);

// Catch all requests that don't match any route
app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../react-app/build/index.html")
  );
});

if (process.argv[2] && process.argv[2] === 'secure') {
  // SECURE: Import builtin NodeJS modules to instantiate the service
  const https = require("https");
  const fs = require("fs");
  const SECURE_PORT = process.env.SECURE_PORT || 443;
  https.createServer(
    // Provide the private and public key to the server by reading each
	// file's content with the readFileSync() method.
    {
      key: fs.readFileSync("./security/key.pem"),
      cert: fs.readFileSync("./security/cert.pem"),
    },
    app
  )
  .listen(SECURE_PORT, () => {
    console.log(`Server is running on port ${SECURE_PORT}`);
  });
} else {
  // NON-SECURE: set port, listen for requests
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
}

function initial() {

  //Role.destroy({ truncate : true, cascade: false });

  Role.create({
    id: 1,
    name: "user"
  });

  Role.create({
    id: 2,
    name: "volunteer"
  });

  Role.create({
    id: 3,
    name: "admin"
  });

}
