const db = require("../models");
const Project = db.projects;
const Response = db.responses;
const Dossier = db.dossiers;
const Op = db.Sequelize.Op;
const REGIONS = db.REGIONS;
const School = db.schools;
const PROJECT_STATUSES = db.PROJECT_STATUSES;

const { authJwt } = require("../middleware");

const getPagination = (page, size) => {
  const limit = size ? +size : 30;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const getPagingData = (count, data, page, limit) => {
  //const { count: totalItems, rows: projects } = data;
  const projects = data;
  const totalItems = count;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, projects, totalPages, currentPage };
};

// return region list
exports.getRegions = (req, res) => {
  res.send(REGIONS);
}

// Create and Save a new Project
exports.create = (req, res) => {
  // Validate request
  if (!req.body.name) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a Project
  const project = {
    name: req.body.name,
    budget: req.body.budget,
    status: req.body.status,
    schoolId: req.body.schoolId,
    description: req.body.description,
    startAt: req.body.startAt,
    xr: req.body.xr,
  };

  // Save Project in the database
  Project.create(project)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      console.log(err.message || "Some error occurred while creating the Project.");
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Project."
      });
    });
};

// Retrieve all Projects from the database.
exports.findAll = (req, res) => {
  const { page, size, title } = req.query;
  var condition = title ? { title: { [Op.like]: `%${title}%` } } : null;

  const { limit, offset } = getPagination(page, size);

  Project.findAndCountAll({ where: condition, limit, offset })
    .then(data => {
      const response = getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving projects."
      });
    });
};

exports.findAllSimple = (req, res) => {
  const projectId = req.params.projectId;
  var condition = projectId ? { projectId: { [Op.eq]: `${projectId}` } } : null;

  Project.findAll({
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

exports.SAVE_SQL_findAll2 = (req, res) => {
  const name = req.body.name;
  const page = req.body.page;
  const size = req.body.size;
  const orderby = req.body.orderby;
  const searchCode = req.body.searchCode;
  const searchRegion = req.body.searchRegion;
  const searchCreatedYear = req.body.searchCreatedYear;

  //var condition = name ? { name: { [Op.like]: `%${name}%` } } : null;

  var condition = {
        [Op.and]: [
            name ? { name: { [Op.like]: `%${name}%` } } : null,
            code ? { code: { [Op.like]: `%${code}%` } } : null,
            searchRegion ? { searchRegion: { [Op.eq]: `${searchRegion}` } } : null,
            searchCreatedYear ? { searchCreatedYear: { [Op.eq]: `${searchCreatedYear}` } } : null
        ]};

  const { limit, offset } = getPagination(page, size);

  const selectClause = "select id, code, name, description, principal, region, address, phone, teachersCount, studentsCount, year(startAt) as createdYear, ";
  const attributeResponsesCount = "(select count(*)  from responses where responses.projectId = projects.Id) as responsesCount, "
  const attributeDossiersCount = "(select count(*) from dossiers where dossiers.projectId = projects.Id) as dossiersCount ";
  const fromClause = "from projects ";
  const whereClause = "where name LIKE :name ";
  const limitClause = "limit :limit ";
  const offsetClause = "offset :offset ";
  const orderbyClause = orderby;

    db.sequelize.query(
        //"select id, code, name, description, principal, region, address, phone, teachersCount, studentsCount, (select count(*)  from responses where responses.projectId = projects.Id) as responsesCount, (select count(*) from dossiers where dossiers.projectId = projects.Id) as dossiersCount from projects WHERE name LIKE :name limit :limit offset :offset",
        selectClause + attributeResponsesCount + attributeDossiersCount +
        fromClause +
        whereClause +
        orderbyClause +
        limitClause +
        offsetClause,
      {
        replacements: { name: name ? '%${name}%' : '%', limit: limit, offset: offset },
        type: db.sequelize.QueryTypes.SELECT
      }
    )
    .then(data => {
      Project.count({where: condition})
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

exports.findAll2 = async (req, res) => {
  const sid = await authJwt.getSchoolId(req);

  const name = req.body.name;
  const page = req.body.page;
  const size = req.body.size;
  const orderby = req.body.orderby;
  const startAt = req.body.startAt;
  const schoolId = sid ? sid : req.body.schoolId;
  const code = req.body.code;
  const exportFlag = req.body.exportFlag;
  const region = req.body.region
    ? req.body.region.startsWith('湖南湘西')
      ? req.body.region.substring(0, 4)
      : req.body.region.substring(0, 2)
    : null;
  const xr = req.body.xr;

  var orderbyObject = null;
  if (orderby) {
    orderbyObject = [];
    for (var i = 0; i < orderby.length; i++) {
      var s = orderby[i].id.split(".");
      if (s.length == 1) orderbyObject.push([s[0], (orderby[i].desc ? "desc" : "asc")]);
      if (s.length == 2) {
        var m = Response;
        if (s[0] == 'school') m = School;
        orderbyObject.push([m, s[1], (orderby[i].desc ? "desc" : "asc")]);
      }
    }
  }

  //var condition = name ? { name: { [Op.like]: `%${name}%` } } : null;

  var condition = {
        [Op.and]: [
            name ? { name: { [Op.like]: `%${name}%` } } : null,
            schoolId ? { schoolId: { [Op.eq]: `${schoolId}` } } : null,
            code ? { '$school.code$': { [Op.eq]: `${code}` } } : null,
            region ? { '$school.region$': { [Op.like]: `%${region}%` } } : null,
            startAt ? { "": { [Op.eq]: db.Sequelize.where(db.Sequelize.fn('YEAR', db.Sequelize.col('projects.startAt')), `${startAt}`) } } : null,
            xr /*=== undefined
              ? null
              : xr === 'true'*/
                ? { xr: { [Op.eq]: `1` }}
                : { xr: null },
        ]};

  var include = [
                    {
                      model: School,
                      attributes: ['id', 'studentsCount', 'teachersCount', 'category', 'name', 'code', 'region'],
                      required: false,
                    },
                    {
                      model: Response,
                      attributes: ['id', 'title'],
                      required: false,
                    },
                ];

  const { limit, offset } = getPagination(page, size);

  let limits = {};
  if (!exportFlag) {
    limits = {
      offset: offset,
      limit: limit
    }
  }

  Project.findAll({
  where: condition,
  ...limits,
//  limit: limit,
//  offset: offset,
  subQuery: false,
  attributes: ['id', 'name', 'budget', 'status', 'description', //'schoolId', 'responseId'
            "startAt", //[db.Sequelize.fn("year", db.Sequelize.col("projects.startAt")), "startAt"],
  //          [db.Sequelize.fn("COUNT", db.Sequelize.col("responses.id")), "responsesCount"],
  ],

  include: include,

  //group: ['id'],
  order: orderbyObject
// order: orderby
// order: [[Response, 'title', 'desc']]
  })
    .then(data => {
        Project.count({where: condition, include: include, distinct: true, col: 'id'})
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
      console.log(err);
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

  Project.findAndCountAll({
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

  Project.findAndCountAll({ where: condition, limit, offset })
    .then(data => {
      const response = getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving projects."
      });
    });
};

// find all published Project
exports.findAllPublished = (req, res) => {
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);

  Project.findAndCountAll({ where: { published: true }, limit, offset })
    .then(data => {
      const response = getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving projects."
      });
    });
};

// Find a single Project photo with an id
exports.findOnePhoto = (req, res) => {
  const id = req.params.id;

  Project.findByPk(id, {
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
          message: `Cannot find Project photo with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Project photo with id=" + id
      });
    });
};

// Find a single Project with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Project.findByPk(id, {
      attributes: ['id', 'name', 'budget', 'status', 'description', 'xr',
                    [db.Sequelize.fn("year", db.Sequelize.col("projects.startAt")), "startAt"],
                  ],

      include: [
      {
      model: School,
      attributes: ['id', 'name', 'code'],
      required: false,
      },
      {
      model: Response,
      attributes: ['id', 'title'],
      required: false,
      },
  ],
      //raw: true,
    }
  )
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Project with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Project with id=" + id
      });
    });
};

// Update a Project by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Project.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Project was updated successfully."
        });
      } else {
        console.log("Cannot update Project with id=${id}. Maybe Project was not found or req.body is empty!");
        res.send({
          message: `Cannot update Project with id=${id}. Maybe Project was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      console.log(err.message || "Error updating Project with id=" + id);
      res.status(500).send({
        message: "Error updating Project with id=" + id
      });
    });
};

// Delete a project with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Project.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Project was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Project with id=${id}. Maybe Project was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Project with id=" + id
      });
    });
};


// Delete all Projects from the database.
exports.deleteAll = (req, res) => {
  Project.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Projects were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all projects."
      });
    });
};

// return project status list
exports.getStatuses = (req, res) => {
  res.send(PROJECT_STATUSES);
}

