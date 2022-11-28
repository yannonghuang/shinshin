const db = require("../models");
const Material = db.materials;
const Op = db.Sequelize.Op;
const fs = require('fs');
const path = require("path");

const MATERIAL_CATEGORIES = db.MATERIAL_CATEGORIES ;

const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: materials } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, materials, totalPages, currentPage };
};

const getPath = (filename) => {
  return path.join(`${__dirname}/../../upload`, filename);
}

// Create and Save a new Material
exports.create = (req, res) => {
  // Validate request
  if (!req.body.originalname) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a Material
  const material = {
    originalname: req.body.originalname,
    encoding: req.body.encoding,
    mimetype: req.body.mimetype,
    destination: req.body.destination,
    filename: req.body.filename,
    path: req.body.path,
  };

  // Save Material in the database
  Material.create(material)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Material."
      });
    });
};

// Retrieve all Materials from the database.
exports.findAll = (req, res) => {
  const { page, size, originalname } = req.query;
  var condition = originalname ? { originalname: { [Op.like]: `%${originalname}%` } } : null;

  const { limit, offset } = getPagination(page, size);

  Material.findAndCountAll({ where: condition, limit, offset })
    .then(data => {
      const material = getPagingData(data, page, limit);
      res.send(material);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving materials."
      });
    });
};

exports.findAll2 = (req, res) => {
  const originalname = req.body.originalname;
  const page = req.body.page;
  const size = req.body.size;
  const awardId = req.body.awardId;
  const docCategory = req.body.docCategory;


  //const { page, size, originalname } = req.query;
  var condition = {
        [Op.and]: [
            originalname ? { originalname: { [Op.like]: `%${originalname}%` } } : null,
            awardId ? { awardId: { [Op.eq]: `${awardId}` } } : null,
            docCategory ? { docCategory: { [Op.eq]: `${docCategory}` } } : null
        ]};

  const { limit, offset } = getPagination(page, size);

  Material.findAndCountAll({
   where: condition,
   limit: limit,
   offset: offset,
   attributes: ['id', 'originalname', 'docCategory', 'awardId', 'mimetype',
               'createdAt', //[db.Sequelize.fn('date_format', db.Sequelize.col("createdAt"), '%Y-%m-%d'), "createdAt"],

   ],

   })
    .then(data => {
      const material = getPagingData(data, page, limit);
      res.send(material);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving materials."
      });
    });
};

// find all published Material,
exports.findAllPublished = (req, res) => {
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);

  Material.findAndCountAll({ where: { published: true }, limit, offset })
    .then(data => {
      const material = getPagingData(data, page, limit);
      res.send(material);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving materials."
      });
    });
};


// Find a single Material with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Material.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Material with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Material with id=" + id
      });
    });
};

// Find the number of materials given the awardId
exports.count = (req, res) => {
  const awardId = req.params.id;

  var condition = awardId ? { awardId: { [Op.eq]: `${awardId}` } } : null;

  Material.count({ where: condition })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving materials."
      });
    });
};

// Find a single Material with an id return material file contents
exports.findOneContent = (req, res) => {
  const id = req.params.id;

  Material.findByPk(id)
    .then(data => {
      if (data) {
        if (fs.existsSync(data.path))
          res.sendFile(data.path);
          //res.sendFile(getPath(data.filename));
        else if (fs.existsSync(data.destination))
          res.sendFile(data.destination);
        else
          res.status(404).send({
            message: `Cannot find Material with id=${id}.`
          });
      } else {
        res.status(404).send({
          message: `Cannot find Material with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Material with id=" + id
      });
    });
};

// Update a Material by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Material.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Material was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Material with id=${id}. Maybe Material was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Material with id=" + id
      });
    });
};

// Delete an Material with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Material.findByPk(id)
    .then(data => {
      if (data) {
        fs.unlinkSync(data.path);
      }
    })
    .catch(err => {
      console.error(err);
      });

  Material.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Material was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Material with id=${id}. Maybe Material was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Material with id=" + id
      });
    });
};


// Delete all Materials from the database.
exports.deleteAll = (req, res) => {
  Material.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Materials were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all materials."
      });
    });
};

// return doc category list
exports.getCategories = (req, res) => {
  res.send(MATERIAL_CATEGORIES);
}

