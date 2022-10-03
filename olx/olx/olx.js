//const fs = require('fs');
const got = require('got');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const Banco = require('./Banco');
const Pesquisa = require('./Pesquisa');
const nodemailer = require("nodemailer");
const smtpTransport = require('nodemailer-smtp-transport');
const mes = {jan:1, fev:2, mar:3, abr:4, mai:5, jun:6, jul:7,ago:8,set:9,out:10,nov:11,dez:12};

initBusca(false);

setInterval(() => {
    initBusca(true);
}, 120000);


function initBusca(startMail) {
    Pesquisa.findAll({ raw:true, order:[ ['id'] ]}).then(buscas => {
        buscas.forEach( busca =>{
            init(busca.link, busca.modelo, startMail);
        });
    });    
}

////////////// ACESSA O OLX E BUSCA A PÁGINA PARA VERIFICAÇÂO /////////////////
function init(vgmUrl, modelo, startMail) {
    got(vgmUrl).then(response => {
        let arrayVeiculos=[];
        
        const dom = new JSDOM(response.body);
        let array = dom.window.document.getElementById('ad-list').querySelectorAll('.sc-1fcmfeb-2');
        let contador = 0;
        
        let limit = 10;
        if(modelo == 'FIT' || modelo == 'FOX'){
            limit = 20;
        }
        
        array.forEach((element) => {
            let valorDiv = element.querySelector('.hRScWw');
            
            if(valorDiv){
                if(contador < limit){
                    contador++;
                    let info = element.querySelector('.fnmrjs-6');
                    let dataString = element.querySelector('.wlwg1t-1').textContent.split(' ', 2);
                    let today = new Date();
                    let data

                    if(dataString[0] == 'Ontem'){
                        data = new Date(today.setDate(today.getDate() - 1))
                    }else if(dataString[0] == 'Hoje'){
                        data = today
                    }else{
                        data = new Date(mes[dataString[1]]+'/'+dataString[0]+'/'+2021)
                    }

                    let anuncio = {
                        title: info.querySelector('.sc-1mbetcw-0').textContent,
                        valor: valorDiv.querySelector('.eoKYee').textContent,
                        info: info.querySelector('.eLPYJb').textContent,
                        local: element.querySelector('.sc-7l84qu-1').textContent,
                        link: element.querySelector('a').href,
                        imagem: element.querySelector('img').src,
                        codigo: element.querySelector('a').href.replace(/\D+/g, ''),
                        modelo: modelo,
                        data: data,
                        dataString: dataString
                    }
                    arrayVeiculos.push(anuncio)
                }
            }
        });

        addVeiculo(arrayVeiculos, modelo, startMail);
        
    }).catch(err => {
        console.log(err);
    });
}

/////////////////////////// FUNÇÂO PRINCIPAL DE VERIFICAÇÂO ///////////////////////

function addVeiculo(listVeiculo, modelo, startMail) {

    let existe = [];
    Banco.findAll({ where:{modelo: modelo},raw:true, order:[ ['id'] ]}).then(carros => {
        carros.forEach(carro => {
            existe.push({
                codigo: carro.codigo,
                title: carro.title,
                valor: carro.valor
            });
        });

        listVeiculo.forEach(carro => {
            let run = true;
            existe.forEach(codExist => {
                if(carro.codigo == codExist.codigo){
                    run = false
                }
            });

            if(run){
                addNewVeiculo(carro, startMail);   
            }
        });

        existe.forEach(codExist => {
            let delVeiculo = true;
            listVeiculo.forEach(carro => {
                if(carro.codigo == codExist.codigo){
                    delVeiculo = false;
                }
            })
            if(delVeiculo){
                removeVeiculo(codExist)
            }

        })

    });

}

function addNewVeiculo(carro, startMail) {
    Banco.create({ 
        title: carro.title,
        valor: carro.valor,
        info: carro.info,
        local: carro.local,
        link: carro.link,
        imagem: carro.imagem,
        codigo: carro.codigo,
        modelo: carro.modelo,
        data: carro.data
    }).then(() => {
        console.log('ADD '+carro.title+' - '+carro.valor);
        if(startMail && carro.dataString == 'Hoje'){
            email(carro); ////////////EMAiL//////////////
        }
    }).catch(error => {
        console.log('ERRO '+carro.title);
    })
}

////////////////  FUNÇÃO REMOVE VEÍCULO VENDIDO  ////////////////////
function removeVeiculo(carro) {
    Banco.destroy(
        {where: {codigo: carro.codigo}}
    ).then(() =>{
        console.log('Removido '+carro.title+' - '+carro.valor);
    }).catch(error => {
        console.log('Erro ao remover veículo');
    })
}


/////////////////// FUNÇÃO DE ENVIO DE E-MAIL ////////////////////////
function email(veiculo) {
    let infoMail =  `   <p style="text-align: center;"><strong>${veiculo.title}</strong></p>
                        <p style="text-align: center;">${veiculo.valor}</p>
                        <p style="text-align: center;">${veiculo.link}</p>
                        <p style="text-align: center;">${veiculo.info}</p>
                        <p style="text-align: center;">${veiculo.local}</p>
                        <p style="text-align: center;">${veiculo.dataString}</p>`

    let transporter = nodemailer.createTransport(smtpTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            auth: {
            user: 'SeuEmail@gmail.com',
            pass: 'SuaSenha'
            }
        })
      );
      
      let mailOptions = {
        from: 'SeuEmail@gmail.com',
        to: 'EmailQueSeraAlertado@gmail.com',
        subject: veiculo.title,
        text: 'Veiculo encontrado!',
        html: infoMail,
        attachments: [{path: veiculo.imagem}]
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('E-mail enviado: ' + info.response);
        }
      });  
}

/////////////   MANIPULAÇÂO DE PESQUISA   ////////////

function addPesquisa (modelo, link){
    Pesquisa.create({ 
        link: link,
        modelo: modelo
    }).then(() => {
        console.log('ADD PESQUISA '+modelo);
    }).catch(error => {
        console.log('ERRO '+modelo);
    })    
}

//Exemplo de função para add pesquisa
//addPesquisa('FIT', 'https://rj.olx.com.br/rio-de-janeiro-e-regiao/autos-e-pecas/carros-vans-e-utilitarios/honda/fit?f=p&me=100000&ms=5000&pe=50000&ps=10000&rs=27&sf=1')
//addPesquisa('ETIOS', 'https://rj.olx.com.br/rio-de-janeiro-e-regiao/autos-e-pecas/carros-vans-e-utilitarios/toyota/etios?f=p&me=100000&ms=5000&pe=40000&ps=10000&rs=31&sf=1')

//Exemplo de função para remover pesquisa
//removePesquisa('FIT')
function removePesquisa(modelo) {
    Pesquisa.destroy(
        {where: {modelo: modelo}}
    ).then(() =>{
        console.log('Removido '+modelo);
    }).catch(error => {
        console.log('Erro ao remover pesquisa '+modelo);
    })
}

