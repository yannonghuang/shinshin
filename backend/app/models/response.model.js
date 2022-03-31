module.exports = (sequelize, Sequelize) => {
  const Response = sequelize.define("response", {
    title: {
      type: Sequelize.STRING
    },
    fdata: {
      //type: Sequelize.TEXT,
      type: Sequelize.JSON,
    },
    startAt: {
      type: Sequelize.DATE
    },
    result_id: {
      type: Sequelize.INTEGER
    },
  });

  return Response;
};