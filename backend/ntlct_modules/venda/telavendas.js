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




router.route('/recarregarValoresListaPreço/:idlista/:produtos').get(function(req, res) {
    
    var select = "SELECT id AS 'id', nm_descricao AS 'nome' FROM simples_nacional  ";

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