module.exports = (sequelize, Sequelize) => {
  const Case = sequelize.define(
    "case",
    {
      description: {
        type: Sequelize.STRING(4096),
        allowNull: false,
      },
      schoolId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    },
    {
      charset: "utf8mb4",
      collate: "utf8mb4_0900_ai_ci",
    }
  );

  return Case;
};
