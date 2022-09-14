const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const School = db.schools;
const Role = db.role;
const ROLES = db.ROLES;
const Op = db.Sequelize.Op;
const USER_TITLES = db.USER_TITLES;
const VOLUNTEER_DEPARTMENTS = db.VOLUNTEER_DEPARTMENTS;

const { authJwt } = require("../middleware");

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

const getPagination = (page, size) => {
  const limit = size ? +size : 30;
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

  //User.update(req.body, {
  const {password, ...otherParameters} = req.body;
  const updateParams = (password && password.length >= 6)
    ? {password: bcrypt.hashSync(password, 8), ...otherParameters}
    : { ...otherParameters};

  User.update(updateParams, {
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
        'id', 'username', 'email', 'chineseName', 'phone', 'wechat', 'schoolId', 'title', 'contactOnly',
        [db.Sequelize.fn('date_format', db.Sequelize.col("startAt"), '%Y-%m-%d'), "startAt"],
        [db.Sequelize.fn('date_format', db.Sequelize.col("users.createdAt"), '%Y-%m-%d'), "createdAt"],
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

exports.findAllSimple = (req, res) => {
  const schoolId = req.body.schoolId;
  var condition = schoolId ? { schoolId: { [Op.eq]: `${schoolId}` } } : null;

  User.findAll({
    where: condition,
    attributes: ['id', 'username', 'chineseName', 'title' ],
    order: [ ['chineseName', 'asc'] ]
  })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving responses."
        });
      });
}

exports.findAll2 = async (req, res) => {
  const sid = await authJwt.getSchoolId(req);

  const username = req.body.username;
  const email = req.body.email;
  const role = req.body.role;
  const title = req.body.title;
  const schoolCode = req.body.schoolCode;
  const contactOnly = req.body.contactOnly;
  const emailVerified = req.body.emailVerified;
  const startAt = req.body.startAt;
  const page = req.body.page;
  const size = req.body.size;
  const schoolId = sid ? sid : req.body.schoolId;
  const orderby = req.body.orderby;
  const exportFlag = req.body.exportFlag;

var orderbyObject = null;
  if (orderby) {
    orderbyObject = [];
    for (var i = 0; i < orderby.length; i++) {
      var s = orderby[i].id.split(".");
      if (s.length == 1) orderbyObject.push([s[0], (orderby[i].desc ? "desc" : "asc")]);
      if (s.length == 2) {
        var m = null;
        if (s[0] == 'school') m = School;
        orderbyObject.push([m, s[1], (orderby[i].desc ? "desc" : "asc")]);
      }
    }
  }


  var condition = {
        [Op.and]: [
            username ? {
                      [Op.or] : [
                        {username: { [Op.like]: `%${username}%` }},
                        {chineseName: { [Op.like]: `%${username}%` }},
                      ] } : null,
            email ? { email: { [Op.like]: `%${email}%` }} : null,
            schoolId ? { schoolId: { [Op.eq]: `${schoolId}` }} : null,
            role ? {'$roles.name$': { [Op.eq]: `${role}` }} : null,
            title ? { title: { [Op.like]: `%${title}%` }} : null,
            //schoolCode ? {'$school.code$': { [Op.like]: `%${schoolCode}%` }} : null,
            schoolCode ? { '$school.code$': { [Op.eq]: `${schoolCode}` } } : null,
            contactOnly === undefined
              ? null
              : contactOnly === 'true'
                ? { contactOnly: { [Op.eq]: `1` }}
                : { contactOnly: null },
            emailVerified === undefined
              ? null
              : emailVerified === 'true'
                ? { emailVerified: { [Op.eq]: `1` }}
                : { emailVerified: null },

            startAt ? { "": { [Op.eq]: db.Sequelize.where(db.Sequelize.fn('YEAR', db.Sequelize.col('users.startAt')), `${startAt}`) } } : null,
        ]};

  const include = [
                    {
                        model: Role,
                        attributes: [
                          [db.Sequelize.literal(`
                              if(roles.name = "volunteer", "欣欣义工",
                              if(roles.name = "admin", "管理员",
                              if(roles.name = "user", "学校用户",
                            "")))`),
                          "name"],
                          //'name'
                        ],
                        through: {attributes: []},
                        required: false,
                    },
                    {
                        model: School,
                        attributes: ['id', 'code', 'name', 'region'],
                        required: false,
                    },
  ];

  const { limit, offset } = getPagination(page, size);
  let limits = {};
  if (!exportFlag) {
    limits = {
      offset: offset,
      limit: limit
    }
  }

  User.findAll({
  where: condition,
  ...limits,
  //limit: limit,
  //offset: offset,
  subQuery: false,
  attributes: [
        'id', 'username', 'email', 'chineseName', 'phone', 'wechat', 'title',

        [db.Sequelize.literal(`if(contactOnly = 1, "否", "是")`), "contactOnly"],
        //'contactOnly',

        [db.Sequelize.literal(`if(emailVerified = 1, "是", "否")`), "emailVerified"],
        //'emailVerified',

        [db.Sequelize.fn('date_format', db.Sequelize.col("users.startAt"), '%Y-%m-%d'), "startAt"],

/**
        [db.Sequelize.literal(`
          if(users.startAt is null, date_format(users.createdAt, '%Y-%m-%d'), date_format(users.startAt, '%Y-%m-%d')
          )`),
        "startAt"],
*/

        [db.Sequelize.fn('date_format', db.Sequelize.col("users.createdAt"), '%Y-%m-%d'), "createdAt"],
        [db.Sequelize.fn('date_format', db.Sequelize.col("lastLogin"), '%Y-%m-%d'), "lastLogin"],
  ],
  include: include,
  /**
  group: ['id']
  */
  order: orderbyObject
  })
    .then(data => {
      // Project.count({where: condition, include: include, distinct: true, col: 'id'})
      // User.count({where: condition})
      User.count({where: condition, include: include, distinct: true, col: 'id'})
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
    title: req.body.title,
  })
    .then(user => {
      user.update({startAt: user.createdAt});

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
        user.setRoles(req.body.schoolId ? [1] : [2]).then(() => {
          res.send({ message: "User was registered successfully!" });
        });
      }
    })
    .catch(err => {
      res.status(500).send({ message: '创建用户异常，密码是必填项。。。' + err.message });
    });
};


// Update a user by the id in the request
exports.updateContactOnly = (req, res) => {
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

exports.createContactOnly = (req, res) => {
  // Save User to Database
  User.create(req.body)
    .then(user => {
      user.update({startAt: user.createdAt});

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
        user.setRoles(req.body.schoolId ? [1] : [2]).then(() => {
          res.send({ message: "User was registered successfully!" });
        });
      }
    })
    .catch(err => {
      res.status(500).send({ message: '创建用户异常，。。。' + err.message });
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

      if (!user.emailVerified) {
        return res.status(401).send({
          notEmailVerified: true,
          accessToken: null,
          username: user.username,
          chineseName: user.chineseName,
          email: user.email,
          message: "email not verified!!!"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: config.validity //86400  24 hours
      });

      const lastLastLogin = user.lastLogin;
      user.update({
        lastLogin: db.sequelize.literal('CURRENT_TIMESTAMP'),
        //emailVerified: 1
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
      email: req.body.email,
      contactOnly: null
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      user.update({
        password: bcrypt.hashSync(req.body.password, 8),
        emailVerified: 1
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
      email: req.body.email,
      contactOnly: null
    }
  })
    .then(user => {
      if (!user)
        res.status(404).send({ message: "User Not found." });
      else {
        if (req.body.emailVerified)
          user.update({emailVerified: 1});

        res.status(200).send(user);
      }
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

// return user title list
exports.getUserTitles = (req, res) => {
  res.send(USER_TITLES);
}

exports.getVolunteerDepartments = (req, res) => {
  res.send(VOLUNTEER_DEPARTMENTS);
}