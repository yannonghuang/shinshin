const db = require("../models");
const Project = db.projects;
const Response = db.responses;
const Designation = db.designations;
const Dossier = db.dossiers;
const Op = db.Sequelize.Op;
const REGIONS = db.REGIONS;
const School = db.schools;
const PROJECT_STATUSES = db.PROJECT_STATUSES;
const PROJECT_CATEGORIES = db.PROJECT_CATEGORIES;

const { authJwt } = require("../middleware");

const getPagination = (page, size) => {
  const limit = size ? +size : 30;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const getPagingData = (count, data, page, limit, schoolProjectsCount) => {
  //const { count: totalItems, rows: projects } = data;
  const projects = data;
  const totalItems = count;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, projects, totalPages, currentPage, schoolProjectsCount };
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

  const schoolId = req.body.schoolId;
  const xr = req.body.xr;
  // Create a Project
  const project = {
    name: req.body.name,
    budget: req.body.budget,
    status: req.body.status,
    schoolId: schoolId,
    description: req.body.description,
    startAt: req.body.startAt,
    xr: xr,
    pCategoryId: req.body.pCategoryId,
  };

  // Save Project in the database
  Project.create(project)
    .then(async (data) => {
      if (xr)
        await School.update({xr: 1}, {where: { id: schoolId }});

      console.log(data);

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
  const region = req.body.region;
  const pCategoryId = req.body.pCategoryId;
  const formId = req.body.formId;
  const designated = req.body.designated;

  const xr = req.body.xr;

/**
  var orderbyObject = null;
  if (orderby) {
    orderbyObject = [];
    for (var i = 0; i < orderby.length; i++) {
      var s = orderby[i].id.split(".");
      if (s.length == 1) orderbyObject.push([s[0], (orderby[i].desc ? "desc" : "asc")]);
      if (s.length == 2) {
        var m = Project;
        if (s[0] == 'project') m = Project;
        orderbyObject.push([m, s[1], (orderby[i].desc ? "desc" : "asc")]);
      }
    }
  }
*/

  var orderbyObject = null;
  if (orderby) {
    orderbyObject = [];
    for (var i = 0; i < orderby.length; i++) {
      if (orderby[i].id == 'designationsCount')
        orderbyObject.push([db.Sequelize.fn("COUNT", db.Sequelize.col("designations.id")),
          (orderby[i].desc ? "desc" : "asc")]);
      else {
        if (orderby[i].id.startsWith('school.')) {
          orderbyObject.push([School, orderby[i].id.substring(orderby[i].id.indexOf('.') + 1),
            (orderby[i].desc ? "desc" : "asc")]);
        } else
          orderbyObject.push([orderby[i].id, (orderby[i].desc ? "desc" : "asc")]);
      }
    }
  };

  var condition = {
        [Op.and]: [
            name ? { name: { [Op.like]: `%${name}%` } } : null,
            schoolId ? { schoolId: { [Op.eq]: `${schoolId}` } } : null,
            (pCategoryId || pCategoryId === 0) ? { pCategoryId: { [Op.eq]: `${pCategoryId}` } } : null,
            code ? { '$school.code$': { [Op.eq]: `${code}` } } : null,
            //region ? { '$school.region$': { [Op.like]: `%${region}%` } } : null,
            region ? { '$school.region$': { [Op.eq]: `${region}` } } : null,
            startAt ? { "": { [Op.eq]: db.Sequelize.where(db.Sequelize.fn('YEAR', db.Sequelize.col('projects.startAt')), `${startAt}`) } } : null,
            xr /*=== undefined
              ? null
              : xr === 'true'*/
                ? { xr: { [Op.eq]: `1` }}
                : {[Op.or] : [{ xr: null }, { xr: { [Op.eq]: `0` }}]},
            (formId === undefined || formId === 'undefined')
              ? null
              : formId === 'null'
                ? { '$response.formId$': null }
                : { '$response.formId$': { [Op.eq]: `${formId}` } }
        ]};


  var group = ['id'];

  var having = (designated === undefined || designated === 'undefined')
    ? null
    : designated === 'true'
      ? db.Sequelize.literal(`count(designations.id) > 0`)
      : db.Sequelize.literal(`count(designations.id) = 0`);

  var _include_designations = designated === undefined
    ? []
    : [{
        model: Designation,
        attributes: ['id', 'pCategoryId',
          [db.Sequelize.fn("year", db.Sequelize.col("designations.startAt")), "startAt"]
          //'startAt'
        ],
        required: (designated === 'true') ? true : false,
      }];

  var include_designations = [{
        model: Designation,
        attributes: [],
        required: false,
      }];

  var include = [
                    {
                      model: School,
                      attributes: ['id', 'studentsCount', 'teachersCount', 'category', 'name', 'code', 'region', 'address'],
                      required: false,
                    },
                    {
                      model: Response,
                      attributes: ['id', 'title', 'formId'],
                      required: false,
                    },
                ];

  include = [...include, ...include_designations];

  const { limit, offset } = getPagination(page, size);
  let limits = {};
  if (!exportFlag) {
    limits = {
      offset: offset,
      limit: limit
    }
  }

  var attributes = ['id', 'name', 'budget', 'description',
    'pCategoryId',

    exportFlag
    ? [db.Sequelize.fn("year", db.Sequelize.col("projects.startAt")), "startAt"]
    : 'startAt',

    [db.Sequelize.fn("COUNT", db.Sequelize.col("designations.id")), "designationsCount"]
  ];
  if (!xr)
    attributes.push('status');

  Project.findAll({
  where: condition,
  ...limits,
//  limit: limit,
//  offset: offset,
  subQuery: false,

  attributes: attributes,
/**
  attributes: ['id', 'name', 'budget', 'status', 'description', //'schoolId', 'responseId'
            "startAt", //[db.Sequelize.fn("year", db.Sequelize.col("projects.startAt")), "startAt"],
  //          [db.Sequelize.fn("COUNT", db.Sequelize.col("responses.id")), "responsesCount"],
  ],
*/
  include: include,

  group: group,
  order: orderbyObject,
// order: orderby
// order: [[Response, 'title', 'desc']]
  having: having
  })
    .then(data => {
        Project.count({where: condition, include: include, group: group, having: having, distinct: true, col: 'id'})
          .then(count => {
            const response = getPagingData((count instanceof Array) ? count.length : count, data, page, limit);
            //const response = getPagingData(count, data, page, limit);
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

exports.findAllByCategories = async (req, res) => {
  const pCategoryId = req.body.pCategoryId;
  const page = req.body.page;
  const size = req.body.size;
  const name = req.body.name;
  const startAt = req.body.startAt;
  const exportFlag = req.body.exportFlag;
  const applied = req.body.applied;
  const canonical = req.body.canonical;
  const orderby = req.body.orderby;

  var condition = {
        [Op.and]: [
            name ? { name: { [Op.like]: `%${name}%` } } : null,
            startAt ? { "": { [Op.eq]: db.Sequelize.where(db.Sequelize.fn('YEAR', db.Sequelize.col('projects.startAt')), `${startAt}`) } } : null,
            (pCategoryId || pCategoryId === 0) ? { pCategoryId: { [Op.eq]: `${pCategoryId}` } } : null,
            {[Op.or] : [{ xr: null }, { xr: { [Op.eq]: `0` }}]},
            applied === undefined
              ? null
              : applied === 'true'
                ? {[Op.not] : [{'$response.formId$': null}]}
                : {[Op.or] : [{ responseId: null }, {'$response.formId$': null}]},
        ]};

  const { limit, offset } = getPagination(page, size);

  var include = [
                    {
                      model: Response,
                      attributes: ['id', 'title', 'formId'],
                      required: false,
                    },
                ];

  try {
    let data = await db.sequelize.query(
      `SELECT projects.pCategoryId, projects.name, year(projects.startAt) AS startAt ` +
        (canonical ? `` : `, response.formId AS formId`) +
        `, COUNT(*) AS count ` +
      `FROM projects AS projects LEFT OUTER JOIN responses AS response ON projects.responseId = response.id ` +
      `WHERE (projects.xr IS NULL OR projects.xr = 0) ` +
        ((pCategoryId || pCategoryId === 0) ? `AND (projects.pCategoryId = ${pCategoryId}) ` : ``) +
        (name ? `AND (projects.name like '%${name}%') ` : ``) +
        (startAt ? `AND (YEAR(projects.startAt) = ${startAt}) ` : ``) +
        ((applied === undefined) ? `` : ((applied === 'true') ? `AND (response.formId is not null) ` : `AND (response.formId is null) `)) +
      `GROUP BY projects.pCategoryId, year(projects.startAt), projects.name ` +
        (canonical ? `` : `, response.formId `) +
      (
        orderby[0].id === 'startAt'
        ? `ORDER BY year(projects.startAt) ` + (orderby[0].desc ? `desc` : `asc`) + `, projects.pCategoryId, projects.name `
        :
          orderby[0].id === 'pCategoryId'
          ? `ORDER BY projects.pCategoryId ` + (orderby[0].desc ? `desc` : `asc`) + `, year(projects.startAt) desc, projects.name `
          :
            orderby[0].id === 'name'
            ? `ORDER BY projects.name ` + (orderby[0].desc ? `desc` : `asc`) + `, year(projects.startAt) desc, projects.pCategoryId `
            : `ORDER BY year(projects.startAt) desc, projects.pCategoryId, projects.name `
      )
      +
      (canonical ? `` : `, response.formId `) +
      (!exportFlag ? `LIMIT ${offset}, ${limit} ` : ``), {
         nest: true,
         type: db.QueryTypes.SELECT
      }
    );

    let countTest = await Project.count({
      where: condition,
      include: include,
      distinct: true,
      group: db.Sequelize.literal(`projects.pCategoryId, year(projects.startAt), projects.name ` +
        (canonical ? `` : `, response.formId`)),
    });

    let count = 0;
    let schoolProjectsCount = 0;
    if (countTest instanceof Array) {
      count = countTest.length;
      for (var i = 0; i < countTest.length; i++)
        schoolProjectsCount += countTest[i].count;
    } else {
      count = countTest;
      schoolProjectsCount = countTest;
    }

    const response = getPagingData(count, data, page, limit, schoolProjectsCount);

    res.send(response);
  } catch(err) {
    console.log(err);
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving responses."
    });
  }
};

/**
exports.findAllByCategories = async (req, res) => {
  const pCategoryId = req.body.pCategoryId;
  const page = req.body.page;
  const size = req.body.size;

  var condition = {
        [Op.and]: [
            pCategoryId ? { pCategoryId: { [Op.eq]: `${pCategoryId}` } } : null,
        ]};

  const { limit, offset } = getPagination(page, size);

  var attributes = ['pCategoryId', 'name',
    [db.Sequelize.fn("year", db.Sequelize.col("projects.startAt")), "startAt"],
    [db.Sequelize.fn("COUNT", db.Sequelize.col("*")), "count"]
  ];

  try {
    let data = await Project.findAll({
      where: condition,
      limit: limit,
      offset: offset,
      attributes: attributes,

      group: ['pCategoryId', 'startAt', 'name'],
      order: ['pCategoryId', 'startAt', 'name']
    });

    let countTest = await Project.count({
      where: condition,
      group: ['pCategoryId', 'startAt', 'name'],
      order: ['pCategoryId', 'startAt', 'name']
    });

    let count = (countTest instanceof Array) ? countTest.length : countTest;

    const response = getPagingData(count, data, page, limit);

    res.send(response);
  } catch(err) {
    console.log(err);
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving responses."
    });
  }
};
*/

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
                    'pCategoryId',
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
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    let p = await Project.findByPk(id);
    let schoolId = p.schoolId;

    let num = await Project.destroy({
      where: { id: id }
    });

    if (num == 1) {
      const c = await Project.count({where:
        {[Op.and]: [
            { xr: { [Op.eq]: `1` }},
            { schoolId: schoolId }
          ]
        }
      });

      if (c == 0)
        await School.update({xr: 0}, {where: { id: schoolId }});

      res.send({
        message: "Project was deleted successfully!"
      });
    } else {
      res.send({
        message: `Cannot delete Project with id=${id}. Maybe Project was not found!`
      });
    }

  } catch (err) {
    res.status(500).send({
      message: "Could not delete Project with id=" + id
    });
  };
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

// return project status list
exports.getProjectCategories = (req, res) => {
  res.send(PROJECT_CATEGORIES);
}

