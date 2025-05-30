const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const { QueryTypes } = require('sequelize');

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
db.QueryTypes = QueryTypes;

db.surveys = require("./survey.model.js")(sequelize, Sequelize);
db.logs = require("./log.model.js")(sequelize, Sequelize);
db.comments = require("./comment.model.js")(sequelize, Sequelize);
db.dossiers = require("./dossier.model.js")(sequelize, Sequelize);
db.projects = require("./project.model.js")(sequelize, Sequelize);
db.documents = require("./document.model.js")(sequelize, Sequelize);
db.schools = require("./school.model.js")(sequelize, Sequelize);
db.regions = require("./region.model.js")(sequelize, Sequelize);
db.attachments = require("./attachment.model.js")(sequelize, Sequelize);
db.responses = require("./response.model.js")(sequelize, Sequelize);
db.staging_responses = require("./staging_response.model.js")(sequelize, Sequelize);
db.forms = require("./form.model.js")(sequelize, Sequelize);
db.staging_forms = require("./staging_form.model.js")(sequelize, Sequelize);
db.tutorials = require("./tutorial.model.js")(sequelize, Sequelize);
db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);
db.donors = require("./donor.model.js")(sequelize, Sequelize);
db.designations = require("./designation.model.js")(sequelize, Sequelize);
db.donations = require("./donation.model.js")(sequelize, Sequelize);
db.feedbacks = require("./feedback.model.js")(sequelize, Sequelize);
db.questionaires = require("./questionaire.model.js")(sequelize, Sequelize);
db.materials = require("./material.model.js")(sequelize, Sequelize);
db.awards = require("./award.model.js")(sequelize, Sequelize);

db.forms.belongsToMany(db.schools, {
  through: "form_school",
  foreignKey: "formId",
  otherKey: "schoolId"
});
db.schools.belongsToMany(db.forms, {
  through: "form_school",
  foreignKey: "schoolId",
  otherKey: "formId"
});

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
  {name: "volunteer", label: "义工用户"},
  {name: "admin", label: "管理员"},
];

db.USER_TITLES = [
  //"校长",
  //"副校长",
  //"主任",
  //"老师"

  "校长",
  "副校长",
  "中心校校长",
  "主任",
  "老师",
  "书记",
  "村小负责人",
  "小学部负责人",
];

db.VOLUNTEER_DEPARTMENTS = [
  "学校联络部",
  "学校发展部",
  "教育专案部",
  "学生活动部",
  "青年部",
  "IT",
  "HR",
  "财务部",
  "公关文宣部",
  "理事会",
  "北京代表处",
  "专项工作",
  "捐款人服务部",
];

db.PROJECT_CATEGORIES = [
  "TeachersTraing(师资培训)",
  "E-Learning(电子教学)",
  "Literacy Programs(图书计划)",
  "University Outreach(大学生实践)",
  "Construction(建校计划)",
  "Facility Improvement(设施改善)",
  "Principal Training(校长培训)",
  "2016扬帆合作项目",
  "Student Activity (学生活动)",
  "General Program (通用项目)",
  "Model Rural Schools (欣美乡村学校)",
  "美化校园项目"
];

db.DOCUMENT_CATEGORIES = [
  //"访校",
  //"活动",
  //"汇报",
  //"照片",
  "项目文档",
  "总结报告",
  "访校报告",
  "说明文件",
  "学校照片",
  "其它",
];

db.DOSSIER_CATEGORIES = [
  "项目申请",
  "项目计划书",
  "项目预算",
  "项目协议",
  "说明文件",
  "总结报告",
  "项目图片",
  "学校反馈",
  "请款单"
];



db.MATERIAL_CATEGORIES = [
  "证书",
  "照片",
];

db.AWARD_TYPES = [
  "学校",
  "教师",
  "学生",
];

db.AWARD_CATEGORIES = [
  "国家级",
  "省级",
  "地区级",
  "县级",
];

db.PROJECT_STATUSES = [
  "申请",
  "实施",
  "完成",
  //"已完成",
];

db.SCHOOL_STAGES = [
  //"捐款到位",
  //"审核考察",
  "建校阶段",
  //"项目实施",
  "持续支持", //"后续支持",
  "项目学校",
  //"一期支票",
  //"项目冻结",
  "非持续支持",
  "暂停支持",
  "终止支持",
  "待填"
];

db.SCHOOL_STATUSES = [
  "原欣欣学校",
  "并校",
  "重建",
  "迁移",
];

db.SCHOOL_STATUSES_SS = [
  "原欣欣学校",
  "变动保留",
  //"并校",
  //"重建",
  //"搬迁",
  "中心校加入",
  "替代加入",
  "撤并再续",
  "失联",
  "暂停联系",
  "撤并退出",
  //"已撤并",
  //"未建成",
  "非常规欣欣学校",
  "待填"
];

db.SCHOOL_REQUESTS = [
  "基础设施",
  "教学设备",
  "师资培训",
  //"暂停支持",
  //"终止支持",
  "待填"
];

db.SCHOOL_REQUESTS_SS = [
  "基础设施",
  "教学设备",
  "师资培训",
  //"暂停支持",
  //"终止支持",
  "待填"
];

db.SCHOOL_CATEGORIES = [
  "村小",
  "教学点",
  "完全小学",
  "中心小学",
  "九年制",
  "初中",
  "特教学校"
];

db.SCHOOL_IMPORTANT_FIELDS = [
  {name: "principal", label: "校长"},
  {name: "contact", label: "联络人"},
  {name: "studentsCount", label: "学生人数"},
  {name: "teachersCount", label: "教师人数"},
  {name: "classesCount", label: "总班级数"},
  {name: "gradesCount", label: "总年级数"},
  {name: "stage", label: "学校阶段"},
  {name: "status", label: "学校状态"},
  {name: "request", label: "学校需求"},
  {name: "code", label: "学校编号"},
  {name: "name", label: "欣欣学校名称"},
  {name: "schoolBoardRegisteredName", label: "教育局注册校名"},
  {name: "schoolBoard", label: "教育局名称"},
  {name: "city", label: "市"},
  {name: "county", label: "区/县"},
  {name: "community", label: "乡/镇"},
  {name: "address", label: "地址"},
  {name: "phone", label: "学校电话"},
  {name: "email", label: "学校电子邮箱"},
];

/**
db.REGIONS = [
"山东",
"江苏",
"河南",
"陕西",
"湖南",
"湖南湘西",
"重庆",
"福建",
"云南",
"四川",
"广西",
"安徽",
"海南",
"江西",
"湖北",
"山西",
"辽宁",
"黑龙江",
"内蒙古",
"贵州",
"甘肃",
"青海",
"新疆",
"西藏",
"吉林",
"宁夏"
];

*/

db.REGIONS = [
"黑龙江省",
"吉林省",
"辽宁省",
"陕西省",
"青海省",
"甘肃省",
"湖南省",
//"湖南省湘西州",
"湖北省",
"四川省",
"贵州省",
"山东省",
"山西省",
"江西省",
"江苏省",
"安徽省",
"河南省",
"云南省",
"福建省",
"海南省",
"重庆市",
"河北省",
"广西壮族自治区",
"内蒙古自治区",
"宁夏回族自治区",
"新疆维吾尔族自治区",
"西藏自治区",
];

db.questionaires.hasMany(db.feedbacks, {foreignKey: 'questionaireId'}, {as: 'Feedbacks'})
db.feedbacks.belongsTo(db.questionaires);

db.schools.hasMany(db.feedbacks, {foreignKey: 'schoolId'}, {as: 'Feedbacks'})
db.feedbacks.belongsTo(db.schools);

db.forms.hasMany(db.responses, {foreignKey: 'formId'}, {as: 'Responses'})
db.responses.belongsTo(db.forms);

db.responses.hasMany(db.attachments, {foreignKey: 'responseId'}, {as: 'Attachments'}, {onDelete: 'cascade'})
db.attachments.belongsTo(db.responses);

db.schools.hasMany(db.documents, {foreignKey: 'schoolId'}, {as: 'Documents'})
db.documents.belongsTo(db.schools);

db.schools.hasMany(db.surveys, {foreignKey: 'schoolId'}, {as: 'Surveys'})
db.surveys.belongsTo(db.schools);

db.schools.hasMany(db.responses, {foreignKey: 'schoolId'}, {as: 'Responses'})
db.responses.belongsTo(db.schools);

db.user.hasMany(db.responses, {foreignKey: 'userId'}, {as: 'Responses'})
db.responses.belongsTo(db.user);

db.user.hasMany(db.comments, {foreignKey: 'userId'}, {as: 'Comments'})
db.comments.belongsTo(db.user);

db.user.hasMany(db.logs, {foreignKey: 'userId'}, {as: 'Logs'})
db.logs.belongsTo(db.user);

db.schools.hasMany(db.comments, {foreignKey: 'schoolId'}, {as: 'Comments'})
db.comments.belongsTo(db.schools);

db.schools.hasMany(db.user, {foreignKey: 'schoolId'}, {as: 'Users'});
db.schools.hasMany(db.user, {as: 'Utilisateurs', foreignKey: 'schoolId'});
db.user.belongsTo(db.schools);

db.schools.hasMany(db.logs, {foreignKey: 'schoolId'}, {as: 'Logs'});
db.logs.belongsTo(db.schools);

db.responses.hasMany(db.projects, {foreignKey: 'responseId'}, {as: 'Projects'});
db.projects.belongsTo(db.responses);

db.schools.hasMany(db.projects, {foreignKey: 'schoolId'}, {as: 'Projects'})
db.projects.belongsTo(db.schools);

db.projects.hasMany(db.dossiers, {foreignKey: 'projectId'}, {as: 'Dossiers'})
db.dossiers.belongsTo(db.projects);

db.donors.hasMany(db.designations, {foreignKey: 'donorId'}, {as: 'Designations'})
db.designations.belongsTo(db.donors);

db.donors.hasMany(db.donations, {foreignKey: 'donorId'}, {as: 'Donations'})
db.donations.belongsTo(db.donors);

db.projects.hasMany(db.designations, {foreignKey: 'projectId'}, {as: 'Designations'})
db.designations.belongsTo(db.projects);

db.donations.hasMany(db.designations, {foreignKey: 'donationId'}, {as: 'Designations'})
db.designations.belongsTo(db.donations);

db.user.hasMany(db.designations, {foreignKey: 'userId'}, {as: 'Designations'})
db.designations.belongsTo(db.user);

db.schools.hasMany(db.awards, {foreignKey: 'schoolId'}, {as: 'Awards'})
db.awards.belongsTo(db.schools);

db.awards.hasMany(db.materials, {foreignKey: 'awardId'}, {as: 'Materials'})
db.materials.belongsTo(db.awards);

module.exports = db;

