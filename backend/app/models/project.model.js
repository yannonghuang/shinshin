module.exports = (sequelize, Sequelize) => {
  const Project = sequelize.define("projects", {
    name: {
      type: Sequelize.STRING
    },
    budget: {
      type: Sequelize.DECIMAL(13,2)
    },
    photo: {
      type: Sequelize.BLOB('medium')
    },
    status: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.STRING
    },
    startAt: {
      type: Sequelize.DATE
    },
    xr: {
      type: Sequelize.BOOLEAN
    },
    pCategoryId: {
      type: Sequelize.INTEGER
    },
    pSubCategoryId: {
      type: Sequelize.INTEGER
    }, 
    quantity1: {
      type: Sequelize.INTEGER
    },  
    quantity2: {
      type: Sequelize.INTEGER
    },       
    quantity3: {
      type: Sequelize.INTEGER
    },            
  });

  return Project;
};
