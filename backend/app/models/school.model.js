module.exports = (sequelize, Sequelize) => {
  const School = sequelize.define("schools", {
    code: {
      type: Sequelize.STRING
    },
    name: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.STRING
    },
    principal: {
      type: Sequelize.STRING
    },
    photo: {
      type: Sequelize.BLOB('medium')
    },
    region: {
      type: Sequelize.STRING
    },
    address: {
      type: Sequelize.STRING
    },
    phone: {
      type: Sequelize.STRING
    },
    studentsCount: {
      type: Sequelize.INTEGER
    },
    teachersCount: {
      type: Sequelize.INTEGER
    },
    startAt: {
      type: Sequelize.DATE
    },
  });

  return School;
};
