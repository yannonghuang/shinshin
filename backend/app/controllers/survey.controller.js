const db = require("../models");
const Survey = db.surveys;
const School = db.schools;
const Op = db.Sequelize.Op;
const User = db.user;
const Log = db.logs;
const { authJwt } = require("../middleware");

const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: surveys } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, surveys, totalPages, currentPage };
};

const updateAndLog = async (newObj, oldObj, schoolId, userId, t, req) => {
  var updates = [];
  Object.keys(newObj).forEach(key => {
    var newv = newObj[key];
    var oldv = oldObj ? oldObj[key] : null;

    if ((key !== 'createdAt' && key !== 'updatedAt') &&
        getAttributes(Survey).includes(key) &&
        ((newv || newv === false) && newv !== undefined) &&
        (!oldObj || !oldObj[key] || (oldv != newv))) {
      if ((authJwt.getSchoolId(req) && key !== 'contactId' && key !== 'principalId') || // school user
        !getAttributes(School).includes(key))
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

const getAttributes = (model) => {
  result = [];
  for( let key in model.rawAttributes ) result.push(key);
  return result;
}

// Create and Save a new Survey
exports.create = (req, res) => {
  // Validate request
  if (!req.body.schoolId) {
    res.status(400).send({
      message: "学校必须填写!"
    });
    return;
  }

  Survey.findOne({
    where: {
      schoolId: req.body.schoolId
    }
  })
    .then(d => {
      if (d) {
        const {id, ...otherParams} = req.body;
        Survey.update(otherParams, {
          where: { schoolId: req.body.schoolId }
        })
        .then(num => {
          if (num == 1) {
            res.send({
            message: "Survey was updated successfully."
          });
          } else {
            res.status(500).send({
            message: "Error updating Survey with req.body.schoolId =" + req.body.schoolId
            });
          }
        })
        .catch(err => {
          res.status(500).send({
            message: "Error updating Survey with req.body.schoolId =" + req.body.schoolId
          });
        });
/**
        res.status(500).send({
        message:
          "该校的调查表已经存在！！"
        });
*/
      } else {
        // Create a Survey, save Survey in the database
        Survey.create(req.body)
        .then(data => {
          res.send(data);
        })
        .catch(err => {
          res.status(500).send({
          message:
            err.message || "Some error occurred while creating the Survey."
          });
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Survey with id=" + id
      });
    });
};

exports.findAll2 = (req, res) => {
  const text = req.body.text;
  const userId = req.body.userId;
  const schoolId = req.body.schoolId;
  const orderby = req.body.orderby;

  const page = req.body.page;
  const size = req.body.size;
  //const { page, size, originalname } = req.query;

  var orderbyObject = null;
  if (orderby) {
    orderbyObject = [];
    for (var i = 0; i < orderby.length; i++) {
      var s = orderby[i].id.split(".");
      if (s.length == 1) orderbyObject.push([s[0], (orderby[i].desc ? "desc" : "asc")]);
      if (s.length == 2) {
        var m = null;
        if (s[0] == 'user') m = User;
        orderbyObject.push([m, s[1], (orderby[i].desc ? "desc" : "asc")]);
      }
    }
  };

  var condition = {
        [Op.and]: [
            text ? { text: { [Op.like]: `%${text}%` } } : null,
            schoolId ? { schoolId: { [Op.eq]: `${schoolId}` } } : null
        ]};

  const { limit, offset } = getPagination(page, size);

  Survey.findAndCountAll({
  where: condition,
  limit: limit,
  offset: offset,
  order: orderbyObject
  })
    .then(data => {
      const survey = getPagingData(data, page, limit);
      res.send(survey);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving surveys."
      });
    });
};


// Find a single Survey with an id
exports.findOne = (req, res) => {
  const id = req.params.id; // school id

  //Survey.findByPk(id)
  Survey.findOne({
    where: {
      schoolId: id
    }
  })
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        Survey.create({schoolId: id})
        .then(d => {
          res.send(d);
        })
        .catch(e => {
          res.status(500).send({
          message:
            e.message || "Some error occurred while creating the Survey."
          });
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Survey with id=" + id
      });
    });
};

// Update a survey by school id in the request
exports.update = async (req, res) => {
  if (!req.body.schoolId) {
    res.status(400).send({
      message: "学校ID必须提供!"
    });
    return;
  }

  const schoolId = req.body.schoolId;
  const userId = req.userId;
  const newObj = req.body;

  try {
    const t = await db.sequelize.transaction();
    let oldObj = await Survey.findOne({where: {schoolId: schoolId}, limit: 1}, {transaction: t});
    if (oldObj) {
      await updateAndLog(newObj, oldObj, schoolId, userId, t, req);
      res.send({
        message: "Survey was updated successfully."
      });
    } else {
      console.log("Cannot update Survey with school id=${schoolId}. Maybe Survey was not found or req.body is empty!");
      res.send({
        message: "Cannot update Survey with school id=${schoolId}. Maybe Survey was not found or req.body is empty!"
      });
    }
  } catch(err) {
    console.log(err.message || "Error updating Survey with school id=" + schoolId);
    res.status(500).send({
      message: err.message || "Error updating Survey with school id=" + schoolId
    });
  }
};

// Update a Survey by the id in the request
exports.SAVE_update = (req, res) => {
  if (!req.body.schoolId) {
    res.status(400).send({
      message: "学校必须填写!"
    });
    return;
  }

  const schoolId = req.body.schoolId; //school id
  Survey.update(req.body, {
    where: { schoolId: schoolId }
  })
    .then(num => {
      res.send({
        message: "Survey was updated successfully."
      });

    /**
      if (num == 1) {
        res.send({
          message: "Survey was updated successfully."
        });
      } else {
        Survey.create(req.body)
        .then(data => {
          res.send(data);
        })
        .catch(err => {
          res.status(500).send({
          message:
            err.message || "Some error occurred while creating the Survey."
          });
        });
      }
    */
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Survey with id=" + schoolId
      });
    });
};

// Delete an Survey with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Survey.findByPk(id)
    .then(data => {
    })
    .catch(err => {
      console.error(err);
      });

  Survey.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Survey was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Survey with id=${id}. Maybe Survey was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Survey with id=" + id
      });
    });
};


// Delete all Surveys from the database.
exports.deleteAll = (req, res) => {
  Survey.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Surveys were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all surveys."
      });
    });
};

// get updatedAt an id
exports.getUpdatedAt = async (req, res) => {
  const id = req.params.id; // school id

  try {
    //Survey.findByPk(id)
    let updatedAt = await Survey.findOne({
      attributes: ['updatedAt'],
      where: {schoolId: id},
      limit: 1
    });

    res.send({updatedAt: updatedAt});

  } catch(err) {
    console.log(err.message);
    res.status(500).send({
      message: "Error retrieving Survey with id=" + id
    });
  };
};


