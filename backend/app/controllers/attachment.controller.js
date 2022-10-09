const db = require("../models");
const Attachment = db.attachments;
const Response = db.responses;
const Document = db.documents;
const School = db.schools;
const Op = db.Sequelize.Op;
const fs = require('fs');
const path = require("path");

const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: attachments } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, attachments, totalPages, currentPage };
};

const getPath = (filename) => {
  return path.join(`${__dirname}/../../upload`, filename);
}

// Create and Save a new Attachment
exports.create = (req, res) => {
  // Validate request
  if (!req.body.originalname) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a Attachment
  const attachment = {
    originalname: req.body.originalname,
    encoding: req.body.encoding,
    mimetype: req.body.mimetype,
    destination: req.body.destination,
    filename: req.body.filename,
    path: req.body.path,
  };

  // Save Attachment in the database
  Attachment.create(attachment)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Attachment."
      });
    });
};

// Retrieve all Attachments from the database.
exports.findAll = (req, res) => {
  const { page, size, originalname } = req.query;
  var condition = originalname ? { originalname: { [Op.like]: `%${originalname}%` } } : null;

  const { limit, offset } = getPagination(page, size);

  Attachment.findAndCountAll({ where: condition, limit, offset })
    .then(data => {
      const attachment = getPagingData(data, page, limit);
      res.send(attachment);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving attachments."
      });
    });
};

exports.findAll2 = (req, res) => {
  const originalname = req.body.originalname;
  const page = req.body.page;
  const size = req.body.size;
  const responseId = req.body.responseId;

  //const { page, size, originalname } = req.query;
  var condition = {
        [Op.and]: [
            originalname ? { originalname: { [Op.like]: `%${originalname}%` } } : null,
            responseId ? { responseId: { [Op.eq]: `${responseId}` } } : null
        ]};

  const { limit, offset } = getPagination(page, size);

  Attachment.findAndCountAll({ where: condition, limit, offset })
    .then(data => {
      const attachment = getPagingData(data, page, limit);
      res.send(attachment);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving attachments."
      });
    });
};

// find all published Attachment
exports.findAllPublished = (req, res) => {
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);

  Attachment.findAndCountAll({ where: { published: true }, limit, offset })
    .then(data => {
      const attachment = getPagingData(data, page, limit);
      res.send(attachment);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving attachments."
      });
    });
};

// Find a response Attachment with an id to become an attachment for the corresponding school
exports.promote = async (req, res) => {
  const id = req.params.id;

  try {
    let attachment = await Attachment.findByPk(id);
    let response = await Response.findByPk(attachment.responseId);
    let school = await School.findByPk(response.schoolId);

    let dir = path.join(`${__dirname}/../../upload`, 'School', '' + school.code);

    if (!fs.existsSync(dir)) {
	  fs.mkdirSync(dir, {recursive: true});
    }

    const originalname = req.body.originalname ? req.body.originalname : attachment.originalname;

    let filename = Date.now() + '-' + originalname;
    fs.copyFileSync(attachment.path, path.join(dir, filename));

    let document = {
      schoolId: response.schoolId,
      docCategory: '学校照片',

      originalname: originalname, //attachment.originalname,
      encoding: attachment.encoding,
      mimetype: attachment.mimetype,
      destination: dir, //path.resolve(dir), //attachment.destination,
      filename: filename, //attachment.filename,
      path: path.resolve(dir, filename) //attachment.path,
    };

    let data = await Document.create(document);

    res.send(data);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: err.message || "Error promoting Attachment with id=" + id
    });
  }
};

// Find a single Attachment with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Attachment.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Attachment with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Attachment with id=" + id
      });
    });
};

// Find the number of attachments given the responseId
exports.count = (req, res) => {
  const responseId = req.params.id;

  var condition = responseId ? { responseId: { [Op.eq]: `${responseId}` } } : null;

  Attachment.count({ where: condition })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving attachments."
      });
    });
};

// Find a single Attachment with an id return attachment file contents
exports.findOneContent = (req, res) => {
  const id = req.params.id;

  Attachment.findByPk(id)
    .then(data => {
      if (data) {
        res.sendFile(data.path);
        //res.sendFile(getPath(data.filename));
      } else {
        res.status(404).send({
          message: `Cannot find Attachment with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Attachment with id=" + id
      });
    });
};

// Update a Attachment by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Attachment.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Attachment was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Attachment with id=${id}. Maybe Attachment was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Attachment with id=" + id
      });
    });
};

// Delete an Attachment with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Attachment.findByPk(id)
    .then(data => {
      if (data) {
        fs.unlinkSync(data.path);
      }
    })
    .catch(err => {
      console.error(err);
      });

  Attachment.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Attachment was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Attachment with id=${id}. Maybe Attachment was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Attachment with id=" + id
      });
    });
};


// Delete all Attachments from the database.
exports.deleteAll = (req, res) => {
  Attachment.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Attachments were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all attachments."
      });
    });
};


