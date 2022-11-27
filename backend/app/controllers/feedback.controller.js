const db = require("../models");
const Feedback = db.feedbacks;
const Questionaire = db.questionaires;
const Project = db.projects;
const School = db.schools;
const Op = db.Sequelize.Op;

const { authJwt } = require("../middleware");

const getPagination = (page, size) => {
  const limit = size ? +size : 30;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const getPagingData = (count, data, page, limit) => {
  //const { count: totalItems, rows: schools } = data;
  const feedbacks = data;
  const totalItems = count;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, feedbacks, totalPages, currentPage };
};

// Create and Save a new Feedback
exports.create = async (req, res) => {
  // Validate request
  if (!req.body.title) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  const questionaireId = req.body.questionaireId;
  var startAt = null;
  if (questionaireId) {
    const f = await Questionaire.findByPk(questionaireId);
    if (f) startAt = f.startAt;
  }

  // Create a Feedback
  const feedback = {
    title: req.body.title,
    fdata: req.body.fdata,
    questionaireId: req.body.questionaireId,
    schoolId: req.body.schoolId,
    userId: req.body.userId,
    startAt: startAt,
    pCategoryId: req.body.pCategoryId,
    respondant: req.body.respondant,
  };

  try {
    // Save Feedback in the database
    let data = await Feedback.create(feedback);

    res.send(data);

  } catch(err) {
    console.log(err.message || "Some error occurred while creating the Project.");
    res.status(500).send({
      message:
        err.message || "Some error occurred while creating the Project."
      });
    }
};

exports.findAll2 = (req, res) => {

  const title = req.body.title;
  const respondant = req.body.respondant;
  const startAt = req.body.startAt;
  const code = req.body.code;
  const page = req.body.page;
  const size = req.body.size;
  const questionaireId = req.body.questionaireId;
  const schoolId = req.body.schoolId;
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
  };

  //const { page, size, title } = req.query;

  var condition = {
        [Op.and]: [
            title ? { title: { [Op.like]: `%${title}%` } } : null,
            respondant ? { respondant: { [Op.like]: `%${respondant}%` } } : null,
            questionaireId ? { questionaireId: { [Op.eq]: `${questionaireId}` } } : null,
            schoolId ? { '$school.id$': { [Op.eq]: `${schoolId}` } } : null,
            code ? { '$school.code$': { [Op.eq]: `${code}` } } : null,
            startAt ? { "": { [Op.eq]: db.Sequelize.where(db.Sequelize.fn('YEAR', db.Sequelize.col('feedback.startAt')), `${startAt}`) } } : null

            //schoolId ? { schoolId: { [Op.eq]: `${schoolId}` } } : null
        ]};

  var include = [
          {
            model: School,
            attributes: ['id', 'code', 'name', 'region', 'teachersCount', 'studentsCount', 'category', 'address'],
            required: false,
          },
          {
            model: Questionaire,
            attributes: ['deadline'],
            required: false,
          },
        ];

  var attributes = [
    'id', 'title', 'startAt', 'updatedAt', "respondant"
    //[db.Sequelize.fn('date_questionaireat', db.Sequelize.col("feedback.startAt"), '%Y-%m-%d'), "startAt"],
    //[db.Sequelize.fn("COUNT", db.Sequelize.col("attachments.id")), "attachmentsCount"],
  ];
  if (exportFlag) attributes.push('fdata');

  const { limit, offset } = getPagination(page, size);
  let limits = {};
  if (!exportFlag) {
    limits = {
      offset: offset,
      limit: limit
    }
  }

  Feedback.findAll({
  where: condition,
  ...limits,
  //limit: limit,
  //offset: offset,
  subQuery: false,
  attributes: attributes,
  include: include,
  //group: ['id'],
  order: orderbyObject
  })
    .then(data => {
      Feedback.count({where: condition, include: include, distinct: true, col: 'id'})
        .then(count => {
          const feedback = getPagingData(count, data, page, limit);
          res.send(feedback);
        })
        .catch(e => {
          console.log(e);
          res.status(500).send({
            message:
            e.message || "Some error occurred while retrieving feedbacks."
          });
        });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving feedbacks."
      });
    });
};

// find all published Feedback
exports.findAllPublished = (req, res) => {
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);

  Feedback.findAndCountAll({ where: { published: true }, limit, offset })
    .then(data => {
      const feedback = getPagingData(data, page, limit);
      res.send(feedback);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving feedbacks."
      });
    });
};


// Find a single Feedback with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Feedback.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Feedback with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Feedback with id=" + id
      });
    });
};

// Update a Feedback by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Feedback.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Feedback was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Feedback with id=${id}. Maybe Feedback was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      console.log(err)
      res.status(500).send({
        message: "Error updating Feedback with id=" + id
      });
    });
};

// Delete a Feedback with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    await Feedback.destroy({
      where: { id: id }
    });

    res.send({
      message: "Feedback deleted successfully!"
    });
  } catch (err) {
    res.status(500).send({
      message: "Could not delete Feedback with id=" + id
    });
  };
};

// Delete a Feedback with the specified id in the request
exports.SAVE_delete = (req, res) => {
  const id = req.params.id;

  Feedback.destroy({
    where: { id: id }
  })
    .then(num => {
/**
      if (num == 1) {
*/
        Project.destroy({
          where: { feedbackId: id }
        })
        .then(n => {
          res.send({
            message: "Feedback & associated project deleted successfully!"
          });
        });
/**
      } else {
        res.send({
          message: `Cannot delete Feedback with id=${id}. Maybe Feedback was not found!`
        });
      }
*/
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Feedback with id=" + id
      });
    });
};


// Delete all Feedbacks from the database.
exports.deleteAll = (req, res) => {
  Feedback.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Feedbacks were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all feedbacks."
      });
    });
};


