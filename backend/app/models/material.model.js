module.exports = (sequelize, Sequelize) => {
  const Material = sequelize.define("material", {
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
  });

  return Material;
};
