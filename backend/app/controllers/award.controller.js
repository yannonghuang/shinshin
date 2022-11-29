const db = require("../models");
const Award = db.awards;
const Response = db.responses;
const Designation = db.designations;
const Dossier = db.dossiers;
const Op = db.Sequelize.Op;
const REGIONS = db.REGIONS;
const School = db.schools;

const AWARD_TYPES = db.AWARD_TYPES;
const AWARD_CATEGORIES = db.AWARD_CATEGORIES;

const { authJwt } = require("../middleware");

const getPagination = (page, size) => {
  const limit = size ? +size : 30;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const getPagingData = (count, data, page, limit, schoolAwardsCount) => {
  //const { count: totalItems, rows: awards } = data;
  const awards = data;
  const totalItems = count;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, awards, totalPages, currentPage, schoolAwardsCount };
};


// Create and Save a new Award
exports.create = (req, res) => {
  // Validate request
  if (!req.body.name) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  const schoolId = req.body.schoolId;
  // Create a Award
  const award = {
    name: req.body.name,
    budget: req.body.budget,
    type: req.body.type,
    category: req.body.category,
    schoolId: schoolId,
    description: req.body.description,
    startAt: req.body.startAt,
    issuer: req.body.issuer,
    awardee: req.body.awardee,
  };

  // Save Award in the database
  Award.create(award)
    .then(data => {
      console.log(data);
      res.send(data);
    })
    .catch(err => {
      console.log(err.message || "Some error occurred while creating the Award.");
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Award."
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
  const type = req.body.type;
  const category = req.body.category;
  const issuer = req.body.issuer;
  const awardee = req.body.awardee;

  var orderbyObject = null;
  if (orderby) {
    orderbyObject = [];
    for (var i = 0; i < orderby.length; i++) {
      if (orderby[i].id == 'designationsCount')
        orderbyObject.push([db.Sequelize.fn("COUNT", db.Sequelize.col("designations.id")),
          (orderby[i].desc ? "desc" : "asc")]);
      else if (orderby[i].id.startsWith('school.')) {
        orderbyObject.push([School, orderby[i].id.substring(orderby[i].id.indexOf('.') + 1),
          (orderby[i].desc ? "desc" : "asc")]);
      } else
        orderbyObject.push([orderby[i].id, (orderby[i].desc ? "desc" : "asc")]);
    }
  };

  var condition = {
        [Op.and]: [
            name ? { name: { [Op.like]: `%${name}%` } } : null,
            issuer ? { issuer: { [Op.like]: `%${issuer}%` } } : null,
            awardee ? { awardee: { [Op.like]: `%${awardee}%` } } : null,
            schoolId ? { schoolId: { [Op.eq]: `${schoolId}` } } : null,
            type ? { type: { [Op.eq]: `${type}` } } : null,
            category ? { category: { [Op.eq]: `${category}` } } : null,
            code ? { '$school.code$': { [Op.eq]: `${code}` } } : null,
            //region ? { '$school.region$': { [Op.like]: `%${region}%` } } : null,
            region ? { '$school.region$': { [Op.eq]: `${region}` } } : null,
            startAt ? { "": { [Op.eq]: db.Sequelize.where(db.Sequelize.fn('YEAR', db.Sequelize.col('awards.startAt')), `${startAt}`) } } : null,
        ]};

  var include = [
                    {
                      model: School,
                      attributes: ['id', 'studentsCount', 'teachersCount',
                        //'category',
                        'name', 'code', 'region', 'address'

                      ],
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

  var attributes = ['id', 'name', 'type', 'description', 'awardee', 'issuer', 'category',
    exportFlag
    ? [db.Sequelize.fn("year", db.Sequelize.col("awards.startAt")), "startAt"]
    : 'startAt',

  ];

  Award.findAll({
  where: condition,
  ...limits,
//  limit: limit,
//  offset: offset,
  subQuery: false,

  attributes: attributes,
/**
  attributes: ['id', 'name', 'budget', 'status', 'description', //'schoolId', 'responseId'
            "startAt", //[db.Sequelize.fn("year", db.Sequelize.col("awards.startAt")), "startAt"],
  //          [db.Sequelize.fn("COUNT", db.Sequelize.col("responses.id")), "responsesCount"],
  ],
*/
  include: include,

  order: orderbyObject,
// order: orderby
// order: [[Response, 'title', 'desc']]
  })
    .then(data => {
        Award.count({where: condition, include: include, distinct: true, col: 'id'})
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


// Find a single Award photo with an id
exports.findOnePhoto = (req, res) => {
  const id = req.params.id;

  Award.findByPk(id, {
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
          message: `Cannot find Award photo with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Award photo with id=" + id
      });
    });
};

// Find a single Award with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Award.findByPk(id, {
      attributes: ['id', 'name', 'type', 'description', 'awardee', 'issuer', 'category',
                    [db.Sequelize.fn("year", db.Sequelize.col("awards.startAt")), "startAt"],
                  ],

      include: [
      {
      model: School,
      attributes: ['id', 'name', 'code'],
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
          message: `Cannot find Award with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Award with id=" + id
      });
    });
};

// Update a Award by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Award.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Award was updated successfully."
        });
      } else {
        console.log("Cannot update Award with id=${id}. Maybe Award was not found or req.body is empty!");
        res.send({
          message: `Cannot update Award with id=${id}. Maybe Award was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      console.log(err.message || "Error updating Award with id=" + id);
      res.status(500).send({
        message: "Error updating Award with id=" + id
      });
    });
};


// Delete a award with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    let p = await Award.findByPk(id);

    let num = await Award.destroy({
      where: { id: id }
    });

    if (num == 1) {
      res.send({
        message: "Award was deleted successfully!"
      });
    } else {
      res.send({
        message: `Cannot delete Award with id=${id}. Maybe Award was not found!`
      });
    }

  } catch (err) {
    res.status(500).send({
      message: "Could not delete Award with id=" + id
    });
  };
};


// Delete all Awards from the database.
exports.deleteAll = (req, res) => {
  Award.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Awards were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all awards."
      });
    });
};

// return award type list
exports.getAwardTypes = (req, res) => {
  res.send(AWARD_TYPES);
}

// return award category list
exports.getAwardCategories = (req, res) => {
  res.send(AWARD_CATEGORIES);
}
