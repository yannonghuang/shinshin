const db = require("../models");
const Dossier = db.dossiers;
const Project = db.projects;
const Document = db.documents;
const School = db.schools;
const Op = db.Sequelize.Op;
const fs = require('fs');
const path = require("path");

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

const getPath = (filename) => {
  return path.join(`${__dirname}/../../upload`, filename);
}

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
    filename: req.body.filename,
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

// Find a project dossier with an id to become a document for the corresponding school
exports.promote = async (req, res) => {
  const acceptedImageTypes = ['image/gif', 'image/jpeg', 'image/png'];  

  const id = req.params.id;

  try {
    let dossier = await Dossier.findByPk(id);
    let project = await Project.findByPk(dossier.projectId);
    let school = await School.findByPk(project.schoolId);

    let dir = path.join(`${__dirname}/../../upload`, 'School', '' + school.code);

    if (!fs.existsSync(dir)) {
	  fs.mkdirSync(dir, {recursive: true});
    }

    const originalname = req.body.originalname ? req.body.originalname : dossier.originalname;

    let filename = Date.now() + '-' + originalname;
    fs.copyFileSync(dossier.path, path.join(dir, filename));

    let document = {
      schoolId: project.schoolId,
      docCategory: acceptedImageTypes.includes(dossier.mimetype) 
        ? '学校照片'
        : '项目文档',

      originalname: originalname, //dossier.originalname,
      encoding: dossier.encoding,
      mimetype: dossier.mimetype,
      destination: dir, //path.resolve(dir), //dossier.destination,
      filename: filename, //dossier.filename,
      path: path.resolve(dir, filename) //dossier.path,
    };

    let data = await Document.create(document);

    res.send(data);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: err.message || "Error promoting Dossier with id=" + id
    });
  }
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
        if (fs.existsSync(data.path))
          res.sendFile(data.path);
          //res.sendFile(getPath(data.filename));
        else if (fs.existsSync(data.destination))
          res.sendFile(data.destination);
        else
          res.status(404).send({
            message: `Cannot find Dossier with id=${id}.`
          });
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

