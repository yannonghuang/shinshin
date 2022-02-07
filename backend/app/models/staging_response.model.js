module.exports = (sequelize, Sequelize) => {
  const Staging_Response = sequelize.define("staging_response", {
    title: {
      type: Sequelize.STRING
    },
    q_id: {
      type: Sequelize.INTEGER
    },
    q_value: {
      type: Sequelize.STRING
    },
  });

  return Staging_Response;
};