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
    stage: {
      type: Sequelize.STRING
    },
    status: {
      type: Sequelize.STRING
    },
    request: {
      type: Sequelize.STRING
    },
    category: {
      type: Sequelize.STRING
    },
    lastVisit: {
      type: Sequelize.DATE
    },
    donor: {
      type: Sequelize.STRING
    },
  });

  return School;
};
