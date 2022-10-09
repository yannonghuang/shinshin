module.exports = (sequelize, Sequelize) => {
  const Donor = sequelize.define("donors", {
    donor: {
      type: Sequelize.STRING
    },
    name: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    phone: {
      type: Sequelize.STRING
    },
    billingAddress: {
      type: Sequelize.STRING
    },
    shippingAddress: {
      type: Sequelize.STRING
    },
    photo: {
      type: Sequelize.BLOB('medium')
    },
  });

  return Donor;
};
