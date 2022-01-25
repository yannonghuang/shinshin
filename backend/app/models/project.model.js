module.exports = (sequelize, Sequelize) => {
  const Project = sequelize.define("projects", {
    name: {
      type: Sequelize.STRING
    },
    budget: {
      type: Sequelize.DECIMAL(13,2)
    },
    photo: {
      type: Sequelize.BLOB('medium')
    },
    status: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.STRING
    },
    startAt: {
      type: Sequelize.DATE
    },
  });

  return Project;
};
