module.exports = (sequelize, Sequelize) => {
  const School = sequelize.define("schools", {
    code: {
      type: Sequelize.INTEGER
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
    contact: {
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
    city: {
      type: Sequelize.STRING
    },
    county: {
      type: Sequelize.STRING
    },
    community: {
      type: Sequelize.STRING
    },
    principalId: {
      type: Sequelize.INTEGER
    },
    contactId: {
      type: Sequelize.INTEGER
    },
    xr: {
      type: Sequelize.BOOLEAN
    },
    classesCount: {
      type: Sequelize.INTEGER
    },
    gradesCount: {
      type: Sequelize.INTEGER
    },
  });

  return School;
};
