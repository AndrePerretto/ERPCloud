const server = require('../../config/server')
const express = require('express')
const router = express.Router();
const sql = require("mssql");
const general = require('../../api/general')
//const funcoesFinanceiro = require("./financeiro");
//const prefixoModulo = "ContasReceber_";

server.use('/ntlct_modules/venda/telavendas', router);

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

    var full = req.host; //"http://homologa.empresarioerpcloud.com.br"; //
    var parts = full.split('.');
    var dados = "";
    if (parts.length > 3) {
        dados = parts[0];
    }
    host = dados;
    dados = dados.replace("http://","");

    if(full.indexOf("localhost") > -1){
        serverWindows = "http://localhost:2444";
        dados = "homologa";  
        configEnvironment = {user: 'sa', password: 'IntSql2015@', server: '127.0.0.1',  database: 'Environment'};
    }else{
        serverWindows = "http://" + dados + ".empresariocloud.com.br"; 
        configEnvironment = {user: 'sa', password: 'IntSql2015@', server: '172.31.8.216',  database: 'Environment'};
    }

    var database = ""; //"eCloud-homologa";
    var server = ""; //"127.0.0.1";
    var password = ""; //"1234567890";
    var user = ""; //"sa";

    var select = "SELECT id AS idempresa,nm_CompanyName nome,nm_DatabaseName_Aplication AS 'database',  ";
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
                //console.log(config);
                next();
            }
        });
    });    
});

router.route('/*').post(function(req, res, next) {

    var full = req.host; //"http://homologa.empresarioerpcloud.com.br"; //
    var parts = full.split('.');
    var dados = "";
    if (parts.length > 3) {
        dados = parts[0];
    }
    host = dados;
    dados = dados.replace("http://","");

    if(full.indexOf("localhost") > -1){
        serverWindows = "http://localhost:2444";
        dados = "homologa";  //"homologa"; //"foodtown";
        configEnvironment = {user: 'sa', password: 'IntSql2015@', server: '127.0.0.1',  database: 'Environment'};
    }else{
        serverWindows = "http://" + dados + ".empresariocloud.com.br"; //"http://localhost:2444";
        configEnvironment = {user: 'sa', password: 'IntSql2015@', server: '172.31.8.216',  database: 'Environment'};
    }

    var database = ""; //"eCloud-homologa";
    var server = ""; //"127.0.0.1";
    var password = ""; //"1234567890";
    var user = ""; //"sa";

    var select = "SELECT id AS idempresa,nm_CompanyName nome,nm_DatabaseName_Aplication AS 'database',  ";
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

router.route('/recarregarValoresListaPreco').post(function(req, res) {
    var parametros = req.body.parametros;
    var where = "";
    
    var idLista = "";
    where = " WHERE  ";

    if(parametros.id){
        idLista = parametros.id;
    }else{
        res.send("");
    }
    
    var Produtos = [];
    if(parametros){
        if(parametros.produtos){
            if(parametros.produtos.length > 0){
                Produtos = parametros.produtos;
            }
        }
    }

    if(!Produtos.length > 0){
        res.send("");
    }

    where += "  ( ";
    for (let index = 0; index < Produtos.length; index++) {
        if(index == 0){
            where += " produtos.id='" + Produtos[index] + "' "
        }else{
            where += " OR produtos.id='" + Produtos[index] + "' "
        }
    }
    where += " )";

    var select = "SELECT produtos.id AS 'id' , ";
    select += " IIF( ";
    select += " (SELECT precos_lista.vl_valor FROM precos_lista WHERE precos_lista.id_dsg_lista_preco='" + idLista + "'   ";
    select += " AND precos_lista.id_produtos=produtos.id) IS NOT NULL,  ";
    select += " (SELECT precos_lista.vl_valor FROM precos_lista WHERE precos_lista.id_dsg_lista_preco='" + idLista + "'   ";
    select += " AND precos_lista.id_produtos=produtos.id), ";
    select += " '0' ";
    select += "  ) AS 'valor' ";
    select += " FROM produtos ";
    select = select + where;
    console.log(select);

    sql.close(); 
    sql.connect(config, function (err) { 
        if (err) console.log(err); 
        var request = new sql.Request(); 
        request.query(select, function (err, recordset){ 
                if (err) console.log(err);
                
                res.send(recordset); 
        }); 
    }); 
});

router.route('/carregarPeso/:idproduto/:quantidade').get(function(req, res) {
    var idproduto = req.param('idproduto');
    var quantidade = req.param('quantidade');
    
    if(!quantidade){
        quantidade = "1";
    }

    var select = "SELECT (vl_pesobruto * " + quantidade + ") AS 'pesobruto', (vl_pesoliquido * " + quantidade + ") AS 'pesoliquido' FROM produtos ";
    select += " WHERE id='" + idproduto + "'";

    sql.close(); 
    sql.connect(config, function (err) { 
        if (err) console.log(err); 
        var request = new sql.Request(); 
        request.query(select, function (err, recordset){ 
                if (err) console.log(err);
                
                res.send(recordset); 
        }); 
    }); 
});