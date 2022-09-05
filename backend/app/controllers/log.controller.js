const db = require("../models");
const Log = db.logs;
const Op = db.Sequelize.Op;
const User = db.user;
const School = db.schools;
const SCHOOL_IMPORTANT_FIELDS = db.SCHOOL_IMPORTANT_FIELDS;

const getPagination = (page, size) => {
  const limit = size ? +size : 30;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: logs } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, logs, totalPages, currentPage };
};

// Create and Save a new Log
exports.create = (req, res) => {
  // Validate request
  if (!req.body.text) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a Log
  const log = {
    text: req.body.text,
    userId: req.body.userId,
    schoolId: req.body.schoolId,
  };

  // Save Log in the database
  Log.create(log)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Log."
      });
    });
};

exports.findAll2 = (req, res) => {
  const text = req.body.text;
  const userId = req.body.userId;
  const schoolId = req.body.schoolId;
  const field = req.body.field;
  const createdAt = req.body.createdAt;

  const orderby = req.body.orderby;

  const page = req.body.page;
  const size = req.body.size;
  //const { page, size, originalname } = req.query;

  var orderbyObject = null;
  if (orderby) {
    orderbyObject = [];
    for (var i = 0; i < orderby.length; i++) {
      var s = orderby[i].id.split(".");
      if (s.length == 1) orderbyObject.push([s[0], (orderby[i].desc ? "desc" : "asc")]);
      if (s.length == 2) {
        var m = null;
        if (s[0] === 'user') m = User;
        if (s[0] === 'school') m = School;
        orderbyObject.push([m, s[1], (orderby[i].desc ? "desc" : "asc")]);
      }
    }
  };

  var importantFields = [];
  for (var i = 0; i < SCHOOL_IMPORTANT_FIELDS.length; i++)
    importantFields.push(SCHOOL_IMPORTANT_FIELDS[i].name);

  var condition = {
        [Op.and]: [
            text
              ?  {[Op.or]: [{ newv: { [Op.like]: `%${text}%` } }, { oldv: { [Op.like]: `%${text}%` } }]}
              : null,
            userId ? { userId: { [Op.eq]: `${userId}` } } : null,
            schoolId ? { schoolId: { [Op.eq]: `${schoolId}` } } : null,
            field ? { field: { [Op.eq]: `${field}` } } : null,
            {field: {[Op.or]: importantFields}},
            createdAt
              ? db.Sequelize.literal(`YEAR(logs.createdAt) >= ${createdAt}`)
              //? { createdAt: { [Op.eq]: `${createdAt}` } }
              : null
        ]};

  const { limit, offset } = getPagination(page, size);

  Log.findAndCountAll({
  where: condition,
  limit: limit,
  offset: offset,
  include: [
    {
      model: User,
      attributes: ['id', 'username', 'chineseName'],
      required: false,
    },
    {
      model: School,
      attributes: ['id', 'code'],
      required: false,
    },
  ],
  order: orderbyObject
  })
    .then(data => {
      const log = getPagingData(data, page, limit);
      res.send(log);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving logs."
      });
    });
};


// Find a single Log with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Log.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Log with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Log with id=" + id
      });
    });
};


// Update a Log by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Log.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Log was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Log with id=${id}. Maybe Log was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Log with id=" + id
      });
    });
};

// Delete an Log with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Log.findByPk(id)
    .then(data => {
    })
    .catch(err => {
      console.error(err);
      });

  Log.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Log was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Log with id=${id}. Maybe Log was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Log with id=" + id
      });
    });
};


// Delete all Logs from the database.
exports.deleteAll = (req, res) => {
  Log.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Logs were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all logs."
      });
    });
};


