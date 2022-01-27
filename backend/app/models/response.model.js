module.exports = (sequelize, Sequelize) => {
  const Response = sequelize.define("response", {
    title: {
      type: Sequelize.STRING
    },
    fdata: {
      type: Sequelize.JSON,
    },
    startAt: {
      type: Sequelize.DATE
    },
  });

  return Response;
};