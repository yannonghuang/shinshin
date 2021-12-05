module.exports = (sequelize, Sequelize) => {
  const Region = sequelize.define("regions", {
    name: {
      type: Sequelize.STRING
    },
  });

  return Region;
};
