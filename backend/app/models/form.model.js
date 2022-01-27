module.exports = (sequelize, Sequelize) => {
  const Form = sequelize.define("form", {
    title: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.STRING(4096)
    },
    published: {
      type: Sequelize.BOOLEAN
    },
    fdata: {
      type: Sequelize.JSON,
    },
    deadline: {
      type: Sequelize.DATE,
    },
  });

  return Form;
};