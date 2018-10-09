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


router.route('/carregaListaServicos/:identidade/:datade/:dataate').get(function(req, res) {
    var idEntidade = req.param("identidade");
    var dataDe = req.param("datade");
    var dataAte = req.param("dataate");
    
    var where = "";
    var select = "SELECT movimentacao_servicos.id AS 'id', ";
    select += " FORMAT(movimentacao_servicos.dt_emissao, 'd', 'pt-BR' )  AS 'dt_emissao', ";
    select += " entidade.nm_razaosocial AS 'razaosocial', ";
    select += " prod.nm_descricao AS 'descrprod', ";
    select += " sub.nm_descricao AS 'descrsub', ";
    select += " FORMAT(movimentacao_servicos.dt_faturamento, 'd', 'pt-BR' )  AS 'dt_faturamento', ";
    select += " movimentacao_servicos.nm_numero_nfes AS 'numero_nfes', ";
    select += " movimentacao_servicos.nm_numero_boleto AS 'numero_boleto' ";
    select += " FROM movimentacao_servicos ";
    select += " INNER JOIN produtos sub ON sub.id=movimentacao_servicos.id_subservicos ";
    select += " INNER JOIN produtos prod ON prod.id=movimentacao_servicos.id_produtos ";
    select += " INNER JOIN entidade ON entidade.id=movimentacao_servicos.id_entidade ";
    
    if(idEntidade){
        if(idEntidade != "*"){
            where = " WHERE movimentacao_servicos.id_entidade='" + idEntidade + "' ";
        }
    }    
    
    if(dataDe){
        if(dataDe != "*"){
            dataDe = dataDe.replace("-","/")
            dataDe = dataDe.replace("-","/")
            if(!where){
                where = " WHERE FORMAT(movimentacao_servicos.dt_emissao, 'd', 'pt-BR' ) >= '" + dataDe + "' ";
            }else{
                where = " AND FORMAT(movimentacao_servicos.dt_emissao, 'd', 'pt-BR' ) >= '" + dataDe + "' ";
            }
        }
    }

    if(dataAte){
        if(dataAte != "*"){
            dataAte = dataAte.replace("-","/")
            dataAte = dataAte.replace("-","/")
            if(!where){
                where = " WHERE FORMAT(movimentacao_servicos.dt_emissao, 'd', 'pt-BR' ) <= '" + dataAte + "' ";
            }else{
                where = " AND FORMAT(movimentacao_servicos.dt_emissao, 'd', 'pt-BR' ) <= '" + dataAte + "' ";
            }
        }
    }

    select = select + where;
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