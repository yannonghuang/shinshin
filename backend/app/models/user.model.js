module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    username: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },
    chineseName: {
      type: Sequelize.STRING
    },
    phone: {
      type: Sequelize.STRING
    },
    wechat: {
      type: Sequelize.STRING
    },
    startAt: {
      type: Sequelize.DATE
    },
    lastLogin: {
      type: Sequelize.DATE
    },
  });

  return User;
};
