const db = require("../models");
const Comment = db.comments;
const Op = db.Sequelize.Op;
const User = db.user;

const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: comments } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, comments, totalPages, currentPage };
};

// Create and Save a new Comment
exports.create = (req, res) => {
  // Validate request
  if (!req.body.text) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a Comment
  const comment = {
    text: req.body.text,
    userId: req.body.userId,
    schoolId: req.body.schoolId,
  };

  // Save Comment in the database
  Comment.create(comment)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Comment."
      });
    });
};

exports.findAll2 = (req, res) => {
  const text = req.body.text;
  const userId = req.body.userId;
  const schoolId = req.body.schoolId;

  const page = req.body.page;
  const size = req.body.size;

  //const { page, size, originalname } = req.query;
  var condition = {
        [Op.and]: [
            text ? { text: { [Op.like]: `%${text}%` } } : null,
            userId ? { userId: { [Op.eq]: `${userId}` } } : null,
            schoolId ? { schoolId: { [Op.eq]: `${schoolId}` } } : null
        ]};

  const { limit, offset } = getPagination(page, size);

  Comment.findAndCountAll({
  where: condition,
  limit: limit,
  offset: offset,
  include: [
    {
      model: User,
      attributes: ['id', 'username', 'chineseName'],
      required: false,
    },
  ],
  })
    .then(data => {
      const comment = getPagingData(data, page, limit);
      res.send(comment);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving comments."
      });
    });
};


// Find a single Comment with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Comment.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Comment with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Comment with id=" + id
      });
    });
};


// Update a Comment by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Comment.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Comment was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Comment with id=${id}. Maybe Comment was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Comment with id=" + id
      });
    });
};

// Delete an Comment with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Comment.findByPk(id)
    .then(data => {
    })
    .catch(err => {
      console.error(err);
      });

  Comment.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Comment was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Comment with id=${id}. Maybe Comment was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Comment with id=" + id
      });
    });
};


// Delete all Comments from the database.
exports.deleteAll = (req, res) => {
  Comment.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Comments were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all comments."
      });
    });
};


