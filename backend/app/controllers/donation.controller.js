const db = require("../models");
const Donation = db.donations;
const Designation = db.designations;
const Response = db.responses;
const Project = db.projects;
const Donor = db.donors;
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

const getPagingData = (count, data, page, limit, schoolDonationsCount) => {
  //const { count: totalItems, rows: donations } = data;
  const donations = data;
  const totalItems = count;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, donations, totalPages, currentPage, schoolDonationsCount };
};

// return region list
exports.getRegions = (req, res) => {
  res.send(REGIONS);
}

// Create and Save a new Donation
exports.create = (req, res) => {
  // Create a Donation
  const donation = req.body;

  // Save Donation in the database
  Donation.create(donation)
    .then(data => {
      console.log(data);
      res.send(data);
    })
    .catch(err => {
      console.log(err.message || "Some error occurred while creating the Donation.");
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Donation."
      });
    });
};

// Retrieve all Donations from the database.
exports.findAll = (req, res) => {
  const { page, size, title } = req.query;
  var condition = title ? { title: { [Op.like]: `%${title}%` } } : null;

  const { limit, offset } = getPagination(page, size);

  Donation.findAndCountAll({ where: condition, limit, offset })
    .then(data => {
      const response = getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving donations."
      });
    });
};

exports.findAllSimple = (req, res) => {
  const donationId = req.params.donationId;
  var condition = donationId ? { donationId: { [Op.eq]: `${donationId}` } } : null;

  Donation.findAll({
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


  var orderbyObject = null;
  if (orderby) {
    orderbyObject = [];
    for (var i = 0; i < orderby.length; i++) {
      if (orderby[i].id == 'schoolId')
        orderbyObject.push([Project, "schoolId",
          (orderby[i].desc ? "desc" : "asc")]);
      else if (orderby[i].id == 'donor')
        orderbyObject.push([Donor, "donor",
          (orderby[i].desc ? "desc" : "asc")]);
      else
        orderbyObject.push([orderby[i].id, (orderby[i].desc ? "desc" : "asc")]);
    }
  };
*/

  var orderbyObject = null;
  if (orderby) {
    orderbyObject = [];
    for (var i = 0; i < orderby.length; i++) {
      if (orderby[i].id == 'designationsCount')
        orderbyObject.push([db.Sequelize.fn("COUNT", db.Sequelize.col("designations.id")),
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

      projectId
        ? { projectId: { [Op.eq]: `${projectId}` } }
        : null,

      startAt
        ? { "": { [Op.eq]: db.Sequelize.where(db.Sequelize.fn('YEAR', db.Sequelize.col('donations.startAt')), `${startAt}`) } }
        : null,
  ]};

  var include_designations = [{
        model: Designation,
        attributes: [],
        required: false,
      }];

  var include = [
    {
      model: Donor,
      attributes: ['donor'],
      required: false
    }
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

  var attributes = ['id', 'amount', 'description', 'donorId',
    [db.Sequelize.fn('date_format', db.Sequelize.col("donations.startAt"), '%Y-%m-%d'), "startAt"],
    [db.Sequelize.fn("COUNT", db.Sequelize.col("designations.id")), "designationsCount"]
  ];

  var group = ['id'];

  Donation.findAll({
  where: condition,
  ...limits,
//  limit: limit,
//  offset: offset,
  subQuery: false,

  attributes: attributes,
  include: include,
  group: group,
  order: orderbyObject
// order: orderby
// order: [[Response, 'title', 'desc']]
  })
    .then(data => {
        Donation.count({where: condition, include: include, distinct: true, col: 'id'})
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


// Find a single Donation with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  var include = [
    {
      model: Donor,
      attributes: ['donor'],
      required: false
    }
  ];

  Donation.findByPk(id, {
      attributes: ['id', 'amount', 'description', 'donorId',
        [db.Sequelize.fn('date_format', db.Sequelize.col("startAt"), '%Y-%m-%d'), "startAt"]
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
          message: `Cannot find Donation with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Donation with id=" + id
      });
    });
};

// Find a single doner photo with an id
exports.findOnePhoto = (req, res) => {
  const id = req.params.id;

  Donation.findByPk(id, {
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
          message: `Cannot find donation photo with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving donation photo with id=" + id
      });
    });
};

// Update a Donation by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Donation.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Donation was updated successfully."
        });
      } else {
        console.log("Cannot update Donation with id=${id}. Maybe Donation was not found or req.body is empty!");
        res.send({
          message: `Cannot update Donation with id=${id}. Maybe Donation was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      console.log(err.message || "Error updating Donation with id=" + id);
      res.status(500).send({
        message: "Error updating Donation with id=" + id
      });
    });
};


// Delete a donation with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    let num = await Donation.destroy({
      where: { id: id }
    });

    if (num == 1) {
      res.send({
        message: "Donation was deleted successfully!"
      });
    } else {
      res.send({
        message: `Cannot delete Donation with id=${id}. Maybe Donation was not found!`
      });
    }

  } catch (err) {
    res.status(500).send({
      message: "Could not delete Donation with id=" + id
    });
  };
};


// Delete all Donations from the database.
exports.deleteAll = (req, res) => {
  Donation.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Donations were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all donations."
      });
    });
};

