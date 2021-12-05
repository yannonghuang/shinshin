const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.dossiers = require("./dossier.model.js")(sequelize, Sequelize);
db.projects = require("./project.model.js")(sequelize, Sequelize);
db.documents = require("./document.model.js")(sequelize, Sequelize);
db.schools = require("./school.model.js")(sequelize, Sequelize);
db.regions = require("./region.model.js")(sequelize, Sequelize);
db.attachments = require("./attachment.model.js")(sequelize, Sequelize);
db.responses = require("./response.model.js")(sequelize, Sequelize);
db.forms = require("./form.model.js")(sequelize, Sequelize);
db.tutorials = require("./tutorial.model.js")(sequelize, Sequelize);
db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);

db.role.belongsToMany(db.user, {
  through: "user_roles",
  foreignKey: "roleId",
  otherKey: "userId"
});
db.user.belongsToMany(db.role, {
  through: "user_roles",
  foreignKey: "userId",
  otherKey: "roleId"
});

db.ROLES2 = ["user", "admin", "moderator", "volunteer"];

db.ROLES = [
  {name: "user", label: "学校用户"},
  {name: "admin", label: "管理员"},
  {name: "moderator", label: "教师"},
  {name: "volunteer", label: "欣欣义工"},
];

db.DOCUMENT_CATEGORIES = [
  "访校",
  "活动",
  "汇报",
  "照片",
];

db.DOSSIER_CATEGORIES = [
  "进展",
  "活动",
  "汇报",
];

db.PROJECT_STATUSES = [
  "正常进行",
  "已经结束",
  "尚未开始",
  "遇到困难",
];

db.REGIONS = [
"北京市",
"广东省",
"山东省",
"江苏省",
"河南省",
"上海市",
"河北省",
"浙江省",
"香港特别行政区",
"陕西省",
"湖南省",
"重庆市",
"福建省",
"天津市",
"云南省",
"四川省",
"广西壮族自治区",
"安徽省",
"海南省",
"江西省",
"湖北省",
"山西省",
"辽宁省",
"台湾省",
"黑龙江",
"内蒙古自治区",
"澳门特别行政区",
"贵州省",
"甘肃省",
"青海省",
"新疆维吾尔自治区",
"西藏区",
"吉林省",
"宁夏回族自治区"
];

db.forms.hasMany(db.responses, {foreignKey: 'formId'}, {as: 'Responses'})
db.responses.belongsTo(db.forms);

db.responses.hasMany(db.attachments, {foreignKey: 'responseId'}, {as: 'Attachments'}, {onDelete: 'cascade'})
db.attachments.belongsTo(db.responses);

db.schools.hasMany(db.documents, {foreignKey: 'schoolId'}, {as: 'Documents'})
db.documents.belongsTo(db.schools);

db.schools.hasMany(db.responses, {foreignKey: 'schoolId'}, {as: 'Responses'})
db.responses.belongsTo(db.schools);

db.schools.hasMany(db.user, {foreignKey: 'schoolId'}, {as: 'Users'});
db.user.belongsTo(db.schools);

db.responses.hasMany(db.projects, {foreignKey: 'responseId'}, {as: 'Projects'});
db.projects.belongsTo(db.responses);

db.schools.hasMany(db.projects, {foreignKey: 'schoolId'}, {as: 'Projects'})
db.projects.belongsTo(db.schools);

db.projects.hasMany(db.dossiers, {foreignKey: 'projectId'}, {as: 'Dossiers'})
db.dossiers.belongsTo(db.projects);

module.exports = db;

