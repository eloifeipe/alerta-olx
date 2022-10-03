const Sequilize = require("sequelize"); 

const connection = new Sequilize('databseDb', 'usuarioDb', 'senhaDb',{
    host: 'localhost',
    dialect: 'mysql',
    logging:false
});

module.exports = connection;