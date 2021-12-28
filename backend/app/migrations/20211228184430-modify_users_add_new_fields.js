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
        'users',
        'title',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
      ),

      queryInterface.addColumn(
        'users',
        'emailVerified',
        {
          type: Sequelize.BOOLEAN,
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
      queryInterface.removeColumn('users', 'title'),
      queryInterface.removeColumn('users', 'emailVerified'),
    ]);
  }
};
