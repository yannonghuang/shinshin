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
      //type: Sequelize.TEXT,
      type: Sequelize.JSON,
    },
    deadline: {
      type: Sequelize.DATE,
    },
    startAt: {
      type: Sequelize.DATE
    },
    form_id: {
      type: Sequelize.INTEGER
    },
    pCategoryId: {
      type: Sequelize.INTEGER
    },
    multipleAllowed: {
      type: Sequelize.BOOLEAN
    },
  });

  return Form;
};