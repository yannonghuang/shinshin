const db = require("../models");
const Document = db.documents;
const Op = db.Sequelize.Op;
const fs = require('fs');
const path = require("path");

const DOCUMENT_CATEGORIES = db.DOCUMENT_CATEGORIES;

const getPagination = (page, size) => {
  const limit = size ? +size : 20;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: documents } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, documents, totalPages, currentPage };
};

const getPath = (filename) => {
  return path.join(`${__dirname}/../../upload`, filename);
}

// Create and Save a new Document
exports.create = (req, res) => {
  // Validate request
  if (!req.body.originalname) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a Document
  const document = {
    originalname: req.body.originalname,
    encoding: req.body.encoding,
    mimetype: req.body.mimetype,
    destination: req.body.destination,
    filename: req.body.filename,
    path: req.body.path,
  };

  // Save Document in the database
  Document.create(document)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Document."
      });
    });
};

// Retrieve all Documents from the database.
exports.findAll = (req, res) => {
  const { page, size, originalname } = req.query;
  var condition = originalname ? { originalname: { [Op.like]: `%${originalname}%` } } : null;

  const { limit, offset } = getPagination(page, size);

  Document.findAndCountAll({ where: condition, limit, offset })
    .then(data => {
      const document = getPagingData(data, page, limit);
      res.send(document);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving documents."
      });
    });
};

exports.findAll2 = (req, res) => {
  const originalname = req.body.originalname;
  const startAt = req.body.startAt;
  const page = req.body.page;
  const size = req.body.size;
  const schoolId = req.body.schoolId;
  var docCategory = req.body.docCategory;
  const orderby = req.body.orderby;
  

  //const { page, size, originalname } = req.query;
  var condition = {
        [Op.and]: [
            originalname 
              ? {[Op.or]: [{ originalname: { [Op.like]: `%${originalname}%` } }, { description: { [Op.like]: `%${originalname}%` } }]}
              //? { originalname: { [Op.like]: `%${originalname}%` } } 
              : null,
            //startAt ? { "": { [Op.eq]: db.Sequelize.where(db.Sequelize.fn('YEAR', db.Sequelize.col('startAt')), `${startAt}`) } } : null,
            startAt 
              ? {[Op.or] : [
                { "": { [Op.eq]: db.Sequelize.where(db.Sequelize.fn('YEAR', db.Sequelize.col('startAt')), `${startAt}`) } }, 
                {[Op.and] : [
                  { startAt: null }, 
                  { "": { [Op.eq]: db.Sequelize.where(db.Sequelize.fn('YEAR', db.Sequelize.col('createdAt')), `${startAt}`) } }
                ]} 
              ]} 
              : null,
            schoolId ? { schoolId: { [Op.eq]: `${schoolId}` } } : null,
            docCategory
              ? docCategory.startsWith('!')
                ? { docCategory: { [Op.ne]: `${docCategory.substring(1)}` } }
                : { docCategory: { [Op.eq]: `${docCategory}` } }
              : null
        ]};

  var orderbyObject = null;
  if (orderby) {
    orderbyObject = [];
    for (var i = 0; i < orderby.length; i++) {
      var s = orderby[i].id.split(".");
      if (s.length == 1) orderbyObject.push([s[0], (orderby[i].desc ? "desc" : "asc")]);
      if (s.length == 2) {
        var m = Document;
        orderbyObject.push([m, s[1], (orderby[i].desc ? "desc" : "asc")]);
      }
    }
  }

  const { limit, offset } = getPagination(page, size);

  Document.findAndCountAll({
  where: condition,
  limit: limit,
  offset: offset,
  attributes: ['id', 'originalname', 'docCategory', 'schoolId', 'mimetype',
              'createdAt', //[db.Sequelize.fn('date_format', db.Sequelize.col("createdAt"), '%Y-%m-%d'), "createdAt"],
              'startAt', //[db.Sequelize.fn("year", db.Sequelize.col("startAt")), "startAt"],
              'description'
  ],
  order: orderbyObject
  })
   .then(data => {
     const document = getPagingData(data, page, limit);
     res.send(document);
   })
   .catch(err => {
     res.status(500).send({
       message:
         err.message || "Some error occurred while retrieving documents."
     });
   });
};

// find all published Document,
exports.findAllPublished = (req, res) => {
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);

  Document.findAndCountAll({ where: { published: true }, limit, offset })
    .then(data => {
      const document = getPagingData(data, page, limit);
      res.send(document);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving documents."
      });
    });
};


// Find a single Document with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Document.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Document with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Document with id=" + id
      });
    });
};

// Find the number of documents given the schoolId
exports.count = (req, res) => {
  const schoolId = req.params.id;

  var condition = schoolId ? { schoolId: { [Op.eq]: `${schoolId}` } } : null;

  Document.count({ where: condition })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving documents."
      });
    });
};

// Find a single Document with an id return document file contents
exports.findOneContent = (req, res) => {
  const id = req.params.id;

  Document.findByPk(id)
    .then(data => {
      if (data) {
        if (fs.existsSync(data.path))
          res.sendFile(data.path);
          //res.sendFile(getPath(data.filename));
        else if (fs.existsSync(data.destination))
          res.sendFile(data.destination);
        else
          res.status(404).send({
            message: `Cannot find Document with id=${id}.`
          });
      } else {
        res.status(404).send({
          message: `Cannot find Document with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Document with id=" + id
      });
    });
};

// Update a Document by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Document.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Document was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Document with id=${id}. Maybe Document was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Document with id=" + id
      });
    });
};

// Delete an Document with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Document.findByPk(id)
    .then(data => {
      if (data) {
        fs.unlinkSync(data.path);
      }
    })
    .catch(err => {
      console.error(err);
      });

  Document.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Document was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Document with id=${id}. Maybe Document was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Document with id=" + id
      });
    });
};


// Delete all Documents from the database.
exports.deleteAll = (req, res) => {
  Document.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Documents were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all documents."
      });
    });
};

// return doc category list
exports.getCategories = (req, res) => {
  res.send(DOCUMENT_CATEGORIES);
}

