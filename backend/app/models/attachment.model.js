module.exports = (sequelize, Sequelize) => {
  const Attachment = sequelize.define("attachment", {
    originalname: {
      type: Sequelize.STRING
    },
    encoding: {
      type: Sequelize.STRING
    },
    mimetype: {
      type: Sequelize.STRING
    },
    destination: {
      type: Sequelize.STRING
    },
    filename: {
      type: Sequelize.STRING
    },
    path: {
      type: Sequelize.STRING
    },
  });

  return Attachment;
};
