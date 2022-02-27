const db = require("../models");
const Form = db.forms;
const Staging_Form = db.staging_forms;
const Response = db.responses;
const Staging_Response = db.staging_responses;
const Project = db.projects;
const Op = db.Sequelize.Op;
const { authJwt } = require("../middleware");

const getPagination = (page, size) => {
  const limit = size ? +size : 30;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const propagateUpdates = async (req) => {
  const formId = req.params.id;
  const {title, startAt} = req.body;

  try {
    await Response.update({title: title, startAt: startAt}, {where: { formId: formId }});
    const responseIds = await Response.findAll({
      attributes: ['id'],
      where: { formId: formId }
    });

    let rIds = [];
    for (var i = 0; i < responseIds.length; i++) rIds.push(responseIds[i].id);

    if (rIds.length === 0) return;

    await Project.update({name: title, startAt: startAt}, {
      where: {
        responseId: {[Op.or]: rIds}
      }
    });

  } catch (e) {
    console.log(e.message);
  }
};

const buildElement = (row, userData = null) => {
  let result = {};

  result.name = row.data_field_name; // ? row.data_field_name : ('name' + Date.now());
  result.label = row.q_text;

  if (row.input_type === 'TEXTAREA') result.type = 'textarea';
  //if (row.input_type === 'NON-INPUT') result.type = 'header';
  if (row.input_type === 'TEXT' || row.input_type === 'NON-INPUT') result.type = 'text';
  if (row.input_type === 'NUMERIC' ) result.type = 'number';
  if (row.input_type === 'RADIO') {result.type = 'radio-group'; result.inline = true;}
  if (row.input_type === 'CHECKBOX') result.type = 'checkbox-group';
  if (row.input_type === 'FILE') result.type = 'file';
  if (row.input_type === 'SELECT') result.type = 'select';

  if (row.input_type === 'TEXT' || row.input_type === 'NON-INPUT' || row.input_type === 'TEXTAREA' ||
    row.input_type === 'NUMERIC' || row.input_type === 'FILE')
    result.className = 'form-control';

  if (row.options && row.options.trim().length > 0) {
    const options = row.options.trim().split('|');
    let opts = [];
    for (var i = 0; i < options.length; i++)
      opts.push({label: options[i], value: options[i]});
      //opts.push({label: '选择 ' + i, value: options[i]});

    if (opts.length > 0)
      result.values = opts;
  }

  if (userData !== null && row.input_type !== 'FILE')
    result.userData = [userData];

  return result;
}


const migrate = () => {
  migrateForm();
  migrateResponse();
}


const migrateResponse = async () => {
  try {
    const rows = await Staging_Response.findAll({
      order: [ ['result_id', 'asc'], ['q_id', 'asc'] ]
    });

    let result_id = null;
    let form = null;
    for (var i = 0; i < rows.length; i++) {
      if (result_id !== rows[i].result_id) {
        // update form ...
        if (result_id != null)
          await Response.update({fdata: form}, {where: { result_id: result_id }});

        result_id = rows[i].result_id;
        form = [];
      }

      // construct element
      const questions = await Staging_Form.findAll({where: { q_id: rows[i].q_id }});
      if (questions && questions.length > 0) {
        let element = buildElement(questions[0], rows[i].q_value);
        form.push(element);
      }
    }

  } catch (e) {
    console.log(e.message);
  }
};

const SAVE_migrateResponse = async () => {
  try {
    const rows = await Staging_Response.findAll({
      order: [ ['title', 'asc'], ['q_id', 'asc'] ]
    });

    let title = null;
    let form = null;
    for (var i = 0; i < rows.length; i++) {
      if (title !== rows[i].title) {
        // update form ...
        if (title != null)
          await Response.update({fdata: form}, {where: { title: title }});

        title = rows[i].title;
        form = [];
      }

      // construct element
      const questions = await Staging_Form.findAll({where: { q_id: rows[i].q_id }});
      if (questions && questions.length > 0) {
        let element = buildElement(questions[0], rows[i].q_value);
        form.push(element);
      }
    }

  } catch (e) {
    console.log(e.message);
  }
};

const migrateForm = async () => {
  try {

    const rows = await Staging_Form.findAll({
      order: [ ['title', 'asc'], ['q_id', 'asc'] ]
    });

    let title = null;
    let form = null;
    for (var i = 0; i < rows.length; i++) {
      if (title !== rows[i].title) {
        // update form ...
        if (title != null)
          await Form.update({fdata: form}, {where: { title: title }});

        title = rows[i].title;
        form = [];
      }

      // construct element
      let element = buildElement(rows[i]);
      form.push(element);
    }

  } catch (e) {
    console.log(e.message);
  }
};

const SAVE_migrateForm = async () => {
  try {

    const rows = await Staging_Form.findAll({
      order: [ ['form_id', 'asc'], ['q_id', 'asc'] ]
    });

    let form_id = null;
    let form = null;
    for (var i = 0; i < rows.length; i++) {
      if (form_id !== rows[i].form_id) {
        // update form ...
        if (form_id != null) {
          await Form.update({fdata: form}, {where: { form_id: form_id }});
        }

        form_id = rows[i].form_id;
        form = [];
      }

      // construct element
      let element = buildElement(rows[i]);
      form.push(element);
    }

  } catch (e) {
    console.log(e.message);
  }
};

exports.SAVE_create = (req, res) => {
  migrate();
}

const getPagingData = (count, data, page, limit) => {
  //const { count: totalItems, rows: schools } = data;
  const forms = data;
  const totalItems = count;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, forms, totalPages, currentPage };
};

// Create and Save a new Form
exports.create = (req, res) => {
  // Validate request
  if (!req.body.title) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a Form
  const form = {
    title: req.body.title,
    description: req.body.description,
    deadline: req.body.deadline,
    startAt: req.body.startAt,
    published: req.body.published ? req.body.published : false,
    fdata: req.body.fdata,
  };

  // Save Form in the database
  Form.create(form)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Form."
      });
    });
};

// Retrieve all Forms from the database.
exports.findAll = (req, res) => {
  const { page, size, title } = req.query;
  var condition = title ? { title: { [Op.like]: `%${title}%` } } : null;

  const { limit, offset } = getPagination(page, size);

  Form.findAndCountAll({ where: condition, limit, offset })
    .then(data => {
      const response = getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving forms."
      });
    });
};

exports.findAll2 = async(req, res) => {
  const sid = await authJwt.getSchoolId(req);

  const title = req.body.title;
  const startAt = req.body.startAt;
  const page = req.body.page;
  const size = req.body.size;
  const orderby = req.body.orderby;

  var orderbyObject = null;
  if (orderby) {
    orderbyObject = [];
    for (var i = 0; i < orderby.length; i++) {
      if (orderby[i].id == 'responsesCount')
        orderbyObject.push([db.Sequelize.fn("COUNT", db.Sequelize.col("responses.id")),
          (orderby[i].desc ? "desc" : "asc")]);
      else
        orderbyObject.push([orderby[i].id, (orderby[i].desc ? "desc" : "asc")]);
    }
  };

  const condition = {
        [Op.and]: [
          title ? { title: { [Op.like]: `%${title}%` } } : null,
          startAt ? { "": { [Op.eq]: db.Sequelize.where(db.Sequelize.fn('YEAR', db.Sequelize.col('form.startAt')), `${startAt}`) } } : null
        ]};

  const includeCondition = {
        [Op.and]: [
          sid ? { '$responses.schoolId$': { [Op.eq]: `${sid}` } } : null,
        ]};

  const include = [{
          model: Response,
          attributes: [],
          required: false,
          where: includeCondition
        }];
  const { limit, offset } = getPagination(page, size);

  Form.findAll({
  where: condition,
  limit: limit,
  offset: offset,
  subQuery: false,
  attributes: ['id', 'title', 'description',// 'deadline',
      [db.Sequelize.fn("COUNT", db.Sequelize.col("responses.id")), "responsesCount"],
      [db.Sequelize.fn('date_format', db.Sequelize.col("deadline"), '%Y-%m-%d'), "deadline"],
      "startAt", //[db.Sequelize.fn('date_format', db.Sequelize.col("form.startAt"), '%Y-%m-%d'), "startAt"],
  ],
  include: include,
  group: ['id'],
  order: orderbyObject
  })
    .then(data => {
      Form.count({where: condition, include: include, distinct: true, col: 'id'})
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

exports.SAVE_findAll2 = (req, res) => {
  const title = req.body.title;
  const page = req.body.page;
  const size = req.body.size;

  //const { page, size, title } = req.query;
  var condition = title ? { title: { [Op.like]: `%${title}%` } } : null;

  const { limit, offset } = getPagination(page, size);

  Form.findAndCountAll({ where: condition, limit, offset })
    .then(data => {
      const response = getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving forms."
      });
    });
};

// find all published Form
exports.findAllPublished = (req, res) => {
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);

  Form.findAndCountAll({ where: { published: true }, limit, offset })
    .then(data => {
      const response = getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving forms."
      });
    });
};


// Find a single Form with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Form.findByPk(id, {
    attributes: ['id', 'title', 'description', 'fdata', // 'deadline',
      [db.Sequelize.fn('date_format', db.Sequelize.col("deadline"), '%Y-%m-%d'), "deadline"],
      "startAt", //[db.Sequelize.fn('YEAR', db.Sequelize.col('form.startAt')), "startAt"],
      //[db.Sequelize.fn('date_format', db.Sequelize.col("startAt"), '%Y-%m-%d'), "startAt"],
  ]
  })
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Form with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Form with id=" + id
      });
    });
};

// Update a Form by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Form.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Form was updated successfully."
        });

        propagateUpdates(req);
      } else {
        res.send({
          message: `Cannot update Form with id=${id}. Maybe Form was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Form with id=" + id
      });
    });
};

// Delete a form with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Form.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Form was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Form with id=${id}. Maybe Form was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Form with id=" + id
      });
    });
};


// Delete all Forms from the database.
exports.deleteAll = (req, res) => {
  Form.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Forms were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all forms."
      });
    });
};


