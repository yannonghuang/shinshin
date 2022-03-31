module.exports = {
  //HOST: "192.168.86.71",
  HOST: "localhost",
  USER: "root",
  PASSWORD: "jing9193",
  DB: "nodedb",
  //dialect: "mariadb",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
