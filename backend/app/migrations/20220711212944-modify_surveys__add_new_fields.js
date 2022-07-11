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
        'surveys',
        'classesCount',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
      ),

      queryInterface.addColumn(
        'surveys',
        'gradesCount',
        {
          type: Sequelize.INTEGER,
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

      queryInterface.removeColumn('surveys', 'classesCount'),
      queryInterface.removeColumn('surveys', 'gradesCount'),

    ]);
  }
};
