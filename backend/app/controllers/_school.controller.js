const db = require("../models");
const School = db.schools;
const Response = db.responses;
const Document = db.documents;
const Op = db.Sequelize.Op;
const REGIONS = db.REGIONS;

const getPagination = (page, size) => {
  const limit = size ? +size : 5;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const getPagingData = (count, data, page, limit) => {
  //const { count: totalItems, rows: schools } = data;
  const schools = data;
  const totalItems = count;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, schools, totalPages, currentPage };
};

// return region list
exports.getRegions = (req, res) => {
  res.send(REGIONS);
}

// Create and Save a new School
exports.create = (req, res) => {
  // Validate request
  if (!req.body.name) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a School
  const school = {
    name: req.body.name,
    description: req.body.description,
    principal: req.body.principal,
    photo: req.body.photo,
    region: req.body.region,
    address: req.body.address,
    phone: req.body.phone,
    studentsCount: req.body.studentsCount,
    teachersCount: req.body.teachersCount,
  };

  // Save School in the database
  School.create(school)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      console.log(err.message || "Some error occurred while creating the School.");
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the School."
      });
    });
};

// Retrieve all Schools from the database.
exports.findAll = (req, res) => {
  const { page, size, title } = req.query;
  var condition = title ? { title: { [Op.like]: `%${title}%` } } : null;

  const { limit, offset } = getPagination(page, size);

  School.findAndCountAll({ where: condition, limit, offset })
    .then(data => {
      const response = getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving schools."
      });
    });
};

exports.findAllSimple = (req, res) => {
  const schoolId = req.params.schoolId;
  var condition = schoolId ? { schoolId: { [Op.eq]: `${schoolId}` } } : null;

  School.findAll({
    attributes: ['id', 'name', 'region']
  })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving responses."
        });
      });
}

exports.findAll2 = (req, res) => {
  const name = req.body.name;
  const page = req.body.page;
  const size = req.body.size;

  //const { page, size, title } = req.query;
  var condition = name ? { name: { [Op.like]: `%${name}%` } } : null;

  const { limit, offset } = getPagination(page, size);

  School.findAll({
  where: condition,
  limit: limit,
  offset: offset,
  subQuery: false,
  attributes: ['id', 'name', 'description', 'principal', 'region', 'address', 'phone', 'teachersCount', 'studentsCount',
             [db.Sequelize.fn("COUNT", db.Sequelize.col("responses.id")), "responsesCount"],
             //[db.Sequelize.fn("COUNT", db.Sequelize.col("documents.id")), "documentsCount"],


  ],

  include: [
  {
      model: Response,
      attributes: [],
      required: false,
  },
    /**
  {
      model: Document,
      attributes: [],
      required: false,
  },
    */
  ],

  group: ['id']

  })
    .then(data => {

      data.findAll()
      .then(data2 => {
        School.count({where: condition})
          .then(count => {
            const response = getPagingData(count, data2, page, limit);
            res.send(response);
          })
          .catch(e => {
            res.status(500).send({
              message:
              e.message || "Some error occurred while retrieving responses."
            });
          });
      })
      .catch(e2 =>{})


    })
    .catch(err => {
      res.status(500).send({
        message:
        err.message || "Some error occurred while retrieving responses."
      });
    });
};

exports.SAVE_SAVE_findAll2 = (req, res) => {
  const name = req.body.name;
  const page = req.body.page;
  const size = req.body.size;

  //const { page, size, title } = req.query;
  var condition = name ? { name: { [Op.like]: `%${name}%` } } : null;

  const { limit, offset } = getPagination(page, size);

  School.findAndCountAll({
  where: condition,
  limit: limit,
  offset: offset,
  subQuery: false,
  attributes: ['id', 'name', 'description', 'principal', 'region', 'address', 'phone', 'teachersCount', 'studentsCount',
      [db.Sequelize.fn("COUNT", db.Sequelize.col("responses.id")), "responsesCount"]
  ],
  include: [{
      model: Response,
      attributes: [],
      required: false,
  }],
  group: ['id']
  })
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

  School.findAndCountAll({ where: condition, limit, offset })
    .then(data => {
      const response = getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving schools."
      });
    });
};

// find all published School
exports.findAllPublished = (req, res) => {
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);

  School.findAndCountAll({ where: { published: true }, limit, offset })
    .then(data => {
      const response = getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving schools."
      });
    });
};

// Find a single School photo with an id
exports.findOnePhoto = (req, res) => {
  const id = req.params.id;

  School.findByPk(id, {
      attributes: ['photo'],
      raw: true,
    }
  )
    .then(photo => {
      if (photo) {
        //res.send(photo);
        res.json({ success: true, data: photo });
      } else {
        res.status(404).send({
          message: `Cannot find School photo with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving School photo with id=" + id
      });
    });
};

// Find a single School with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  School.findByPk(id, {
      attributes: ['id', 'name',
                         'description',
                         'principal',
                         'region',
                         'address',
                         'phone',
                         'studentsCount',
                         'teachersCount',],
      raw: true,
    }
  )
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find School with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving School with id=" + id
      });
    });
};

// Update a School by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  School.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "School was updated successfully."
        });
      } else {
        console.log("Cannot update School with id=${id}. Maybe School was not found or req.body is empty!");
        res.send({
          message: `Cannot update School with id=${id}. Maybe School was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      console.log(err.message || "Error updating School with id=" + id);
      res.status(500).send({
        message: "Error updating School with id=" + id
      });
    });
};

// Delete a school with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  School.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "School was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete School with id=${id}. Maybe School was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete School with id=" + id
      });
    });
};


// Delete all Schools from the database.
exports.deleteAll = (req, res) => {
  School.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Schools were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all schools."
      });
    });
};


