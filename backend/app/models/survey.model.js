module.exports = (sequelize, Sequelize) => {
  const Survey = sequelize.define("surveys", {
    status: {
      type: Sequelize.STRING
    },
    request: {
      type: Sequelize.STRING
    },
    address: {
      type: Sequelize.STRING
    },
    region: {
      type: Sequelize.STRING
    },
    schoolBoardRegisteredName: {
      type: Sequelize.STRING
    },
    schoolBoard: {
      type: Sequelize.STRING
    },
    phone: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    principal: {
      type: Sequelize.STRING
    },
    principalCell: {
      type: Sequelize.STRING
    },
    principalWechat: {
      type: Sequelize.STRING
    },
    contact: {
      type: Sequelize.STRING
    },
    contactCell: {
      type: Sequelize.STRING
    },
    contactWechat: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.STRING
    },
    category: {
      type: Sequelize.STRING
    },
    studentsCount: {
      type: Sequelize.INTEGER
    },
    stayBehindCount: {
      type: Sequelize.INTEGER
    },
    boarderCount: {
      type: Sequelize.INTEGER
    },
    teachersCount: {
      type: Sequelize.INTEGER
    },
    kClassesCount: {
      type: Sequelize.INTEGER
    },
    g1ClassesCount: {
      type: Sequelize.INTEGER
    },
    g2ClassesCount: {
      type: Sequelize.INTEGER
    },
    g3ClassesCount: {
      type: Sequelize.INTEGER
    },
    g4ClassesCount: {
      type: Sequelize.INTEGER
    },
    g5ClassesCount: {
      type: Sequelize.INTEGER
    },
    g6ClassesCount: {
      type: Sequelize.INTEGER
    },

    kStudentsCount: {
      type: Sequelize.INTEGER
    },
    g1StudentsCount: {
      type: Sequelize.INTEGER
    },
    g2StudentsCount: {
      type: Sequelize.INTEGER
    },
    g3StudentsCount: {
      type: Sequelize.INTEGER
    },
    g4StudentsCount: {
      type: Sequelize.INTEGER
    },
    g5StudentsCount: {
      type: Sequelize.INTEGER
    },
    g6StudentsCount: {
      type: Sequelize.INTEGER
    },
    mStudentsCount: {
      type: Sequelize.INTEGER
    },
    computersCount: {
      type: Sequelize.INTEGER
    },
    computerRoomExists: {
      type: Sequelize.BOOLEAN
    },
    computerRoomCount: {
      type: Sequelize.INTEGER
    },
    internetExists: {
      type: Sequelize.BOOLEAN
    },
    multimediaSystemsCount: {
      type: Sequelize.INTEGER
    },
    libraryExists: {
      type: Sequelize.BOOLEAN
    },
    bookCornersCount: {
      type: Sequelize.INTEGER
    },
    booksCount: {
      type: Sequelize.INTEGER
    },
  });

  return Survey;
};
