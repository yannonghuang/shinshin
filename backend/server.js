const express = require("express");
const cors = require("cors");

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

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

function initial() {

  Role.create({
    id: 1,
    name: "user"
  });

  Role.create({
    id: 2,
    name: "moderator"
  });

  Role.create({
    id: 3,
    name: "admin"
  });

  Role.create({
    id: 4,
    name: "volunteer"
  });
}
