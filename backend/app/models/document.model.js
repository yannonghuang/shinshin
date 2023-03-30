module.exports = (sequelize, Sequelize) => {
  const Document = sequelize.define("document", {
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
    docCategory: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.STRING
    },
    startAt: {
      type: Sequelize.DATE
    },        
  });

  return Document;
};
