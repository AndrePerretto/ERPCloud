const server = require('../../../config/server');
const express = require('express');
const router = express.Router();
const sql = require("mssql");
const general = require('../../../api/general');
server.use('/custom_modules/broker/servicos/movimentacaoservicos', router);
var serverWindows = "";
var configEnvironment = {};
var EnterpriseID = "";
var EnterpriseName = "";
var UserID = "";
var base = "";
var url = "";
var host = "";
var config = {};

router.route('/*').get(function(req, res, next) {
    var full = req.host;
    var parts = full.split('.');
    var dados = "";
    if (parts.length > 3) {
        dados = parts[0];
    }
    host = dados;
    dados = dados.replace("http://","");   
    if(full.indexOf("localhost") > -1){
        serverWindows = "http://localhost:2444";
        dados = "broker";
        configEnvironment = {user: 'sa', password: 'IntSql2015@', server: '127.0.0.1',  database: 'Environment'};
    }else{
        serverWindows = "http://" + dados + ".empresariocloud.com.br";
        configEnvironment = {user: 'sa', password: 'IntSql2015@', server: '172.31.8.216',  database: 'Environment'};
    }                    
    var database = "";
    var server = "";
    var password = "";
    var user = "";    var select = "SELECT id AS idempresa,nm_CompanyName nome,nm_DatabaseName_Aplication AS 'database',  ";
    select += " nm_ServerIP_Aplication AS 'server', ";
    select += " password_Aplication AS 'password', ";
    select += " nm_User_Aplication AS 'user', ";
    select += " nm_mongodb AS mongodb ";
    select += " FROM Enterprise WHERE domainName='" + dados + "' ";  
    sql.close();
    sql.connect(configEnvironment, function (err) {  
        if (err) console.log(err);
        var request = new sql.Request();
        request.query(select, function (err, recordset) {    
            if (err) console.log(err)
            if(recordset.recordsets[0].length > 0){
                const element = recordset.recordsets[0][0];
                database = element.database;
                server = element.server;
                password = element.password;
                user = element.user;
                EnterpriseID = element.idempresa;
                EnterpriseName = element.nome;
                base = element.mongodb;
                url = "mongodb://localhost:27017/" + base;
                config = {user: user, password: password, server: server,  database: database};
                next();
            }
        });
    });    
});    

//* servicos/movimentacaoservicos/testesoma 

router.route('/testesoma/:param1/:param2').get(function(req, res) {
var param1 = req.param('param1');
var param2 = req.param('param2');

 res.send(param1 + ' - ' + param2);
});
//% servicos/movimentacaoservicos/testesoma 
 

//* servicos/movimentacaoservicos/carregaSubServico 

router.route('/carregaSubServico/:idProdutos').get(function(req, res) {
var idProdutos = req.param('idProdutos');


     sql.close();
 sql.connect(config, function (err) {
 if (err) console.log(err); 
 var select = "SELECT produtos.id AS 'id', produtos.nm_descricao AS 'desc', produtos.id_dsg_moeda AS 'moeda' , produtos.vl_precovenda AS 'precovenda'  FROM produtos_subservicos INNER JOIN produtos ON produtos.id=produtos_subservicos.id_subservicos WHERE produtos_subservicos.id_produtos='" + idProdutos + "'";
 var request = new sql.Request();
 request.query(select, function (err, recordset){ 
 if (err) console.log(err); 
 res.send(recordset);
 });
});

});
//% servicos/movimentacaoservicos/carregaSubServico 
