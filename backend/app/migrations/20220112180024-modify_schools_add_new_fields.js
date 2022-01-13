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
        'lastVisit',
        {
          type: Sequelize.DATE,
          allowNull: true,
        },
      ),

      queryInterface.addColumn(
        'schools',
        'donor',
        {
          type: Sequelize.STRING,
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
      queryInterface.removeColumn('schools', 'lastVisit'),
      queryInterface.removeColumn('schools', 'donor'),
    ]);
  }
};
