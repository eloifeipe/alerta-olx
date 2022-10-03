//Carregando as bibliotecas
const express = require("express");
const app = require('express')()
const http = require('http').createServer(app)
const bodyParser = require("body-parser");

//Carrega a conexão do banco 
const connection = require("./database/connection");
const Banco = require("./olx/Banco");
const Pesquisa = require("./olx/Pesquisa");

//Olx page
const olx = require("./olx/olx");

//views engine
app.set('view engine', 'ejs');

//Arquivos estáticos (css)
app.use(express.static('public'));

//body-parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//conecta com o banco
connection
    .authenticate()
    .then(() => {
        console.log("Banco carregado");
    }).catch((error) => {
        console.log("Erro ao carregar o banco de dados: "+ error);
    });

//Rotas
app.get("/", (req, res)=>{
    Banco.findAll({ raw:true, order:[ ['data', 'DESC'] ]}).then(veiculos => {
        Pesquisa.findAll({raw:true, order:[['modelo']]}).then(pesquisas => {
            res.render("index",{
                namePage: 'BUSCA OLX',
                veiculos: veiculos,
                pesquisas: pesquisas
            });
        });
    });
});

app.get("/configuracoes", (req, res)=>{
    Pesquisa.findAll({raw:true, order:[['modelo']]}).then(pesquisas => {
        res.render("conf",{
            namePage: 'CONFIGURAÇÕES',
            pesquisas: pesquisas
        });
    });
});

app.get("/:modelo", (req,res) =>{
    let modelo = req.params.modelo;
    Banco.findAll({ raw:true, where: {modelo: modelo}, order:[ ['data', 'DESC'] ]}).then(veiculos => {
        if(veiculos.length != 0){
            Pesquisa.findAll({raw:true, order:[['modelo']]}).then(pesquisas => {
                res.render("index",{
                    namePage: 'BUSCA OLX',
                    veiculos: veiculos,
                    pesquisas: pesquisas
                });
            });
        }else{
            res.redirect("/");
        }
    });
});

//Subindo as páginas
let porta = 8080;
http.listen(porta, ()=>{
    console.log("Sistema iniciado na porta "+porta);
});
