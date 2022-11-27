module.exports = (sequelize, Sequelize) => {
  const Questionaire = sequelize.define("questionaire", {
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
    pCategoryId: {
      type: Sequelize.INTEGER
    },
    multipleAllowed: {
      type: Sequelize.BOOLEAN
    },
  });

  return Questionaire;
};