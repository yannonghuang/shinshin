const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const School = db.schools;
const Role = db.role;
const ROLES = db.ROLES;
const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

const getPagination = (page, size) => {
  const limit = size ? +size : 5;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const getPagingData = (count, data, page, limit) => {
  //const { count: totalItems, rows: schools } = data;
  const users = data;
  const totalItems = count;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, users, totalPages, currentPage };
};


// Update a user by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  User.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        User.findByPk(id).then(user=>{
          if (req.body.roles) {
            Role.findAll({
              where: {
                name: {
                  [Op.or]: req.body.roles
                }
              }
            }).then(roles => {
              user.setRoles(roles).then(() => {
                res.send({ message: "User and roles were updated successfully!" });
              });
            });
          } else {
            res.send({message: "User was updated successfully."});
          }
        });
      } else {
        console.log("Cannot update User with id=${id}. Maybe User was not found or req.body is empty!");
        res.send({
          message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      console.log(err.message || "Error updating User with id=" + id);
      res.status(500).send({
        message: "Error updating User with id=" + id
      });
    });

};

// Find a single user with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  User.findByPk(id, {
  attributes: [
        'id', 'username', 'email', 'chineseName', 'phone', 'wechat', 'schoolId',
        [db.Sequelize.fn('date_format', db.Sequelize.col("startAt"), '%Y-%m-%d'), "startAt"],
        [db.Sequelize.fn('date_format', db.Sequelize.col("lastLogin"), '%Y-%m-%d'), "lastLogin"],
  ],

  include: [
    {
      model: Role,
      attributes: ['name'],
      required: false,
    },
  ],
  })
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Response with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Response with id=" + id
      });
    });
};

exports.findAll2 = (req, res) => {
  const username = req.body.username;
  const page = req.body.page;
  const size = req.body.size;

  //const { page, size, title } = req.query;
  var condition = username ? { username: { [Op.like]: `%${username}%` } } : null;

  const { limit, offset } = getPagination(page, size);

  User.findAll({
  where: condition,
  limit: limit,
  offset: offset,
  subQuery: false,
  attributes: [
        'id', 'username', 'email', 'chineseName', 'phone', 'wechat',
        [db.Sequelize.fn('date_format', db.Sequelize.col("users.startAt"), '%Y-%m-%d'), "startAt"],
        [db.Sequelize.fn('date_format', db.Sequelize.col("lastLogin"), '%Y-%m-%d'), "lastLogin"],
  ],
  include: [
  {
      model: Role,
      attributes: ['name'],
      required: false,
  },
  {
      model: School,
      attributes: ['id', 'code', 'name', 'region'],
      required: false,
  },
  ],
  /**
  group: ['id']
  */
  })
    .then(data => {
      User.count({where: condition})
        .then(count => {
          const response = getPagingData(count, data, page, limit);
          res.send(response);
        })
        .catch(e => {
          res.status(500).send({
            message:
            e.message || "Some error occurred while retrieving responses."
          });
        });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving responses."
      });
    });
};

// Delete a user with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  User.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "User was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete User with id=${id}. Maybe User was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete User with id=" + id
      });
    });
};

// return role list
exports.getRoles = (req, res) => {
  res.send(ROLES);
}

exports.signup = (req, res) => {
  // Save User to Database
  User.create({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    schoolId: req.body.schoolId,
    chineseName: req.body.chineseName,
    phone: req.body.phone,
    wechat: req.body.wechat,
    startAt: req.body.startAt,
  })
    .then(user => {
      if (req.body.roles) {
        Role.findAll({
          where: {
            name: {
              [Op.or]: req.body.roles
            }
          }
        }).then(roles => {
          user.setRoles(roles).then(() => {
            res.send({ message: "User was registered successfully!" });
          });
        });
      } else {
        // user role = 1
        user.setRoles([1]).then(() => {
          res.send({ message: "User was registered successfully!" });
        });
      }
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.signin = (req, res) => {
  User.findOne({
    where: {
      username: req.body.username
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: config.validity //86400  24 hours
      });

      const lastLastLogin = user.lastLogin;
      user.update({
        lastLogin: db.sequelize.literal('CURRENT_TIMESTAMP'),
      });

      var authorities = [];
      user.getRoles().then(roles => {
        for (let i = 0; i < roles.length; i++) {
          authorities.push("ROLE_" + roles[i].name.toUpperCase());
        }
        res.status(200).send({
          id: user.id,
          username: user.username,
          chineseName: user.chineseName,
          email: user.email,
          lastLogin: lastLastLogin
            ? lastLastLogin.toLocaleDateString('zh-cn', { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" })
            : '',
          schoolId: user.schoolId,
          roles: authorities,
          accessToken: token,
          thisLogin: Math.floor(Date.now()/1000),
          validity: config.validity
        });
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.signout = (req, res) => {
  User.findOne({
    where: {
      username: req.body.username
    }
  })
    .then(user => {
      if (!user) {
        console.log("logout: " + username);
        return res.status(404).send({ message: "User Not found." });
      }
      user.update({
        lastLogin: db.sequelize.literal('CURRENT_TIMESTAMP'),
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.reset = (req, res) => {
  User.findOne({
    where: {
      email: req.body.email
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      user.update({
        password: bcrypt.hashSync(req.body.password, 8),
      })
      .then(r => {
        //console.log(r);
        res.status(200).send(user);
      })
      .catch(e => {
        res.status(500).send({ message: e.message });
      });

    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.findByEmail = (req, res) => {
  User.findOne({
    where: {
      email: req.body.email
    }
  })
    .then(user => {
      if (!user)
        res.status(404).send({ message: "User Not found." });
      else
        res.status(200).send(user);
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};