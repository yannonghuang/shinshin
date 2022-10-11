module.exports = (sequelize, Sequelize) => {
  const Donation = sequelize.define("donations", {
    startAt: {
      type: Sequelize.DATE
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
