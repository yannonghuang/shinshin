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
        'city',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
      ),

      queryInterface.addColumn(
        'schools',
        'county',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
      ),

      queryInterface.addColumn(
        'schools',
        'community',
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

      queryInterface.removeColumn('schools', 'city'),
      queryInterface.removeColumn('schools', 'county'),
      queryInterface.removeColumn('schools', 'community'),
    ]);
  }
};
