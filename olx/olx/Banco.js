const Sequelize = require("sequelize");
const connection = require("../database/connection");

const Veiculos = connection.define("veiculos",{
    codigo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    valor: {
        type: Sequelize.STRING,
        allowNull: false
    },
    local: {
        type: Sequelize.STRING,
        allowNull: true
    },
    info: {
        type: Sequelize.STRING,
        allowNull: false
    },
    link: {
        type: Sequelize.STRING,
        allowNull: false
    },
    imagem: {
        type: Sequelize.STRING,
        allowNull: true
    },
    modelo: {
        type: Sequelize.STRING,
        allowNull: true
    },
    data: {
        type: Sequelize.DATE,
        allowNull: true
    }
});

Veiculos.sync({force: false});

module.exports = Veiculos;