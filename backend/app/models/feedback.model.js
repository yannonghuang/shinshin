module.exports = (sequelize, Sequelize) => {
  const Feedback = sequelize.define("feedback", {
    title: {
      type: Sequelize.STRING
    },
    respondant: {
      type: Sequelize.STRING
    },
    fdata: {
      //type: Sequelize.TEXT,
      type: Sequelize.JSON,
    },
    startAt: {
      type: Sequelize.DATE
    },
    pCategoryId: {
      type: Sequelize.INTEGER
    },
  });

  return Feedback;
};