const Sequelize = require("sequelize");
const connection = require("../database/connection");

const Pesquisa = connection.define("pesquisa",{
    link: {
        type: Sequelize.STRING,
        allowNull: false
    },
    modelo: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

Pesquisa.sync({force: false});

module.exports = Pesquisa;