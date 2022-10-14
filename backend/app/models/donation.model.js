module.exports = (sequelize, Sequelize) => {
  const Donation = sequelize.define("donations", {
    startAt: {
      type: Sequelize.DATE
    },
    transaction: {
      type: Sequelize.INTEGER
    },
    type: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.STRING
    },
    amount: {
      type: Sequelize.DECIMAL(13,2)
    },
  });

  return Donation;
};
