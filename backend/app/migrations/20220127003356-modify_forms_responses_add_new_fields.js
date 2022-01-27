'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return Promise.all([

      queryInterface.addColumn(
        'forms',
        'startAt',
        {
          type: Sequelize.DATE,
          allowNull: true,
        },
      ),
      queryInterface.addColumn(
        'responses',
        'startAt',
        {
          type: Sequelize.DATE,
          allowNull: true,
        },
      ),

    ]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return Promise.all([

      queryInterface.removeColumn('forms', 'startAt'),
      queryInterface.removeColumn('responses', 'startAt'),
    ]);
  }
};
