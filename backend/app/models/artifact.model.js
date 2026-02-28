module.exports = (sequelize, Sequelize) => {
  const Artifact = sequelize.define(
    "artifact",
    {
      description: {
        type: Sequelize.STRING(4096),
      },
      category: {
        type: Sequelize.STRING,
      },
      attachmentPath: {
        type: Sequelize.STRING(1024),
        allowNull: false,
      },
      attachmentName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      attachmentMime: {
        type: Sequelize.STRING,
      },
      attachmentSize: {
        type: Sequelize.BIGINT,
      },
      type: {
        type: Sequelize.ENUM("doc", "pdf", "video", "audio"),
        allowNull: false,
      },
    },
    {
      charset: "utf8mb4",
      collate: "utf8mb4_0900_ai_ci",
    }
  );

  return Artifact;
};
