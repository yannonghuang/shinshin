module.exports = (sequelize, Sequelize) => {
  const Staging_Form = sequelize.define("staging_form", {
    title: {
      type: Sequelize.STRING
    },
    q_id: {
      type: Sequelize.INTEGER
    },
    q_text: {
      type: Sequelize.STRING
    },
    input_type: {
      type: Sequelize.STRING
    },
    data_field_name: {
      type: Sequelize.STRING
    },
    options: {
      type: Sequelize.STRING
    },
  });

  return Staging_Form;
};