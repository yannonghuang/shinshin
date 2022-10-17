const db = require("../models");
const Donor = db.donors;
const Designation = db.designations;
const Donation = db.donations;
const Response = db.responses;
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

const getPagingData = (count, data, page, limit, schoolDonorsCount) => {
  //const { count: totalItems, rows: donors } = data;
  const donors = data;
  const totalItems = count;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, donors, totalPages, currentPage, schoolDonorsCount };
};

// return region list
exports.getRegions = (req, res) => {
  res.send(REGIONS);
}

// Create and Save a new Donor
exports.create = (req, res) => {
  // Create a Donor
  const donor = req.body;

  // Save Donor in the database
  Donor.create(donor)
    .then(data => {
      console.log(data);
      res.send(data);
    })
    .catch(err => {
      console.log(err.message || "Some error occurred while creating the Donor.");
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Donor."
      });
    });
};

// Retrieve all Donors from the database.
exports.findAll = (req, res) => {
  const { page, size, title } = req.query;
  var condition = title ? { title: { [Op.like]: `%${title}%` } } : null;

  const { limit, offset } = getPagination(page, size);

  Donor.findAndCountAll({ where: condition, limit, offset })
    .then(data => {
      const response = getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving donors."
      });
    });
};

exports.findAllSimple = (req, res) => {
  const donorId = req.params.donorId;
  var condition = donorId ? { donorId: { [Op.eq]: `${donorId}` } } : null;

  Donor.findAll({
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
  const orderby = req.body.orderby;
  const startAt = req.body.startAt;
  const code = req.body.code;
  const exportFlag = req.body.exportFlag;
  const region = req.body.region;
  const pCategoryId = req.body.pCategoryId;
  const formId = req.body.formId;


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
      if (orderby[i].id == 'designationsCount')
        orderbyObject.push([db.Sequelize.fn("COUNT", db.Sequelize.col("designations.id")),
          (orderby[i].desc ? "desc" : "asc")]);
      else if (orderby[i].id == 'donationsCount')
        orderbyObject.push([db.Sequelize.fn("COUNT", db.Sequelize.col("donations.id")),
          (orderby[i].desc ? "desc" : "asc")]);
      else
        orderbyObject.push([orderby[i].id, (orderby[i].desc ? "desc" : "asc")]);
    }
  };

  var condition = {
    [Op.and]: [
      name ? {
        [Op.or] : [
          {name: { [Op.like]: `%${name}%` }},
          {donor: { [Op.like]: `%${name}%` }},
        ] } : null,

        (pCategoryId || pCategoryId === 0)
          ? { '$designations.pCategoryId$': { [Op.eq]: `${pCategoryId}` } }
          : null,

        startAt
          ? { "": { [Op.eq]: db.Sequelize.where(db.Sequelize.fn('YEAR', db.Sequelize.col('designations.startAt')), `${startAt}`) } }
          : null,
  ]};

  var group = ['id'];

  var include = [
    {
      model: Designation,
      attributes: [],
      required: false,
    },
    {
      model: Donation,
      attributes: [],
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

  var attributes = ['id', 'name', 'phone', 'donor', 'email', 'address', 'description',
    //[db.Sequelize.fn("COUNT", db.Sequelize.col("designations.id")), "designationsCount"],
    [db.Sequelize.literal(`count(distinct designations.id)`), "designationsCount"],
    [db.Sequelize.literal(`count(distinct donations.id)`), "donationsCount"]
    //[db.Sequelize.fn("COUNT", db.Sequelize.col("donations.id")), "donationsCount"]
  ];

  Donor.findAll({
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
        Donor.count({where: condition, include: include, group: group, distinct: true, col: 'id'})
          .then(count => {
            const response = getPagingData((count instanceof Array) ? count.length : count, data, page, limit);
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


// Find a single Donor with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  var include = [
    {
      model: Designation,
      attributes: ['id', 'pCategoryId',
        [db.Sequelize.fn("year", db.Sequelize.col("startAt")), "startAt"]
        //'startAt'
      ],
      required: false,
    },
  ];

  Donor.findByPk(id, {
      attributes: ['id', 'name', 'phone', 'donor', 'email', 'address', 'description'],

      include: include,
/**
    [

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
  ]
*/
      //raw: true,
    }
  )
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Donor with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Donor with id=" + id
      });
    });
};

// Find a single doner photo with an id
exports.findOnePhoto = (req, res) => {
  const id = req.params.id;

  Donor.findByPk(id, {
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
          message: `Cannot find donor photo with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving donor photo with id=" + id
      });
    });
};

// Update a Donor by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Donor.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Donor was updated successfully."
        });
      } else {
        console.log("Cannot update Donor with id=${id}. Maybe Donor was not found or req.body is empty!");
        res.send({
          message: `Cannot update Donor with id=${id}. Maybe Donor was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      console.log(err.message || "Error updating Donor with id=" + id);
      res.status(500).send({
        message: "Error updating Donor with id=" + id
      });
    });
};


// Delete a donor with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    let num = await Donor.destroy({
      where: { id: id }
    });

    if (num == 1) {
      res.send({
        message: "Donor was deleted successfully!"
      });
    } else {
      res.send({
        message: `Cannot delete Donor with id=${id}. Maybe Donor was not found!`
      });
    }

  } catch (err) {
    res.status(500).send({
      message: "Could not delete Donor with id=" + id
    });
  };
};


// Delete all Donors from the database.
exports.deleteAll = (req, res) => {
  Donor.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Donors were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all donors."
      });
    });
};

