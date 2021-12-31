module.exports = (sequelize, Sequelize) => {
  const Log = sequelize.define("logs", {
    field: {
      type: Sequelize.STRING
    },
    oldv: {
      type: Sequelize.STRING
    },
    newv: {
      type: Sequelize.STRING
    },
  });

  return Log;
};
