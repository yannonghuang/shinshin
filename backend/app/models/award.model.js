module.exports = (sequelize, Sequelize) => {
  const Award = sequelize.define("awards", {
    name: {
      type: Sequelize.STRING
    },
    photo: {
      type: Sequelize.BLOB('medium')
    },
    type: {
      type: Sequelize.STRING
    },
    category: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.STRING
    },
    startAt: {
      type: Sequelize.DATE
    },
  });

  return Award;
};
