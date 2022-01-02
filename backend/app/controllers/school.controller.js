const db = require("../models");
const School = db.schools;
const Log = db.logs;
const Response = db.responses;
const Project = db.projects;
const Document = db.documents;
const Op = db.Sequelize.Op;
const REGIONS = db.REGIONS;
const SCHOOL_STAGES = db.SCHOOL_STAGES;
const SCHOOL_STATUSES = db.SCHOOL_STATUSES;
const SCHOOL_REQUESTS = db.SCHOOL_REQUESTS;
const SCHOOL_CATEGORIES = db.SCHOOL_CATEGORIES;

const getPagination = (page, size) => {
  const limit = size ? +size : 5;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const getPagingData = (count, data, page, limit) => {
  //const { count: totalItems, rows: schools } = data;
  const schools = data;
  const totalItems = count;
  const currentPage = page ? + page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, schools, totalPages, currentPage };
};

const updateAndLog = async (newObj, oldObj, schoolId, userId, t) => {
  var updates = [];
  Object.keys(newObj).forEach(key => {
    var newv = null;
    if (newObj[key]) newv = JSON.stringify(newObj[key]).trim();
    var oldv = null;
    if (oldObj && oldObj[key]) oldv = JSON.stringify(oldObj[key]).trim();
    if (newv &&
        (!oldObj || !oldObj[key] || (oldv != newv)) &&
        !(key == 'startAt' && oldv && oldv.substring(0, 4) == newv.substring(0, 4)) // ugly, but for datetype handling
        ) {
      updates.push({field: key, oldv: oldv, newv: newv, schoolId, userId});
      if (oldObj) oldObj.set(key, newObj[key]);
    }
  });

  try {
    //const t = await db.sequelize.transaction();
    if (oldObj) await oldObj.save({ transaction: t });
    await Log.bulkCreate(updates, { transaction: t });
    await t.commit();
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// return region list
exports.getRegions = (req, res) => {
  res.send(REGIONS);
}

// return School stages
exports.getSchoolStages = (req, res) => {
  res.send(SCHOOL_STAGES);
}

// return School statuses
exports.getSchoolStatuses = (req, res) => {
  res.send(SCHOOL_STATUSES);
}

// return School request statuses
exports.getSchoolRequests = (req, res) => {
  res.send(SCHOOL_REQUESTS);
}

// return School categories
exports.getSchoolCategories = (req, res) => {
  res.send(SCHOOL_CATEGORIES);
}

// Create and Save a new School
exports.create = (req, res) => {
  // Validate request
  if (!req.body.name) {
    res.status(400).send({
      message: "学校名称必须填写!"
    });
    return;
  }

  // Create a School
  const school = {
    name: req.body.name,
    code: req.body.code,
    description: req.body.description,
    principal: req.body.principal,
    photo: req.body.photo,
    region: req.body.region,
    address: req.body.address,
    phone: req.body.phone,
    studentsCount: req.body.studentsCount,
    teachersCount: req.body.teachersCount,
    startAt: req.body.startAt,

    stage: req.body.stage,
    status: req.body.status,
    request: req.body.request,
    category: req.body.category,
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
    attributes: ['id', 'name', 'code', 'region'],
    order: [ ['code', 'asc'], ['name', 'asc'], ['region', 'asc'] ]
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
  const attributeResponsesCount = "(select count(*)  from responses where responses.schoolId = schools.Id) as responsesCount, "
  const attributeDocumentsCount = "(select count(*) from documents where documents.schoolId = schools.Id) as documentsCount ";
  const fromClause = "from schools ";
  const whereClause = "where name LIKE :name ";
  const limitClause = "limit :limit ";
  const offsetClause = "offset :offset ";
  const orderbyClause = orderby;

    db.sequelize.query(
        //"select id, code, name, description, principal, region, address, phone, teachersCount, studentsCount, (select count(*)  from responses where responses.schoolId = schools.Id) as responsesCount, (select count(*) from documents where documents.schoolId = schools.Id) as documentsCount from schools WHERE name LIKE :name limit :limit offset :offset",
        selectClause + attributeResponsesCount + attributeDocumentsCount +
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
      School.count({where: condition})
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

exports.findAll2 = (req, res) => {
  const name = req.body.name;
  const page = req.body.page;
  const size = req.body.size;
  const orderby = req.body.orderby;
  const code = req.body.code;
  const region = req.body.region;
  const startAt = req.body.startAt;
  const exportFlag = req.body.exportFlag;
  //var condition = name ? { name: { [Op.like]: `%${name}%` } } : null;

  var orderbyObject = null;
  if (orderby) {
    orderbyObject = [];
    for (var i = 0; i < orderby.length; i++) {
      if (orderby[i].id == "projectsCount")
        orderbyObject.push([db.Sequelize.fn("COUNT", db.Sequelize.col("projects.id")),
          (orderby[i].desc ? "desc" : "asc")]);
      else if (orderby[i].id == "responsesCount")
        orderbyObject.push([db.Sequelize.fn("COUNT", db.Sequelize.col("projects.responseId")),
          (orderby[i].desc ? "desc" : "asc")]);
      else orderbyObject.push([orderby[i].id, (orderby[i].desc ? "desc" : "asc")]);
    }
  };

  const condition = {
        [Op.and]: [
            name ? { name: { [Op.like]: `%${name}%` } } : null,
            code ? { code: { [Op.like]: `%${code}%` } } : null,
            region ? { region: { [Op.eq]: `${region}` } } : null,
            startAt ? { "": { [Op.eq]: db.Sequelize.where(db.Sequelize.fn('YEAR', db.Sequelize.col('schools.startAt')), `${startAt}`) } } : null
        ]};

  const inner_include = [
        {
           model: Response,
           attributes: [],
           required: false,
        },
      ];

  const include = [
        {
           model: Project,
           attributes: [],
           required: false,
           //include: inner_include,
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

  School.findAll({
  where: condition,
  ...limits,
//  limit: limit,
//  offset: offset,
  subQuery: false,
  attributes: ['id', 'code', 'name', 'description', 'principal', 'region', 'address', 'phone', 'teachersCount', 'studentsCount',
            'stage', 'status', 'request', 'category',
            [db.Sequelize.fn("year", db.Sequelize.col("schools.startAt")), "startAt"],
            [db.Sequelize.fn("COUNT", db.Sequelize.col("projects.id")), "projectsCount"],
            [db.Sequelize.fn("COUNT", db.Sequelize.col("projects.responseId")), "responsesCount"], //`projects->response`.`id`
  ],

  include: include,
  group: ['id'],
  order: orderbyObject
  })
    .then(data => {
        School.count({where: condition})
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

exports.findCountsByRegion = (req, res) => {
  const page = req.body.page;
  const size = req.body.size;
  //const region = req.body.region;

  //const { page, size, title } = req.query;
  //var condition = region ? { region: { [Op.eq]: `${region}` } } : null;

  const { limit, offset } = getPagination(page, size);

  School.findAndCountAll({
  //where: condition,
  limit: limit,
  offset: offset,
  //subQuery: false,
  attributes: ['region',
      [db.Sequelize.fn("COUNT", db.Sequelize.col("id")), "schoolsCount"]
  ],

  group: ['region']
  })
    .then(data => {
      const { count: totalItems, rows: regions } = data;
      const response = getPagingData(totalItems, regions, page, limit);
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
                         'code',
                         'description',
                         'principal',
                         'region',
                         'address',
                         'phone',
                         'studentsCount',
                         'teachersCount',
                         'stage',
                         'status',
                         'request',
                         'category',
                          //[db.Sequelize.fn('date_format', db.Sequelize.col("startAt"), '%Y-%m-%d'), "startAt"],
                          [db.Sequelize.fn("year", db.Sequelize.col("schools.startAt")), "startAt"],
                   ],
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
exports.SAVE_update = (req, res) => {
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

// Update a School by the id in the request
exports.update = async (req, res) => {
  const schoolId = req.params.id;
  const userId = req.userId;
  const newObj = req.body;

  try {
    const t = await db.sequelize.transaction();
    let oldObj = await School.findByPk(schoolId, {transaction: t});
    if (oldObj) {
      await updateAndLog(newObj, oldObj, schoolId, userId, t);
      res.send({
        message: "School was updated successfully."
      });
    } else {
      console.log("Cannot update School with id=${schoolId}. Maybe School was not found or req.body is empty!");
      res.send({
        message: "Cannot update School with id=" + schoolId + ". Maybe School was not found or req.body is empty!"
      });
    }
  } catch(err) {
    console.log(err.message || "Error updating School with id=" + schoolId);
    res.status(500).send({
      message: err.message || "Error updating School with id=" + schoolId
    });
  }
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
