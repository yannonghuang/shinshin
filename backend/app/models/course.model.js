module.exports = (sequelize, Sequelize) => {
  const Course = sequelize.define(
    "course",
    {
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING(4096),
      },
      category: {
        type: Sequelize.STRING,
      },
      subcategory: {
        type: Sequelize.STRING,
      },
    },
    {
      charset: "utf8mb4",
      collate: "utf8mb4_0900_ai_ci",
    }
  );

  return Course;
};
