const db = require("../models");
const Form = db.forms;
const Response = db.responses;
const Project = db.projects;
const Op = db.Sequelize.Op;

const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const propagateUpdates = async (req) => {
  const formId = req.params.id;
  const {title, startAt} = req.body;

  try {
    await Response.update({title: title, startAt: startAt}, {where: { formId: formId }});
    const responseIds = await Response.findAll({
      attributes: ['id'],
      where: { formId: formId }
    });

    let rIds = [];
    for (var i = 0; i < responseIds.length; i++) rIds.push(responseIds[i].id);

    await Project.update({name: title, startAt: startAt}, {
      where: {
        responseId: {[Op.or]: rIds}
      }
    });

  } catch (e) {
    console.log(e.message);
  }

};

const getPagingData = (count, data, page, limit) => {
  //const { count: totalItems, rows: schools } = data;
  const forms = data;
  const totalItems = count;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, forms, totalPages, currentPage };
};

// Create and Save a new Form
exports.create = (req, res) => {
  // Validate request
  if (!req.body.title) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a Form
  const form = {
    title: req.body.title,
    description: req.body.description,
    deadline: req.body.deadline,
    startAt: req.body.startAt,
    published: req.body.published ? req.body.published : false,
    fdata: req.body.fdata,
  };

  // Save Form in the database
  Form.create(form)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Form."
      });
    });
};

// Retrieve all Forms from the database.
exports.findAll = (req, res) => {
  const { page, size, title } = req.query;
  var condition = title ? { title: { [Op.like]: `%${title}%` } } : null;

  const { limit, offset } = getPagination(page, size);

  Form.findAndCountAll({ where: condition, limit, offset })
    .then(data => {
      const response = getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving forms."
      });
    });
};

exports.findAll2 = (req, res) => {
  const title = req.body.title;
  const startAt = req.body.startAt;
  const page = req.body.page;
  const size = req.body.size;
  const orderby = req.body.orderby;
  //const { page, size, title } = req.query;

  var orderbyObject = null;
  if (orderby) {
    orderbyObject = [];
    for (var i = 0; i < orderby.length; i++) {
      if (orderby[i].id == 'responsesCount')
        orderbyObject.push([db.Sequelize.fn("COUNT", db.Sequelize.col("responses.id")),
          (orderby[i].desc ? "desc" : "asc")]);
      else
        orderbyObject.push([orderby[i].id, (orderby[i].desc ? "desc" : "asc")]);
    }
  };
/*
  if (orderby) {
    orderbyObject = [];
    for (var i = 0; i < orderby.length; i++) {
      var s = orderby[i].id.split(".");
      if (s.length == 1) orderbyObject.push([s[0], (orderby[i].desc ? "desc" : "asc")]);
      if (s.length == 2) { // this should NEVER happen ...
        var m = null;
        if (s[0] == 'response') m = Response;
        orderbyObject.push([m, s[1], (orderby[i].desc ? "desc" : "asc")]);
      }
    }
  };
*/

  //var condition = title ? { title: { [Op.like]: `%${title}%` } } : null;
  var condition = {
        [Op.and]: [
            title ? { title: { [Op.like]: `%${title}%` } } : null,
            startAt ? { "": { [Op.eq]: db.Sequelize.where(db.Sequelize.fn('YEAR', db.Sequelize.col('form.startAt')), `${startAt}`) } } : null
        ]};

  const { limit, offset } = getPagination(page, size);

  Form.findAll({
  where: condition,
  limit: limit,
  offset: offset,
  subQuery: false,
  attributes: ['id', 'title', 'description',// 'deadline',
      [db.Sequelize.fn("COUNT", db.Sequelize.col("responses.id")), "responsesCount"],
      [db.Sequelize.fn('date_format', db.Sequelize.col("deadline"), '%Y-%m-%d'), "deadline"],
      "startAt", //[db.Sequelize.fn('date_format', db.Sequelize.col("form.startAt"), '%Y-%m-%d'), "startAt"],
  ],
  include: [{
      model: Response,
      attributes: [],
      required: false,
  }],
  group: ['id'],
  order: orderbyObject
  })
    .then(data => {
      Form.count({where: condition})
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
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving responses."
      });
    });
};

exports.SAVE_findAll2 = (req, res) => {
  const title = req.body.title;
  const page = req.body.page;
  const size = req.body.size;

  //const { page, size, title } = req.query;
  var condition = title ? { title: { [Op.like]: `%${title}%` } } : null;

  const { limit, offset } = getPagination(page, size);

  Form.findAndCountAll({ where: condition, limit, offset })
    .then(data => {
      const response = getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving forms."
      });
    });
};

// find all published Form
exports.findAllPublished = (req, res) => {
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);

  Form.findAndCountAll({ where: { published: true }, limit, offset })
    .then(data => {
      const response = getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving forms."
      });
    });
};


// Find a single Form with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Form.findByPk(id, {
    attributes: ['id', 'title', 'description', 'fdata', // 'deadline',
      [db.Sequelize.fn('date_format', db.Sequelize.col("deadline"), '%Y-%m-%d'), "deadline"],
      "startAt", //[db.Sequelize.fn('YEAR', db.Sequelize.col('form.startAt')), "startAt"],
      //[db.Sequelize.fn('date_format', db.Sequelize.col("startAt"), '%Y-%m-%d'), "startAt"],
  ]
  })
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Form with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Form with id=" + id
      });
    });
};

// Update a Form by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Form.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Form was updated successfully."
        });

        propagateUpdates(req);
      } else {
        res.send({
          message: `Cannot update Form with id=${id}. Maybe Form was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Form with id=" + id
      });
    });
};

// Delete a form with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Form.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Form was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Form with id=${id}. Maybe Form was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Form with id=" + id
      });
    });
};


// Delete all Forms from the database.
exports.deleteAll = (req, res) => {
  Form.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Forms were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all forms."
      });
    });
};


