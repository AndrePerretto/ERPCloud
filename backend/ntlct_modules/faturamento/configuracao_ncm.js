const server = require('../../config/server')
const express = require('express')
const router = express.Router();
const sql = require("mssql");
const general = require('../../api/general')
//const funcoesFinanceiro = require("./financeiro");
//const prefixoModulo = "ContasReceber_";

server.use('/ntlct_modules/faturamento/configuracao_ncm', router);

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

/*-------------------------------------------------------------------------------
Retorna a lista do combo
---------------------------------------------------------------------------------
*/
router.route('/listaCboCatNcm').post(function(req, res) {
    var resposta = null;
    var filtro_ncm = req.body.filtro_ncm;

    console.log('-------------');
    console.log(req.body);
    console.log(filtro_ncm);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed

    try{
        resposta = {
            status: 0,
            mensagem: [],
            categoriaNcm: []
        }

        sql.close();
        sql.connect(config, function (err) {
            if (err){
                resposta = {
                    status: 1,
                    mensagem: ["" + err],
                    categoriaNcm: []
                }
                res.json(resposta);
            }
            else{
                /* Filtro Ncm */
                var request = new sql.Request();
                var query="";
                if(filtro_ncm == 'nada' || filtro_ncm == '' || filtro_ncm == 'null' || filtro_ncm == null || filtro_ncm == 'undefined'){
                    query = "SELECT nm_categoria id, nm_categoria descricao FROM dsg_ncm GROUP BY nm_categoria ORDER BY nm_categoria"
                }else{
                    query = "SELECT id, nm_descricao descricao FROM dsg_ncm WHERE nm_categoria = '" + filtro_ncm + "' ORDER BY nm_descricao"
                }
                request.query(query, function (err, recordset) {
                    if (err){
                        resposta = {
                            status: 2,
                            mensagem: ["" + err],
                            categoriaNcm: []
                        }
                        res.json(resposta);
                    }
                    else{
                        var element = recordset.recordsets[0];
                        /* 
                        for(var i = 0; i < element.length; i++){
                            categoriaNcm = {
                                id: element[i].id,
                                descricao: element[i].nm_categoria
                            }
                            resposta.categoriaNcm.push(categoriaNcm);
                        } 
                        */
                        resposta.categoriaNcm = element;
                        res.json(resposta);
                    }
                })
            }
        })
    }
    catch(erro){
        resposta = {
            status: -1,
            mensagem: ["" + erro],
            categoriaNcm: []
        }
        sql.close();
        res.json(resposta);
    }
})



router.route('/carregaTabelasSimples').get(function(req, res) {
    
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