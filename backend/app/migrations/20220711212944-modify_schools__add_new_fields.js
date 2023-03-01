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
        'schools',
        'classesCount',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
      ),

      queryInterface.addColumn(
        'schools',
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

      queryInterface.removeColumn('schools', 'classesCount'),
      queryInterface.removeColumn('schools', 'gradesCount'),
    ]);
  }
};
