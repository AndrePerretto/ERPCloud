const server = require('../../config/server')
const express = require('express')
const router = express.Router()
const sql = require('mssql')
const general = require('../../api/general')

server.use('/ntlct_modules/produtos/buscacodsequencial', router);

var serverWindows = "";
var configEnvironment = {};
var EnterpriseID = "";
var UserID = "";
var base = "";
var url = "";
var host = "";
var config = {};

router.route('/*').get(function(req, res, next){
    var full = req.host;
    var parts = full.split('.');
    var dados = "";
    if(parts.length > 3) {
        dados = parts[0];
    }
    host = dados;
    dados = dados.replace("http://", "");
    
    if(full.indexOf("localhost") > -1) {
        serverWindows = "http://localhost:2444";
        dados = "hidrobombas";
        configEnvironment = {user: 'sa', password: 'IntSql2015@', server: '127.0.0.1',  database: 'Environment'};
    }else{
        serverWindows = "http://" + dados + ".empresariocloud.com.br"; //"http://localhost:2444";
        configEnvironment = {user: 'sa', password: 'IntSql2015@', server: '172.31.8.216',  database: 'Environment'};
    }
    
    var database = "";
    var server = "";
    var password = "";
    var user = "";

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
})

router.route('/*').post(function(req, res, next) {
    var full = req.host;
    var parts = full.split('.');
    var dados = "";
    if(parts.length > 3) {
        dados = parts[0];
    }
    host = dados;
    dados = dados.replace("http://", "");
    
    if(full.indexOf("localhost") > -1) {
        serverWindows = "http://localhost:2444";
        dados = "hidrobombas";
        configEnvironment = {user: 'sa', password: 'IntSql2015@', server: '127.0.0.1',  database: 'Environment'};
    }else{
        serverWindows = "http://" + dados + ".empresariocloud.com.br"; //"http://localhost:2444";
        configEnvironment = {user: 'sa', password: 'IntSql2015@', server: '172.31.8.216',  database: 'Environment'};
    }
    
    var database = "";
    var server = "";
    var password = "";
    var user = "";

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
})

//Retorna o numero sequencial
router.route('/sequencial').post(function(req, res) {
    var query = "";
    var prod = null;
    var tamanhoSequencia = "";

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed

    try {
        resposta = {
            status: 0,
            mensagem: [],
            sequenciaproduto: null
        }

        sql.close();

        console.log(config);

        sql.connect(config, function(err) {
            if (err){
                resposta = {
                    status: -2,
                    mensagem: ["" + err],
                    sequenciaproduto: null
                }
                res.json(resposta);
            }
            else{
            /* Produtos */
            var request = new sql.Request();
            request.input("idempresa",EnterpriseID);
            request.input("tipoitem", req.body.parametros.tipo);
            request.input("grupoitem", req.body.parametros.classe);
            request.input("marcaitem", req.body.parametros.marca);
            request.input("segmentoitem", req.body.parametros.segmento);

            request.query("select nr_sequencia from produtos where id_empresa = @idempresa and nr_tipoitem = @tipoitem and nr_grupoitem = @grupoitem and nr_marcaitem = @marcaitem and nr_segmentoitem = @segmentoitem and nr_sequencia is not null order by nr_sequencia", function (err, recordset) {
                if (err) {
                    resposta = {
                        status: -3,
                        mensagem: ["" + err],
                        sequenciaproduto: null
                    }
                    res.json(resposta);
                }
                else{
                    var element = recordset.recordsets[0];
                    var sequencia = 1;
                    

                    var i = 0;
                    while(i < element.length) {
                        if(sequencia != parseInt(element[i].nr_sequencia)){
                            i = element.length;
                        }
                        else
                        {
                            sequencia++;
                            
                        }
                            i++
                        }
                        tamanhoSequencia = sequencia.toString();
                        tamanhoSequencia = ("0").repeat(3 - tamanhoSequencia.length) + tamanhoSequencia;
                        
                        resposta = {
                            status: 1,
                            mensagem: ["OK"],
                            sequenciaproduto: tamanhoSequencia
                        }
                        res.json(resposta);
                    }
            })
            }

        })


    }
    catch(erro) {
        resposta = {
        status: -1,
        mensagem: ["" + erro],
        sequenciaproduto: null
    }
    sql.close();
    res.json(resposta);
    }

})

//Verifica se já existe a sequencia informada
router.route('/confirmasequencia').post(function(req, res) {
    var query = "";
    var prod = null;
    var tamanhoSequencia = "";

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed

    try {
        resposta = {
            status: 0,
            mensagem: [],
            sequenciaproduto: null
        }

        sql.close();

        console.log(config);

        sql.connect(config, function(err) {
            if (err){
                resposta = {
                    status: -2,
                    mensagem: ["" + err],
                    sequenciaproduto: null
                }
                res.json(resposta);
            }
            else{
            /* Produtos */
            var request = new sql.Request();
            request.input("idempresa",EnterpriseID);
            request.input("tipoitem", req.body.parametros.tipo);
            request.input("grupoitem", req.body.parametros.classe);
            request.input("marcaitem", req.body.parametros.marca);
            request.input("segmentoitem", req.body.parametros.segmento);
            request.input("codigoitem", req.body.parametros.nmcodigo);
            
            request.query("select nm_codigo from produtos where id_empresa = @idempresa and nr_tipoitem = @tipoitem and nr_grupoitem = @grupoitem and nr_marcaitem = @marcaitem and nr_segmentoitem = @segmentoitem and nm_codigo = @codigoitem and nr_sequencia is not null order by nr_sequencia", function (err, recordset) {
            //request.query("select nm_codigo from produtos where id_empresa = @idempresa and nr_tipoitem = @tipoitem and nr_grupoitem = @grupoitem and nr_marcaitem = @marcaitem and nr_segmentoitem = @segmentoitem and nm_codigo = @codigoitem and nr_sequencia is not null order by nm_codigo", function (err, recordset) {
            //request.query("select nm_codigo from produtos where id_empresa = @idempresa and nm_codigo = @codigoitem and nr_sequencia is not null order by nm_codigobarras", function (err, recordset) {
                if (err) {
                    resposta = {
                        status: -3,
                        mensagem: ["" + err],
                        sequenciaproduto: null
                    }
                    res.json(resposta);
                }
                else{
                    if(recordset.recordsets[0].length > 0) {
                    
                    var element = recordset.recordsets[0];
                    console.log('001 ' + req.body.parametros.nmcodigo);
                    if(element[0].nm_codigo != req.body.parametros.nmcodigo)
                    {
                        resposta = {
                            status: -5,
                            mensagem: ["Nao achou"],
                            sequenciaproduto: null//element[0].nm_codigo
                        }
                        res.json(resposta);
                    }
                    else{
                        resposta = {
                            status: 1,
                            mensagem: ["OK"],
                            sequenciaproduto: req.body.parametros.nmcodigo//element[0].nm_codigo
                        }
                        res.json(resposta);
                    }
                }
                else {
                    resposta = {
                        status: -5,
                        mensagem: ["Nao achou"],
                        sequenciaproduto: null//element[0].nm_codigo
                    }
                    res.json(resposta);
                }
                }
            });
            }

        })


    }
    catch(erro) {
        resposta = {
        status: -1,
        mensagem: ["" + erro],
        sequenciaproduto: null
    }
    sql.close();
    res.json(resposta);
    }

})