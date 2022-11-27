const db = require("../models");
const Questionaire = db.questionaires;
const Feedback = db.feedbacks;
const Project = db.projects;
const Op = db.Sequelize.Op;
const { authJwt } = require("../middleware");

const getPagination = (page, size) => {
  const limit = size ? +size : 30;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};


const getPagingData = (count, data, page, limit) => {
  //const { count: totalItems, rows: schools } = data;
  const questionaires = data;
  const totalItems = count;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, questionaires, totalPages, currentPage };
};

// Create and Save a new Questionaire
exports.create = (req, res) => {

  // Validate request
  if (!req.body.title) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a Questionaire
  const questionaire = {
    title: req.body.title,
    description: req.body.description,
    deadline: req.body.deadline,
    startAt: req.body.startAt,
    published: req.body.published ? req.body.published : false,
    fdata: req.body.fdata,
    pCategoryId: req.body.pCategoryId,
  };

  // Save Questionaire in the database
  Questionaire.create(questionaire)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Questionaire."
      });
    });
};


// Retrieve all Questionaires from the database.
exports.findAll = (req, res) => {
  const { page, size, title } = req.query;
  var condition = title ? { title: { [Op.like]: `%${title}%` } } : null;

  const { limit, offset } = getPagination(page, size);

  Questionaire.findAndCountAll({ where: condition, limit, offset })
    .then(data => {
      const feedback = getPagingData(data, page, limit);
      res.send(feedback);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving questionaires."
      });
    });
};

exports.findAll2 = (req, res) => {

  const title = req.body.title;
  const startAt = req.body.startAt;
  const page = req.body.page;
  const size = req.body.size;
  const orderby = req.body.orderby;
  const published = req.body.published;
  const multipleAllowed = req.body.multipleAllowed;

  var orderbyObject = null;
  if (orderby) {
    orderbyObject = [];
    for (var i = 0; i < orderby.length; i++) {
      if (orderby[i].id == 'feedbacksCount')
        orderbyObject.push([db.Sequelize.fn("COUNT", db.Sequelize.col("feedbacks.id")),
          (orderby[i].desc ? "desc" : "asc")]);
      else
        orderbyObject.push([orderby[i].id, (orderby[i].desc ? "desc" : "asc")]);
    }
  };

  const condition = {
        [Op.and]: [
          title ? { title: { [Op.like]: `%${title}%` } } : null,
          startAt ? { "": { [Op.eq]: db.Sequelize.where(db.Sequelize.fn('YEAR', db.Sequelize.col('questionaire.startAt')), `${startAt}`) } } : null,
          published === undefined
            ? null
            : published === 'true'
              ? { published: { [Op.eq]: `1` }}
              : {[Op.or]: [{ published: { [Op.ne]: `1` }}, { published: null }]},
          multipleAllowed === undefined
            ? null
            : multipleAllowed === 'true'
              ? { multipleAllowed: { [Op.eq]: `1` }}
              : {[Op.or]: [{ multipleAllowed: { [Op.ne]: `1` }}, { multipleAllowed: null }]},
        ]};

  const include = [{
          model: Feedback,
          attributes: [],
          required: false,
        }];
  const { limit, offset } = getPagination(page, size);

  Questionaire.findAll({
  where: condition,
  limit: limit,
  offset: offset,
  subQuery: false,
  attributes: ['id', 'title', 'description',// 'deadline',
      [db.Sequelize.fn("COUNT", db.Sequelize.col("feedbacks.id")), "feedbacksCount"],
      [db.Sequelize.fn('date_format', db.Sequelize.col("deadline"), '%Y-%m-%d'), "deadline"],
      "startAt", //[db.Sequelize.fn('date_format', db.Sequelize.col("questionaire.startAt"), '%Y-%m-%d'), "startAt"],
      "published",
      "multipleAllowed",
  ],
  include: include,
  group: ['id'],
  order: orderbyObject
  })
    .then(data => {
      Questionaire.count({where: condition, include: include, distinct: true, col: 'id'})
        .then(count => {
          const feedback = getPagingData(count, data, page, limit);
          res.send(feedback);
        })
        .catch(e => {
          res.status(500).send({
            message:
            e.message || "Some error occurred while retrieving feedbacks."
          });
        });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving feedbacks."
      });
    });
};

// find all published Questionaire
exports.findAllPublished = (req, res) => {
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);

  Questionaire.findAndCountAll({ where: { published: true }, limit, offset })
    .then(data => {
      const feedback = getPagingData(data, page, limit);
      res.send(feedback);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving questionaires."
      });
    });
};


// Find a single Questionaire with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Questionaire.findByPk(id, {
    attributes: ['id', 'title', 'description', 'fdata', // 'deadline',
      [db.Sequelize.fn('date_format', db.Sequelize.col("deadline"), '%Y-%m-%d'), "deadline"],
      "startAt", //[db.Sequelize.fn('YEAR', db.Sequelize.col('questionaire.startAt')), "startAt"],
      //[db.Sequelize.fn('date_format', db.Sequelize.col("startAt"), '%Y-%m-%d'), "startAt"],
      "published",
      "pCategoryId",
      "multipleAllowed",
  ]
  })
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Questionaire with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Questionaire with id=" + id
      });
    });
};

// copy a questionaire with the specified id in the request
exports.copy = async (req, res) => {
  const id = req.params.id;

  try {
    const f = await Questionaire.findOne({ where: {id: id}, raw:  true, attributes: { exclude: ['id'] } });
    f.title = "复制: " + f.title;
    f.published = null;
    const newF = await Questionaire.create(f);
    res.send(newF);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Could not copy Questionaire with id=" + id
    });
  };
};

// publish a questionaire with the specified id in the request
exports.publish = async (req, res) => {
  const id = req.params.id;

  try {
    await Questionaire.update({published: true}, { where: {id: id }});
    res.status(200).send({
      message: "successfully publish Questionaire with id=" + id
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Could not publish Questionaire with id=" + id
    });
  };
};

// Update a Questionaire by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;

  Questionaire.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Questionaire was updated successfully."
        });

      } else {
        res.send({
          message: `Cannot update Questionaire with id=${id}. Maybe Questionaire was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Questionaire with id=" + id
      });
    });
};

// Delete a questionaire with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Questionaire.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Questionaire was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Questionaire with id=${id}. Maybe Questionaire was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Questionaire with id=" + id
      });
    });
};


// Delete all Questionaires from the database.
exports.deleteAll = (req, res) => {
  Questionaire.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Questionaires were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all questionaires."
      });
    });
};


