const db = require("../models");
const Designation = db.designations;
const Response = db.responses;
const Project = db.projects;
const Donor = db.donors;
const Donation = db.donations;
const Dossier = db.dossiers;
const Op = db.Sequelize.Op;
const REGIONS = db.REGIONS;
const School = db.schools;


const { authJwt } = require("../middleware");

const getPagination = (page, size) => {
  const limit = size ? +size : 30;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const getPagingData = (count, data, page, limit, schoolDesignationsCount) => {
  //const { count: totalItems, rows: designations } = data;
  const designations = data;
  const totalItems = count;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, designations, totalPages, currentPage, schoolDesignationsCount };
};

// return region list
exports.getRegions = (req, res) => {
  res.send(REGIONS);
}

// Create and Save a new Designation
exports.create = (req, res) => {
  // Create a Designation
  const designation = req.body;

  // Save Designation in the database
  Designation.create(designation)
    .then(data => {
      console.log(data);
      res.send(data);
    })
    .catch(err => {
      console.log(err.message || "Some error occurred while creating the Designation.");
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Designation."
      });
    });
};

// Retrieve all Designations from the database.
exports.findAll = (req, res) => {
  const { page, size, title } = req.query;
  var condition = title ? { title: { [Op.like]: `%${title}%` } } : null;

  const { limit, offset } = getPagination(page, size);

  Designation.findAndCountAll({ where: condition, limit, offset })
    .then(data => {
      const response = getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving designations."
      });
    });
};

exports.findAllSimple = (req, res) => {
  const designationId = req.params.designationId;
  var condition = designationId ? { designationId: { [Op.eq]: `${designationId}` } } : null;

  Designation.findAll({
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
  const donor = req.body.donor;
  const page = req.body.page;
  const size = req.body.size;
  const orderby = req.body.orderby;
  const startAt = req.body.startAt;
  const code = req.body.code;
  const exportFlag = req.body.exportFlag;
  const region = req.body.region;
  const pCategoryId = req.body.pCategoryId;
  const formId = req.body.formId;

  const donorId = req.body.donorId;
  const projectId = req.body.projectId;
  const donationId = req.body.donationId;
/**
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
*/

  var orderbyObject = null;
  if (orderby) {
    orderbyObject = [];
    for (var i = 0; i < orderby.length; i++) {
      if (orderby[i].id == 'project.school.name')
        orderbyObject.push([Project, "schoolId",
          (orderby[i].desc ? "desc" : "asc")]);
      else if (orderby[i].id == 'donor')
        orderbyObject.push([Donor, "donor",
          (orderby[i].desc ? "desc" : "asc")]);
      else
        orderbyObject.push([orderby[i].id, (orderby[i].desc ? "desc" : "asc")]);
    }
  };

  var condition = {
    [Op.and]: [
      name ? {
        [Op.or] : [
          {appellation: { [Op.like]: `%${name}%` }},
        ] } : null,

      donor ? {
        [Op.or] : [
          { '$donor.donor$': { [Op.like]: `%${donor}%` } },
          { '$donor.name$': { [Op.like]: `%${donor}%` } }
        ] } : null,

      //donor ? { '$donor.donor$': { [Op.like]: `%${donor}%` } } : null,

      (pCategoryId || pCategoryId === 0)
        ? { pCategoryId: { [Op.eq]: `${pCategoryId}` } }
        : null,

      donorId
        ? { donorId: { [Op.eq]: `${donorId}` } }
        : null,

      donationId
        ? { donationId: { [Op.eq]: `${donationId}` } }
        : null,

      projectId
        ? { projectId: { [Op.eq]: `${projectId}` } }
        : null,

      startAt
        ? { "": { [Op.eq]: db.Sequelize.where(db.Sequelize.fn('YEAR', db.Sequelize.col('designations.startAt')), `${startAt}`) } }
        : null,
  ]};

  var inner_include = [
    {
       model: School,
       attributes: ['name'],
       required: false,
    },
 ];

  var include = [
    {
      model: Donor,
      attributes: ['donor'],
      required: false
    },
    {
      model: Donation,
      attributes: ['id'],
      required: false
    },
    {
      model: Project,
      attributes: ['id', 'schoolId'],
      required: false,
      include: inner_include
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

  var attributes = ['id', 'amount', 'appellation', 'pCategoryId', 'description', 'projectId', 'donorId', 'donationId',
    [db.Sequelize.fn("year", db.Sequelize.col("designations.startAt")), "startAt"]
  ];

  Designation.findAll({
  where: condition,
  ...limits,
//  limit: limit,
//  offset: offset,
  subQuery: false,

  attributes: attributes,
  include: include,
  //group: ['id'],
  order: orderbyObject
// order: orderby
// order: [[Response, 'title', 'desc']]
  })
    .then(data => {
        Designation.count({where: condition, include: include, distinct: true, col: 'id'})
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


// Find a single Designation with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  var include = [
    {
      model: Donor,
      attributes: ['donor'],
      required: false
    }
  ];

  Designation.findByPk(id, {
      attributes: ['id', 'amount', 'appellation', 'pCategoryId', 'description', 'projectId', 'donorId', 'donationId',
        [db.Sequelize.fn("year", db.Sequelize.col("startAt")), "startAt"]
      ],


      include: include,
      //raw: true,
    }
  )
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Designation with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Designation with id=" + id
      });
    });
};

// Find a single doner photo with an id
exports.findOnePhoto = (req, res) => {
  const id = req.params.id;

  Designation.findByPk(id, {
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
          message: `Cannot find designation photo with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving designation photo with id=" + id
      });
    });
};

// Update a Designation by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Designation.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Designation was updated successfully."
        });
      } else {
        console.log("Cannot update Designation with id=${id}. Maybe Designation was not found or req.body is empty!");
        res.send({
          message: `Cannot update Designation with id=${id}. Maybe Designation was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      console.log(err.message || "Error updating Designation with id=" + id);
      res.status(500).send({
        message: "Error updating Designation with id=" + id
      });
    });
};


// Delete a designation with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    let num = await Designation.destroy({
      where: { id: id }
    });

    if (num == 1) {
      res.send({
        message: "Designation was deleted successfully!"
      });
    } else {
      res.send({
        message: `Cannot delete Designation with id=${id}. Maybe Designation was not found!`
      });
    }

  } catch (err) {
    res.status(500).send({
      message: "Could not delete Designation with id=" + id
    });
  };
};


// Delete all Designations from the database.
exports.deleteAll = (req, res) => {
  Designation.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Designations were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all designations."
      });
    });
};

