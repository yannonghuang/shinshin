module.exports = (sequelize, Sequelize) => {
  const Designation = sequelize.define("designations", {
    startAt: {
      type: Sequelize.DATE
    },
    appellation: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.STRING
    },
    amount: {
      type: Sequelize.DECIMAL(13,2)
    },
    pCategoryId: {
      type: Sequelize.INTEGER
    },
  });

  return Designation;
};
