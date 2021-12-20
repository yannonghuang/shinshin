module.exports = (sequelize, Sequelize) => {
  const Comment = sequelize.define("comment", {
    text: {
      type: Sequelize.STRING(1024)
    },
  });

  return Comment;
};
