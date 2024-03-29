const db = require("../models");
const Form = db.forms;
const Staging_Form = db.staging_forms;
const Response = db.responses;
const Staging_Response = db.staging_responses;
const Project = db.projects;
const School = db.schools;
const Op = db.Sequelize.Op;
const { authJwt } = require("../middleware");

const getPagination = (page, size) => {
  const limit = size ? +size : 30;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const peg = async (req, formId) => {
  const {title, startAt, pCategoryId} = req.body;

  const condition = {
        [Op.and]: [
          pCategoryId ? { pCategoryId: { [Op.eq]: `${pCategoryId}` } } : null,
          title ? { name: { [Op.like]: `%${title}%` } } : null,
          startAt ? { "": { [Op.eq]: db.Sequelize.where(db.Sequelize.fn('YEAR', db.Sequelize.col('projects.startAt')), `${startAt}`) } } : null,
          { responseId: null }
        ]};

  try {
    let projs = await Project.findAll({
      where: condition //{name: title, startAt: startAt, pCategoryId: pCategoryId}
    });

    if (projs.length === 0) return;

    for (var i = 0; i < projs.length; i++) {
      let resp = await Response.create({title: title, startAt: startAt, pCategoryId: pCategoryId, formId: formId}); // schoolId: projs[i].schoolId
      projs[i].update({responseId: resp.id});
    }

  } catch (e) {
    console.log(e);
  }
};

const needToPropagate = async (req) => {
  const id = req.params.id;
  const {title, startAt, pCategoryId} = req.body;

  const condition = {
        [Op.and]: [
          id ? { id: { [Op.eq]: `${id}` } } : null,
          pCategoryId ? { pCategoryId: { [Op.eq]: `${pCategoryId}` } } : null,
          title ? { title: { [Op.eq]: `${title}` } } : null,
          startAt
            ? { "": { [Op.eq]: db.Sequelize.where(db.Sequelize.fn('date_format', db.Sequelize.col('startAt'), '%Y-%m-%d'), `${startAt}`) } }
            : null,
        ]};

  try {
    let forms = await Form.findAll({where: condition});
    //let forms = await Form.findAll({where: { id, title, startAt, pCategoryId }});
    if (!forms || forms.length === 0) return true;
  } catch (e) {
    console.log(e.message);
  }
  return false;
};

const propagateUpdates = async (req) => {
  const formId = req.params.id;
  const {title, startAt, pCategoryId, pCategoryIdDirty} = req.body;

  try {
    await Response.update({title: title, startAt: startAt, pCategoryId: pCategoryId}, {where: { formId: formId }});
    const responseIds = await Response.findAll({
      attributes: ['id'],
      where: { formId: formId }
    });

    let rIds = [];
    for (var i = 0; i < responseIds.length; i++) rIds.push(responseIds[i].id);

    if (rIds.length === 0) return;

    if (pCategoryIdDirty)
      await Project.update({name: title, startAt: startAt, pCategoryId: pCategoryId, pSubCategoryId: null}, {
        where: {
          responseId: {[Op.or]: rIds}
        }
      });
    else
      await Project.update({name: title, startAt: startAt, pCategoryId: pCategoryId}, {
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
    pCategoryId: req.body.pCategoryId,
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


// Create and Save a new Virtual Form
exports.createV = (req, res) => {
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
    startAt: req.body.startAt + '-01-10',
    published: req.body.published ? req.body.published : false,
    fdata: req.body.fdata,
    pCategoryId: req.body.pCategoryId,
  };

  // Save Form in the database
  Form.create(form)
    .then(data => {
      peg(req, data.id);
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
  const hasAdminRole = await authJwt.hasAdminRole(req);

  const title = req.body.title;
  const startAt = req.body.startAt;
  const page = req.body.page;
  const size = req.body.size;
  const orderby = req.body.orderby;
  const published = (sid/* || !hasAdminRole */) ? 'true' : req.body.published;
  const multipleAllowed = req.body.multipleAllowed;

  const code = await getSchoolCode(sid);
  console.log("schoold code " + code);
  await getFormDesignations();
  console.log(Forms_With_School_Designations);
  //console.log(Forms_Without_School_Designations);

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
          sid ? { deadline: { [Op.gt]: new Date() } } : null,
          title ? { title: { [Op.like]: `%${title}%` } } : null,
          startAt ? { "": { [Op.eq]: db.Sequelize.where(db.Sequelize.fn('YEAR', db.Sequelize.col('form.startAt')), `${startAt}`) } } : null,
          published === undefined
            ? null
            : published === 'true'
              ? { published: { [Op.eq]: `1` }}              
              : {[Op.or]: [{ published: { [Op.ne]: `1` }}, { published: null }]},
          sid
            ? (code < 10000) 
              ? {[Op.or]: [
                  {[Op.and]: [{id: {[Op.or]: Forms_With_School_Designations}}, { '$schools.id$': { [Op.eq]: `${sid}` } }]}, 
                  {[Op.and]: [{[Op.not]: {id: {[Op.or]: Forms_With_School_Designations}}}]}
                  //{[Op.and]: [{id: {[Op.or]: Forms_Without_School_Designations}}, { '$schools.code$': { [Op.lt]: 10000 } }]}                  
                ]}
              : {[Op.or]: [
                  {[Op.and]: [{id: {[Op.or]: Forms_With_School_Designations}}, { '$schools.id$': { [Op.eq]: `${sid}` } }]},               
                ]}
            : null,
          multipleAllowed === undefined
            ? null
            : multipleAllowed === 'true'
              ? { multipleAllowed: { [Op.eq]: `1` }}
              : {[Op.or]: [{ multipleAllowed: { [Op.ne]: `1` }}, { multipleAllowed: null }]},
        ]};

  const SAVE_condition = {
        [Op.and]: [
          sid ? { deadline: { [Op.gt]: new Date() } } : null,
          title ? { title: { [Op.like]: `%${title}%` } } : null,
          startAt ? { "": { [Op.eq]: db.Sequelize.where(db.Sequelize.fn('YEAR', db.Sequelize.col('form.startAt')), `${startAt}`) } } : null,
          published === undefined
            ? null
            : published === 'true'
              ? {[Op.or]: [{ published: { [Op.eq]: `1` }}, sid ? { '$schools.id$': { [Op.eq]: `${sid}` } } : null]}
              //? { published: { [Op.eq]: `1` }}              
              : {[Op.or]: [{ published: { [Op.ne]: `1` }}, { published: null }]},
          multipleAllowed === undefined
            ? null
            : multipleAllowed === 'true'
              ? { multipleAllowed: { [Op.eq]: `1` }}
              : {[Op.or]: [{ multipleAllowed: { [Op.ne]: `1` }}, { multipleAllowed: null }]},
        ]};

  const incldueSchoolCondition = {
          [Op.and]: [
            sid ? { '$schools.id$': { [Op.eq]: `${sid}` } } : null,       
          ]};
  
  const includeCondition = {
        [Op.and]: [
          sid ? { '$responses.schoolId$': { [Op.eq]: `${sid}` } } : null,
        ]};

  const include = sid
    ? [
        {
          model: Response,
          attributes: [],
          required: false,
          where: includeCondition
        },
        {
          model: School,
          attributes: [],
          through: {
            attributes: []
          },
          required: false,
          where: incldueSchoolCondition
        }
  ]
    : [
        {
          model: Response,
          attributes: [],
          required: false,
          where: includeCondition
        } 
  ];

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
      "published",
      "multipleAllowed"
  ],
  include: include,
  group: ['form.id'],
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

const getSchoolCode = async(sid) => {
  if (!sid) return null;

  try {
    result = await School.findByPk(sid, {
      attributes: ['code']
    }); 
    return result.code;
  } catch (e) {
    console.log(e); 
  }
  return null;
}

var Forms_With_School_Designations = [];
const getFormDesignations = async() => {
  const include = [
        {
          model: School,
          attributes: [],
          through: {
            attributes: []
          },
          required: false,
        }
  ];

  Forms_With_School_Designations = [];
  try {
     let r = await Form.findAll({
      //subQuery: false,
      attributes: ['id'],
      include: include,
      group: ['id'],
      having: db.Sequelize.literal("count(schools.id) > 0")
    });
    for (var i = 0; i < r.length; i++) Forms_With_School_Designations.push(r[i].id);
  } catch (e) {
    console.log(e);
  }

  if (Forms_With_School_Designations.length === 0)
    Forms_With_School_Designations = [-1];
  
  Forms_With_School_Designations = Forms_With_School_Designations.filter((item,
      index) => Forms_With_School_Designations.indexOf(item) === index);
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
      "published",
      "pCategoryId",
      "multipleAllowed"
  ],
  include: [
    {
      model: School,
      attributes: ['id'],
      required: false,
    },
  ],  
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

// copy a form with the specified id in the request
exports.copy = async (req, res) => {
  const id = req.params.id;

  try {
    const f = await Form.findOne({ where: {id: id}, raw:  true, attributes: { exclude: ['id'] } });
    f.title = "复制: " + f.title;
    f.published = null;
    const newF = await Form.create(f);
    res.send(newF);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Could not copy Form with id=" + id
    });
  };
};

// publish a form with the specified id in the request
exports.publish = async (req, res) => {
  const id = req.params.id;

  try {
    await Form.update({published: true}, { where: {id: id }});
    res.status(200).send({
      message: "successfully publish Form with id=" + id
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Could not publish Form with id=" + id
    });
  };
};

// Update a Form by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;

  const needPropagation = await needToPropagate(req);

  Form.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        Form.findByPk(id).then(form=>{
          if (req.body.schools) {
            School.findAll({
              where: {
                [Op.and]: [
                  req.body.schools.length > 0
                    ? {id: {[Op.or]: req.body.schools}}
                    : db.Sequelize.literal("false")
                ]
              }
            }).then(schools => {
              form.setSchools(schools).then(() => {
                res.send({ message: "Form and School were updated successfully!" });
              });
            });
          } else {
            res.send({message: "Form was updated successfully."});
          }
        })
/*
        res.send({
          message: "Form was updated successfully."
        });
*/
        if (needPropagation)
          propagateUpdates(req);
        else
          console.log('......... NO need to propagate ..... ');
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


