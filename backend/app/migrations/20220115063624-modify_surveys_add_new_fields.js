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
        'principalId',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
      ),

      queryInterface.addColumn(
        'surveys',
        'contactId',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
      ),

      queryInterface.addColumn(
        'surveys',
        'city',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
      ),

      queryInterface.addColumn(
        'surveys',
        'county',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
      ),

      queryInterface.addColumn(
        'surveys',
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

      queryInterface.removeColumn('surveys', 'principalId'),
      queryInterface.removeColumn('surveys', 'contactId'),
      queryInterface.removeColumn('surveys', 'city'),
      queryInterface.removeColumn('surveys', 'county'),
      queryInterface.removeColumn('surveys', 'community'),      
    ]);
  }
};
