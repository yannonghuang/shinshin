const db = require("../models");
const User = db.user;
const School = db.schools;
const Log = db.logs;
const Survey = db.surveys;
const Response = db.responses;
const Project = db.projects;
const Document = db.documents;
const Op = db.Sequelize.Op;
const REGIONS = db.REGIONS;
const SCHOOL_STAGES = db.SCHOOL_STAGES;
const SCHOOL_STATUSES = db.SCHOOL_STATUSES;
const SCHOOL_STATUSES_SS = db.SCHOOL_STATUSES_SS;
const SCHOOL_REQUESTS = db.SCHOOL_REQUESTS;
const SCHOOL_REQUESTS_SS = db.SCHOOL_REQUESTS_SS;
const SCHOOL_CATEGORIES = db.SCHOOL_CATEGORIES;

const { authJwt } = require("../middleware");
const fs = require('fs');

const getPagination = (page, size) => {
  const limit = size ? +size : 30;
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
    var newv = newObj[key];
    var oldv = oldObj ? oldObj[key] : null;

    if ((key === 'startAt' || key === 'lastVisit') && newv && oldv) {
      newv = JSON.stringify(newv).substring(1, 5);
      oldv = JSON.stringify(oldv).substring(1, 5);
    }

    //if (newv && (!oldObj || !oldObj[key] || (oldv != newv))) {
    if ((key !== 'createdAt' && key !== 'updatedAt') &&
        getAttributes(School).includes(key) &&
        (newv && newv !== undefined) &&
        (!oldObj || !oldObj[key] || (oldv != newv))) {
      if ((key !== 'contactId' && key !== 'principalId'))
        updates.push({field: key, oldv: oldv, newv: newv, schoolId, userId});
      if (oldObj) oldObj.set(key, newObj[key]);
    }
  });

  try {
    if (oldObj) await oldObj.save({ transaction: t });
    await Log.bulkCreate(updates, { transaction: t });
    await t.commit();
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const joinArray = (arr1, arr2) => {
  result = [];
  for (var i = 0; i < arr1.length; i++) {
    if (arr2.includes(arr1[i]))
      result.push(arr1[i]);
  }
  return result;
}

const diffArray = (arr1, arr2) => {
  result = [];
  for (var i = 0; i < arr1.length; i++) {
    if (!arr2.includes(arr1[i]))
      result.push(arr1[i]);
  }
  return result;
}

const getAttributes = (model) => {
  result = [];
  for( let key in model.rawAttributes ) result.push(key);
  return result;
}

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

exports.getSchoolStatuses_ss = (req, res) => {
  res.send(SCHOOL_STATUSES_SS);
}

// return School request statuses
exports.getSchoolRequests = (req, res) => {
  res.send(SCHOOL_REQUESTS);
}

exports.getSchoolRequests_ss = (req, res) => {
  res.send(SCHOOL_REQUESTS_SS);
}

// return School categories
exports.getSchoolCategories = (req, res) => {
  res.send(SCHOOL_CATEGORIES);
}

// Create and Save a new School
exports.create = (req, res) => {
  // Validate request
  if (!req.body.code) {
    res.status(400).send({
      message: "学校编码必须填写!"
    });
    return;
  }

  const userId = req.userId;
  const newObj = req.body;

/* Create a School
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
*/

  // Save School in the database
  School.create(newObj)
    .then(async (data) => {
      res.send(data);
      const t = await db.sequelize.transaction();
      updateAndLog(newObj, null, data.id, userId, t);
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
  const schoolId = authJwt.getSchoolId(req);

  //const schoolId = req.params.schoolId;
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


const buildFilters = async (req) => {
  const id = await authJwt.getSchoolId(req);

  const name = req.body.name;
  const page = req.body.page;
  const size = req.body.size;
  const orderby = req.body.orderby;
  const code = req.body.code;
  const donor = req.body.donor;
  //const region = req.body.region;
  const stage = req.body.stage;
  const status = req.body.status;
  const request = req.body.request;
  const startAt = req.body.startAt;
  const lastVisit = req.body.lastVisit;
  const exportFlag = req.body.exportFlag;
  const region = req.body.region;
  /**
    ? req.body.region.startsWith('湖南省湘西州')
      ? req.body.region.substring(0, 6)
      : req.body.region.substring(0, 2)
    : null;
  */
  const xr = req.body.xr;

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
      else if (orderby[i].id == "latestProjectYear")
        orderbyObject.push([db.Sequelize.fn("MAX", db.Sequelize.col("projects.startAt")),
          (orderby[i].desc ? "desc" : "asc")]);
      else orderbyObject.push([orderby[i].id, (orderby[i].desc ? "desc" : "asc")]);
    }
  };

  const condition = {
        [Op.and]: [
            id ? { id: { [Op.eq]: `${id}` } } : null,
            name ? { name: { [Op.like]: `%${name}%` } } : null,
            code ? { code: { [Op.like]: `${code}` } } : null,
            donor ? { donor: { [Op.like]: `%${donor}%` } } : null,
            region ? { region: { [Op.eq]: `${region}` } } : null,
            //region ? { region: { [Op.like]: `%${region}%` } } : null,
            stage ? { stage: { [Op.eq]: `${stage}` } } : null,
            status ? { status: { [Op.eq]: `${status}` } } : null,
            request ? { request: { [Op.eq]: `${request}` } } : null,
            startAt ? { "": { [Op.eq]: db.Sequelize.where(db.Sequelize.fn('YEAR', db.Sequelize.col('schools.startAt')), `${startAt}`) } } : null,
            lastVisit ? { "": { [Op.eq]: db.Sequelize.where(db.Sequelize.fn('YEAR', db.Sequelize.col('schools.lastVisit')), `${lastVisit}`) } } : null,
            xr === undefined
              ? null
              : xr === 'true'
                ? { xr: { [Op.eq]: `1` }}
                : {[Op.or]: [{ xr: { [Op.ne]: `1` }}, { xr: null }]},
        ]};

  return {condition, orderbyObject}
}


exports.findAll2 = async (req, res) => {
  const {condition, orderbyObject} = await buildFilters(req);

  const page = req.body.page;
  const size = req.body.size;
  const exportFlag = req.body.exportFlag;

/**
  const id = await authJwt.getSchoolId(req);

  const name = req.body.name;
  const orderby = req.body.orderby;
  const code = req.body.code;
  const donor = req.body.donor;
  //const region = req.body.region;
  const stage = req.body.stage;
  const status = req.body.status;
  const request = req.body.request;
  const startAt = req.body.startAt;
  const lastVisit = req.body.lastVisit;
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
            id ? { id: { [Op.eq]: `${id}` } } : null,
            name ? { name: { [Op.like]: `%${name}%` } } : null,
            code ? { code: { [Op.like]: `${code}` } } : null,
            donor ? { donor: { [Op.like]: `%${donor}%` } } : null,
            //region ? { region: { [Op.eq]: `${region}` } } : null,
            region ? { region: { [Op.like]: `%${region}%` } } : null,
            stage ? { stage: { [Op.eq]: `${stage}` } } : null,
            status ? { status: { [Op.eq]: `${status}` } } : null,
            request ? { request: { [Op.eq]: `${request}` } } : null,
            startAt ? { "": { [Op.eq]: db.Sequelize.where(db.Sequelize.fn('YEAR', db.Sequelize.col('schools.startAt')), `${startAt}`) } } : null,
            lastVisit ? { "": { [Op.eq]: db.Sequelize.where(db.Sequelize.fn('YEAR', db.Sequelize.col('schools.lastVisit')), `${lastVisit}`) } } : null,
            xr === undefined
              ? null
              : xr === 'true'
                ? { xr: { [Op.eq]: `1` }}
                : {[Op.or]: [{ xr: { [Op.ne]: `1` }}, { xr: null }]},
        ]};

*/

  const { limit, offset } = getPagination(page, size);

  let limits = {};
  if (!exportFlag) {
    limits = {
      offset: offset,
      limit: limit
    }
  }

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
           //where: { xr: null }
           where: {[Op.or] : [{ xr: null }, { xr: { [Op.eq]: `0` }}]}
           //include: inner_include,
        },
      ];

  School.findAll({
  where: condition,
  ...limits,
//  limit: limit,
//  offset: offset,
  subQuery: false,
  attributes: ['id', 'code', 'name', 'description', 'principal', 'region', 'address', 'phone', 'teachersCount', 'studentsCount',
            'stage', 'status', 'request', 'category', 'principalId', 'contactId', 'donor', 'xr',
            [db.Sequelize.fn("year", db.Sequelize.col("schools.startAt")), "startAt"],
            [db.Sequelize.fn("year", db.Sequelize.col("schools.lastVisit")), "lastVisit"],
            [db.Sequelize.fn("COUNT", db.Sequelize.col("projects.id")), "projectsCount"],
            [db.Sequelize.fn("COUNT", db.Sequelize.col("projects.responseId")), "responsesCount"], //`projects->response`.`id`
            [db.Sequelize.fn("MAX", db.Sequelize.col("projects.startAt")), "latestProjectYear"],
  ],

  include: include,
  group: ['id'],
  order: orderbyObject
  })
    .then(data => {
        School.count({where: condition})
        //School.count({where: condition, include: include, distinct: true, col: 'id'})
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

exports.findExport = async (req, res) => {
  const {condition, orderbyObject} = await buildFilters(req);

  const mainAttributes = req.body.main;
  const detailAttributes = req.body.detail;

  var schoolAttributes = getAttributes(School);
  var surveyAttributes = getAttributes(Survey);

  schoolAttributes = joinArray(schoolAttributes, mainAttributes);
  schoolAttributes = diffArray(schoolAttributes, ["startAt", "lastVisit", ...surveyAttributes]);
  surveyAttributes = joinArray(surveyAttributes, [...mainAttributes, ...detailAttributes]);
  surveyAttributes = diffArray(surveyAttributes, ["principalId", "contactId", 'principalPhone',
                                                    'principalWechat', 'contactPhone', 'contactWechat']);

  const include = [
        {
           model: Survey,
           attributes: surveyAttributes,
           required: false,
        },

        {
           model: User,
           attributes: [['chineseName', 'principalId'], ['phone', 'principalPhone'], ['wechat', 'principalWechat']],
           required: false,
           where: db.Sequelize.literal('surveys.principalId = users.id')
        },
        {
           model: User,
           as: 'Utilisateurs',
           attributes: [['chineseName', 'contactId'], ['phone', 'contactPhone'], ['wechat', 'contactWechat']],
           required: false,
           where: db.Sequelize.literal('surveys.contactId = Utilisateurs.id')
        },
    ];

  School.findAll({
    where: condition,

    attributes: [
            [db.Sequelize.fn("year", db.Sequelize.col("schools.startAt")), "startAt"],
            [db.Sequelize.fn("year", db.Sequelize.col("schools.lastVisit")), "lastVisit"],
            ...schoolAttributes,
    ],

    include: include,
    //order: [ ['code', 'asc'] ]
    order: orderbyObject
  })
  .then(schools => {
      res.send(schools);
    })
  .catch(err => {
      console.log(err);
      res.status(500).send({
        message:
        err.message || "Some error occurred while retrieving exports."
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

const getLegacyPhoto = async (schoolId) => {
  try {
    const documents = await Document.findAll({
      where: {
        schoolId: schoolId,
        //mimetype: 'image/jpeg',
        docCategory: 'profile_photo'
      }
    });

    if (!documents)
      return null;

    for (var i = 0; i < documents.length; i++) {

      if (fs.existsSync(documents[i].path))
        return fs.readFileSync(documents[i].path);

      if (fs.existsSync(documents[i].destination))
        return fs.readFileSync(documents[i].destination);
    }

    return null;

  } catch (err) {
    console.log(err);
  }

  return null;
}

// Find a single School photo with an id
exports.findOnePhoto = (req, res) => {
  const id = req.params.id;

  School.findByPk(id, {
      attributes: ['photo'],
      raw: true,
    }
  )
    .then(async photo => {
      if (photo.photo) {
        //res.send(photo);
        res.json({ success: true, data: photo });
      } else {
        let legacyPhoto = await getLegacyPhoto(id);
        if (legacyPhoto) {
          res.json({ success: true, data: {photo: legacyPhoto}});
        } else {
          res.status(404).send({
            message: `Cannot find School photo with id=${id}.`
          });
        }
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
                         'donor',
                         'principalId', 'contactId',
                          //[db.Sequelize.fn('date_format', db.Sequelize.col("startAt"), '%Y-%m-%d'), "startAt"],
                          [db.Sequelize.fn("year", db.Sequelize.col("schools.startAt")), "startAt"],
                          [db.Sequelize.fn("year", db.Sequelize.col("schools.lastVisit")), "lastVisit"],
                          'xr',
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

// get School Principal with an id
exports.getPrincipal = (req, res) => {
  const id = req.params.id;

  School.findByPk(id, {
      attributes: ['principal'],
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
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    await Survey.destroy({
      where: { schoolId: id },
      force: true
    });

    await School.destroy({
      where: { id: id }
    });

    res.send({
      message: "School & associated survey was deleted successfully!"
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: error.message || " Could not delete School with id=" + id
    });
  }

/**
  School.destroy({
    where: { id: id }
  })
    .then(schoolN => {
      if (schoolN == 1) {
        res.send({
          message: "School & associated survey was deleted successfully!"
        });

        Survey.destroy({
          where: { schoolId: id },
          force: true
        })
        .then(surveyN => {
          console.log('Number of survey instances deleted: ' + surveyN);
          res.send({
            message: "School & associated survey was deleted successfully!"
          });
        })
        .catch(e => {
          console.log(e);
          res.status(500).send({
            message: "Could not delete School with id=" + id
          })
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
*/
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
