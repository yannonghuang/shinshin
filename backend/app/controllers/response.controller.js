const db = require("../models");
const Response = db.responses;
const Project = db.projects;
const Attachment = db.attachments;
const School = db.schools;
const Op = db.Sequelize.Op;

const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const getPagingData = (count, data, page, limit) => {
  //const { count: totalItems, rows: schools } = data;
  const responses = data;
  const totalItems = count;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, responses, totalPages, currentPage };
};

// Create and Save a new Response
exports.create = (req, res) => {
  // Validate request
  if (!req.body.title) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a Response
  const response = {
    title: req.body.title,
    fdata: req.body.fdata,
    formId: req.body.formId,
    schoolId: req.body.schoolId,
  };

  // Save Response in the database
  Response.create(response)
    .then(data => {

    // Create a Project
    const project = {
      name: data.title, //req.body.name,
      schoolId: data.schoolId,
      responseId: data.id,
    };

    // Save Project in the database
    Project.create(project)
      .then(pdata => {
        // return response object
        res.send(data);
      })
      .catch(err => {
        console.log(err.message || "Some error occurred while creating the Project.");
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the Project."
        });
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Response."
      });
    });
};

// Retrieve all Responses from the database.
exports.findAll = (req, res) => {
  const { page, size, title } = req.query;
  var condition = title ? { title: { [Op.like]: `%${title}%` } } : null;

  const { limit, offset } = getPagination(page, size);

  Response.findAndCountAll({ where: condition, limit, offset })
    .then(data => {
      const response = getPagingData(data, page, limit);
      res.send(response);
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

  Response.findAndCountAll({ where: condition, limit, offset })
    .then(data => {
      const response = getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving responses."
      });
    });
};

exports.findAll2 = (req, res) => {
  const title = req.body.title;
  const page = req.body.page;
  const size = req.body.size;
  const formId = req.body.formId;
  const schoolId = req.body.schoolId;
  const orderby = req.body.orderby;

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
  };

  //const { page, size, title } = req.query;

  var condition = {
        [Op.and]: [
            title ? { title: { [Op.like]: `%${title}%` } } : null,
            formId ? { formId: { [Op.eq]: `${formId}` } } : null,
            schoolId ? { '$school.id$': { [Op.eq]: `${schoolId}` } } : null
            //schoolId ? { schoolId: { [Op.eq]: `${schoolId}` } } : null
        ]};

  var include = [
          {
            model: Attachment,
            attributes: [],
            required: false,
          },
          {
            model: School,
            attributes: ['code', 'name', 'region'],
            required: false,
          },
        ];

  const { limit, offset } = getPagination(page, size);

  Response.findAll({
  where: condition,
  limit: limit,
  offset: offset,
  subQuery: false,
  attributes: ['id', 'title', //'createdAt',
      [db.Sequelize.fn('date_format', db.Sequelize.col("response.createdAt"), '%Y-%m-%d'), "createdAt"],
      [db.Sequelize.fn("COUNT", db.Sequelize.col("attachments.id")), "attachmentsCount"]
  ],
  include: include,
  /*
  [
  {
      model: Attachment,
      attributes: [],
      required: false,
  },
  {
      model: School,
      attributes: ['code', 'name', 'region'],
      required: false,
  },
  ],
  */
  group: ['id'],
  order: orderbyObject
  })
    .then(data => {
      Response.count({where: condition, include: include, distinct: true, col: 'id'})
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

// find all published Response
exports.findAllPublished = (req, res) => {
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);

  Response.findAndCountAll({ where: { published: true }, limit, offset })
    .then(data => {
      const response = getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving responses."
      });
    });
};


// Find a single Response with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Response.findByPk(id)
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

// Update a Response by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Response.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Response was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Response with id=${id}. Maybe Response was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Response with id=" + id
      });
    });
};

// Delete a Response with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Response.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Response was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Response with id=${id}. Maybe Response was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Response with id=" + id
      });
    });
};


// Delete all Responses from the database.
exports.deleteAll = (req, res) => {
  Response.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Responses were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all responses."
      });
    });
};


