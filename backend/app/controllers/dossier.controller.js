const db = require("../models");
const Dossier = db.dossiers;
const Op = db.Sequelize.Op;
const fs = require('fs');
const DOSSIER_CATEGORIES = db.DOSSIER_CATEGORIES;

const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: dossiers } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, dossiers, totalPages, currentPage };
};

// Create and Save a new Dossier
exports.create = (req, res) => {
  // Validate request
  if (!req.body.originalname) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a Dossier
  const dossier = {
    originalname: req.body.originalname,
    encoding: req.body.encoding,
    mimetype: req.body.mimetype,
    destination: req.body.destination,
    filename: req.body.destination,
    path: req.body.path,
  };

  // Save Dossier in the database
  Dossier.create(dossier)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Dossier."
      });
    });
};

// Retrieve all Dossiers from the database.
exports.findAll = (req, res) => {
  const { page, size, originalname } = req.query;
  var condition = originalname ? { originalname: { [Op.like]: `%${originalname}%` } } : null;

  const { limit, offset } = getPagination(page, size);

  Dossier.findAndCountAll({ where: condition, limit, offset })
    .then(data => {
      const dossier = getPagingData(data, page, limit);
      res.send(dossier);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving dossiers."
      });
    });
};

exports.findAll2 = (req, res) => {
  const originalname = req.body.originalname;
  const page = req.body.page;
  const size = req.body.size;
  const projectId = req.body.projectId;
  const docCategory = req.body.docCategory;


  //const { page, size, originalname } = req.query;
  var condition = {
        [Op.and]: [
            originalname ? { originalname: { [Op.like]: `%${originalname}%` } } : null,
            projectId ? { projectId: { [Op.eq]: `${projectId}` } } : null,
            docCategory ? { docCategory: { [Op.eq]: `${docCategory}` } } : null
        ]};

  const { limit, offset } = getPagination(page, size);

  Dossier.findAndCountAll({
   where: condition,
   limit: limit,
   offset: offset,
   attributes: ['id', 'originalname', 'docCategory', 'projectId', 'mimetype',
               'createdAt', //[db.Sequelize.fn('date_format', db.Sequelize.col("createdAt"), '%Y-%m-%d'), "createdAt"],

   ],

   })
    .then(data => {
      const dossier = getPagingData(data, page, limit);
      res.send(dossier);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving dossiers."
      });
    });
};

// find all published Dossier,
exports.findAllPublished = (req, res) => {
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);

  Dossier.findAndCountAll({ where: { published: true }, limit, offset })
    .then(data => {
      const dossier = getPagingData(data, page, limit);
      res.send(dossier);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving dossiers."
      });
    });
};


// Find a single Dossier with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Dossier.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Dossier with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Dossier with id=" + id
      });
    });
};

// Find the number of dossiers given the projectId
exports.count = (req, res) => {
  const projectId = req.params.id;

  var condition = projectId ? { projectId: { [Op.eq]: `${projectId}` } } : null;

  Dossier.count({ where: condition })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving dossiers."
      });
    });
};

// Find a single Dossier with an id return dossier file contents
exports.findOneContent = (req, res) => {
  const id = req.params.id;

  Dossier.findByPk(id)
    .then(data => {
      if (data) {
        res.sendFile(data.path);
      } else {
        res.status(404).send({
          message: `Cannot find Dossier with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Dossier with id=" + id
      });
    });
};

// Update a Dossier by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Dossier.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Dossier was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Dossier with id=${id}. Maybe Dossier was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Dossier with id=" + id
      });
    });
};

// Delete an Dossier with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Dossier.findByPk(id)
    .then(data => {
      if (data) {
        fs.unlinkSync(data.path);
      }
    })
    .catch(err => {
      console.error(err);
      });

  Dossier.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Dossier was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Dossier with id=${id}. Maybe Dossier was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Dossier with id=" + id
      });
    });
};


// Delete all Dossiers from the database.
exports.deleteAll = (req, res) => {
  Dossier.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Dossiers were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all dossiers."
      });
    });
};

// return doc category list
exports.getCategories = (req, res) => {
  res.send(DOSSIER_CATEGORIES);
}

