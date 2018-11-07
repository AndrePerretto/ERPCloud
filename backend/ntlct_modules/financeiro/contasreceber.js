const server = require('../../config/server')
const express = require('express')
const router = express.Router();
const sql = require("mssql");
const general = require('../../api/general')
const funcoesFinanceiro = require("./financeiro");
const prefixoModulo = "ContasReceber_";

server.use('/ntlct_modules/financeiro/contasreceber', router);

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
        dados = "intelecta10";  //"homologa"; //"foodtown";
        configEnvironment = {user: 'sa', password: '12345678', server: '127.0.0.1',  database: 'Environment'};
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
        dados = "intelecta10";  //"homologa"; //"foodtown";
        configEnvironment = {user: 'sa', password: '12345678', server: '127.0.0.1',  database: 'Environment'};
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
Retorna as listas dos itens para cadastrar parcelas: bancos, formas de pagamento,
configuração de cnab e contas financeiras.
---------------------------------------------------------------------------------
*/
router.route('/listacomplementoparcelas').post(function(req, res) {
    var query = "";

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed

    try{
        resposta = {
            status: 0,
            mensagem: [],
            bancos: [],
            formasPagamento: [],
            configuracoesCNAB: [],
            contasFinanceiras: []
        }

        query += "select id,nm_apelido descricao,nm_agencia agencia,nm_conta conta from banco where id_empresa = @idempresa";
        query += " order by descricao,agencia,conta; ";
        query += "select id,nm_descricao descricao,nm_nomeclasse classe from dsg_forma_pagamento";
        query += " order by descricao; ";
        query += "select id,nm_descricao descricao from configuracao_cnab where id_empresa = @idempresa";
        query += " order by descricao; ";
        query += "select id,nm_descricao descricao,nm_codigo codigo from plano_contas_financeiro where id_empresa = @idempresa";
        query += " order by codigo,descricao;";

        sql.close();
        sql.connect(config, function (err) {
            if (err){
                resposta = {
                    status: -2,
                    mensagem: ["" + err],
                    bancos: [],
                    formasPagamento: [],
                    configuracoesCNAB: [],
                    contasFinanceiras: []
                }
                res.json(resposta);
            }
            else{
                var request = new sql.Request();
                request.input("idempresa",EnterpriseID);
                request.query(query, function (err, recordset) {
                    if (err){
                        resposta = {
                            status: -3,
                            mensagem: ["" + err],
                            bancos: [],
                            formasPagamento: [],
                            configuracoesCNAB: [],
                            contasFinanceiras: []
                        }
                        res.json(resposta);
                    }
                    else{
                        resposta.bancos = recordset.recordsets[0];
                        resposta.formasPagamento = recordset.recordsets[1];
                        resposta.configuracoesCNAB = recordset.recordsets[2];
                        resposta.contasFinanceiras = recordset.recordsets[3];
                        resposta.status = 1;
                        resposta.mensagem = ["ok"];
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
            bancos: [],
            formasPagamento: [],
            configuracoesCNAB: [],
            contasFinanceiras: []
        }
        sql.close();
        res.json(resposta);
    }
})


/*------------------------------------------------------------------------------
Cria uma relação das contas a receber (parcelas)
--------------------------------------------------------------------------------
*/
router.route('/listarcontas').post(function(req, res) {
    var query = "";
    var resposta = null;
    var titulo = null;
    var baixa = null;
    var parametros = null;
    var idParcela = null;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed

    resposta = {
        status: 0,
        mensagem: [],
        titulos: [],
    }

    try{
        parametros = JSON.parse(req.body.parametros); 

        resposta = {
            status: 0,
            mensagem: [],
            titulos: [],
        }

        query += "select ";
        query += "ent.id identidade,ent.nm_razaosocial razaosocial,";
        query += "cr.id idtitulo,cr.nm_documento titulo,cr.vl_valor valortitulo,cr.dt_emissao emissao,cr.id_venda idvenda,cr.id_notafiscal idnota,cr.sn_dre dre,";
        query += "cr.nm_competencia,cr.id_plano_contas_financeiro idcontafinanceira,";
        query += "crp.id idparcela,crp.nm_documento docparcela,crp.nr_parcela parcela,crp.dt_data_vencimento vencimento,crp.vl_valor valorparcela,crp.id_banco idbanco,";
        query += "crp.id_configuracao_cnab idconfcnab,crp.id_plano_contas_financeiro idcontafinanceiraparc,crp.id_forma_pagamento idformaparc,crp.sn_fluxocaixa fluxocaixa,";
        query += "baixas.id idbaixa,baixas.dt_data databaixa,baixas.vl_valor valorbaixa,";
        query += "formas.id_banco idbancorec,formas.id_formapagamento idformarec,formas.nm_documento documentorec,formas.vl_valor valorrec,formas.nm_conta contacli,";
        query += "formas.nm_agencia agenciacli,";
        query += "(select nr_pedido from venda where venda.id = cr.id_venda and venda.id_empresa = @idempresa) nrpedido,";
        query += "(select nm_numeronotafiscal from notafiscal where notafiscal.id = cr.id_notafiscal and notafiscal.id_empresa = @idempresa) nrnota";
        query += " from entidade ent,contas_receber cr,contas_receber_parcelas crp";
        query += " left join contas_receber_baixas baixas on baixas.id_contas_receber_parcela = crp.id and baixas.id_empresa = @idempresa";
        query += " left join contas_receber_baixas_formaspagamento formas on formas.id_contas_receber_baixas = baixas.id and formas.id_empresa = @idempresa";
        query += " where cr.id_empresa = @idempresa";
        query += " and (@pedido is null or cr.id_venda = @pedido)";
        query += " and (@notaFiscal is null or cr.id_notafiscal = @notafiscal)";
        query += " and (@identidade is null or cr.id_entidade = @identidade)";
        query += " and ent.id = cr.id_entidade";
        query += " and crp.id_contas_receber = cr.id";
        query += " and (@vencimentoinicial is null or (convert(varchar(8),crp.dt_data_vencimento,112)) >= @vencimentoinicial)";
        query += " and (@vencimentofinal is null or (convert(varchar(8),crp.dt_data_vencimento,112)) <= @vencimentofinal)";
        query += " order by crp.dt_data_vencimento,crp.vl_valor desc,crp.nm_documento,crp.nr_parcela";

        sql.close();
        sql.connect(config, function (err) {    
            if (err){
                resposta.status = -2;
                resposta.mensagem = [];
                resposta.mensagem.push("" + err);
                resposta.titulos = [];
                res.json(resposta);
            }
            else{
                var request = new sql.Request();
                request.input("idempresa",EnterpriseID);
                request.input("identidade",(parametros.idEntidade == "" || parametros.idEntidade == "undefined") ? null : parametros.idEntidade);
                request.input("pedido",(parametros.pedido == "" || parametros.pedido == "undefined") ? null : parametros.pedido);
                request.input("notafiscal",(parametros.notaFiscal == "" || parametros.notaFiscal == "undefined") ? null : parametros.notaFiscal);
                request.input("vencimentoinicial",(parametros.vencimentoInicial == "" || parametros.vencimentoInicial == "undefined") ? null : parametros.vencimentoInicial.substring(6,10) + parametros.vencimentoInicial.substring(3,5)  + parametros.vencimentoInicial.substring(0,2));
                request.input("vencimentofinal",(parametros.vencimentoFinal == "" || parametros.vencimentoFinal == "undefined") ? null : parametros.vencimentoFinal.substring(6,10) + parametros.vencimentoFinal.substring(3,5)  + parametros.vencimentoFinal.substring(0,2));
                request.query(query, function (err, recordset) {
                    if (err){
                        resposta.status = -3;
                        resposta.mensagem = [];
                        resposta.mensagem.push("" + err);
                        resposta.titulos = [];
                        res.json(resposta);
                    }
                    else{
                        var element = recordset.recordsets[0];
                        var i = 0;
                        while(i < element.length){
                            idParcela = element[i].idparcela;
                            titulo = {
                                idEntidade : (element[i].identidade == null ? "" : element[i].identidade),
                                razaoSocial : element[i].razaosocial,
                                idTitulo : (element[i].idtitulo == null ? "" : element[i].idtitulo),
                                titulo : element[i].titulo,
                                valorTitulo: element[i].valortitulo,
                                emissaoTitulo : element[i].emissao,
                                idParcela : (element[i].idparcela == null ? "" : element[i].idparcela),
                                parcela : element[i].parcela,
                                docParcela : element[i].docparcela,
                                valorParcela : element[i].valorparcela,
                                vencimentoParcela : element[i].vencimento,
                                idPedido : (element[i].idvenda == null ? "" : element[i].idvenda),
                                nrPedido : element[i].nrpedido,
                                idNotaFiscal : (element[i].idnota == null ? "" : element[i].idnota),
                                nrNotaFiscal : element[i].nrnota,
                                idBanco : element[i].idbanco,
                                idConfCNAB : (element[i].idconfcnab == null ? "" : element[i].idconfcnab),
                                idContaFinanceira : (element[i].idcontafinanceiraparc == null ? "" : element[i].idcontafinanceiraparc),
                                idFormaPagamento : (element[i].idformaparc == null ? "" : element[i].idformaparc),
                                dre : (element[i].dre ? 1 : 0),
                                fluxoCaixa : (element[i].fluxocaixa ? 1 : 0),
                                valorBaixas : 0,
                                baixas : []
                            }
                            if(element[i].idbaixa != null){
                                while (i < element.length && element[i].idparcela == idParcela){
                                    baixa = {
                                        idBaixa : element[i].idbaixa,
                                        dataBaixa : element[i].databaixa,
                                        valorBaixa : element[i].valorbaixa,
                                        idBancoRec : (element[i].idbancorec == null ? "" : element[i].idbancorec),
                                        idFormaRec : (element[i].idformarec == null ? "" : element[i].idbancorec),
                                        documentoRec : element[i].documentorec,
                                        idBancoCli : (element[i].idbcocli == null ? "" : element[i].idbcocli),
                                        agenciaCli : element[i].agenciacli,
                                        contaCli : element[i].contacli
                                    }
                                    titulo.valorBaixas += element[i].valorbaixa;
                                    titulo.baixas.push(baixa);
                                    i++
                                }
                            }
                            else{
                                i++;
                            }
                            
                            if((parametros.titulosRecebidos == 1) || (titulo.valorBaixas < titulo.valorParcela))
                                resposta.titulos.push(titulo);
                        }
                        resposta.status = 1;
                        resposta.mensagem = [];
                        resposta.mensagem.push("Ok");
                        res.json(resposta);
                    }
                })
            }
        })
    }
    catch(erro){
        resposta.status = -1;
        resposta.mensagem = [];
        resposta.mensagem.push("" + erro);
        resposta.titulos = [];
        sql.close();
        res.json(resposta);
    }
})


/*------------------------------------------------------------------------------
Recupera os dados de um documento, com todas as parcelas ou com somente uma
específica. Recupera também os dados das baixas, quando houver.
--------------------------------------------------------------------------------
*/
router.route('/dadostitulo').post(function(req, res) {
    var query = "";
    var resposta = null;
    var parcela = null;
    var baixa = null;
    var formaRec = null;
    var parametros = null;
    var idParcela = null;
    var idBaixa = null;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed

    try{
        parametros = req.body.parametros;    

        resposta = {
            status: 0,
            mensagem: [],
            dadosTitulo: [],
        }
        
        query += "select ";
        query += "cr.id idtitulo,cr.id_entidade identidade,cr.id_venda idvenda,cr.id_notafiscal idnotafiscal,cr.id_parcelamento idparcelamento,";
        query += "cr.id_plano_contas_financeiro idcontafinanceira,cr.nm_documento titulo,cr.nm_competencia competencia,cr.dt_emissao emissao,";
        query += "cr.vl_valor valortitulo,cr.sn_dre dre,cr.nm_observacao observacao,";
        query += "crp.id idparcela,crp.nm_documento documentoparc,crp.id_banco idbanco,crp.id_forma_pagamento idformapagamento,crp.id_configuracao_cnab idconfcnab,crp.id_plano_contas_financeiro idcontafinanceiraparc,";
        query += "crp.nr_parcela parcela,crp.dt_data_vencimento vencimento,crp.vl_valor valorparcela,crp.id_dsg_status_titulo idstatus,crp.sn_fluxocaixa fluxocaixa,";
        query += "ent.nm_razaosocial razaosocial,";        
        query += "(select venda.nr_pedido from venda where venda.id = cr.id_venda and venda.id_empresa = @idempresa) pedido,";
        query += "(select nm_numeronotafiscal from notafiscal where notafiscal.id = cr.id_notafiscal and notafiscal.id_empresa = @idempresa) notafiscal,";        
        query += "baixas.id idbaixa,baixas.id_processo_recebimento idprocesso,baixas.dt_data databaixa,baixas.vl_valor valorbaixa,";        
        query += "formas.id idformarecebimento,formas.id_banco idbancorecebimento,formas.nm_documento documentorecebimento,formas.id_dsg_banco idbancopagador,";
        query += "formas.nm_conta contapagador,formas.nm_agencia agenciapagador,formas.vl_valor valorrecebimento";
        query += " from entidade ent,contas_receber cr,contas_receber_parcelas crp";
        query += " left join contas_receber_baixas baixas on baixas.id_contas_receber_parcela = crp.id and baixas.id_empresa = @idempresa";
        query += " left join contas_receber_baixas_formaspagamento formas on formas.id_contas_receber_baixas = baixas.id and formas.id_empresa = @idempresa";
        query += " where cr.id_empresa = @idempresa";
        query += " and (@idtitulo is null or cr.id = @idtitulo)";
        query += " and crp.id_empresa = @idempresa and crp.id_contas_receber = cr.id";
        query += " and (@idparcela is null or crp.id = @idparcela)";
        query += " and ent.id = cr.id_entidade and ent.id_empresa = @idempresa";
        query += " order by replicate(' ',10 - len(crp.nr_parcela)) + rtrim(crp.nr_parcela),baixas.dt_data";

        sql.close();
        sql.connect(config, function (err) {    
            if (err){
                resposta = {
                    status: -2,
                    mensagem: ["" + err],
                    dadosTitulo: null
                }
                res.json(resposta);
            }
            else{
                var request = new sql.Request();
                request.input("idempresa",EnterpriseID);
                request.input("idtitulo",parametros.idTitulo == "" ? null : parametros.idTitulo);
                request.input("idparcela",parametros.idParcela == "" ? null : parametros.idParcela);
                request.query(query, function (err, recordset) {
                    try{
                        if (err){
                            resposta = {
                                status: -3,
                                mensagem: ["" + err],
                                dadosTitulo: null
                            }
                            res.json(resposta);
                        }
                        else{
                            var element = recordset.recordsets[0];
                            var i = 0;
                            if(element.length == 0){
                                resposta = {
                                    status: 0,
                                    mensagem: ["Não forma encontrados os dados para o título/parcela."],
                                    dadosTitulo: null
                                }
                                res.json(resposta);
                            }
                            else{
                                resposta = {
                                    status: 0,
                                    mensagem: [],
                                    dadosTitulo: null
                                }
                                resposta.dadosTitulo = {
                                    idTitulo : element[i].idtitulo,
                                    idEntidade : element[i].identidade,
                                    razaoSocial : element[i].razaosocial,
                                    titulo : element[i].titulo,
                                    valor: element[i].valortitulo,
                                    emissao : element[i].emissao,
                                    competencia : element[i].competencia,
                                    idPedido : (element[i].idvenda == null ? "" : element[i].idvenda),
                                    pedido : (element[i].pedido == null ? "" : element[i].pedido),
                                    idNotaFiscal : (element[i].idnotafiscal == null ? "" : element[i].idnotafiscal),
                                    notaFiscal : (element[i].notafiscal == null ? "" : element[i].notafiscal),
                                    idParcelamento: (element[i].idparcelamento == null ? "" : element[i].idparcelamento),
                                    idContaFinanceira : (element[i].idcontafinanceira == null ? "" : element[i].idcontafinanceira),
                                    dre : (element[i].dre ? 1 : 0),
                                    observacao : element[i].observacao,
                                    valorBaixas : 0,
                                    parcelas : []
                                }
                                while(i < element.length){
                                    idParcela = element[i].idparcela;
                                    parcela = {
                                        idParcela : element[i].idparcela,
                                        idBanco : (element[i].idbanco == null ? "" : element[i].idbanco),
                                        idFormaPagamento : (element[i].idformapagamento == null ? "" : element[i].idformapagamento),
                                        idConfCNAB : (element[i].idconfcnab == null ? "" : element[i].idconfcnab),
                                        idContaFinanceira : (element[i].idcontafinanceiraparc == null ? "" : element[i].idcontafinanceiraparc),
                                        documento : element[i].documentoparc,
                                        parcela : element[i].parcela,
                                        vencimento : element[i].vencimento,
                                        valor : element[i].valorparcela,
                                        idStatus : (element[i].idstatus == null ? "" : element[i].idstatus),
                                        fluxoCaixa : (element[i].fluxocaixa ? 1 : 0),
                                        valorBaixas : 0,
                                        baixas : []
                                    }
                                    if(element[i].idbaixa != null){
                                        while (i < element.length && element[i].idparcela == idParcela){
                                            idBaixa = element[i].idbaixa;
                                            baixa = {
                                                idBaixa : element[i].idbaixa,
                                                idProcessoRecebimento : element[i].idprocesso,
                                                dataBaixa : element[i].databaixa,
                                                valorBaixa : element[i].valorbaixa,
                                                formasRecebimento : []
                                            }
                                            parcela.valorBaixas += element[i].valorbaixa;
                                            resposta.dadosTitulo.valorBaixas += element[i].valorbaixa;

                                            if(element[i].idformarecebimento != null){
                                                while(i < element.length && element[i].idbaixa == idBaixa){
                                                    formaRec = {
                                                        idFormaRecebimento : element[i].idformarecebimento,
                                                        idBanco : element[i].idbancorecebimento,
                                                        documento : element[i].documentorecebimento,
                                                        idDsgBanco : (element[i].idbancopagador == null ? "" : element[i].idbancopagador),
                                                        contaPag: element[i].contapagador,
                                                        agenciaPag: element[i].agenciapagador,
                                                        valor : element[i].valorrecebimento
                                                    }
                                                    baixa.formasRecebimento.push(formaRec);
                                                    i++
                                                }
                                            }
                                            else{
                                                i++;
                                            }
                                            parcela.baixas.push(baixa);
                                        }
                                    }
                                    else{
                                        i++;
                                    }

                                    resposta.dadosTitulo.parcelas.push(parcela);
                                }
                                resposta.status = 1
                                resposta.mensagem = [];
                                resposta.mensagem.push("Ok");
                                res.json(resposta);
                            }
                        }
                    }
                    catch(err){
                        resposta = {
                            status: -4,
                            mensagem: ["" + err],
                            dadosTitulo: null
                        }
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
            dadosTitulo: null
        }
        sql.close();
        res.json(resposta);
    }
})



/*------------------------------------------------------------------------------
Criar as parcelas a partir do pedido de vendas.
--------------------------------------------------------------------------------
*/
router.route('/gerarparcelasvenda').post(function(req, res) {
    var query = "";
    var nrParcela = 0;
    var total = 0;
    var parcela = null;
    var resposta = null;
    var parametros = null;
    var titulo = null;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed

    parametros = req.body.parametros;

    try{
        query += "select id_entidade,nr_pedido,dt_emissao,id_parcelamento,id_formapagamento,id_configuracao_cnab,id from venda";
        query += " where id_empresa = '" + EnterpriseID + "'";
        query += " and id = '" + parametros.idVenda + "'; ";

        query += "select id,vl_valor,dt_vencimento from venda_titulos";
        query += " where id_venda = '" + parametros.idVenda + "'";
        query += " order by dt_vencimento";

        sql.close();
        sql.connect(config, function (err) {
            if (err){
                resposta = {
                    status: -2,
                    mensagem: ["" + err],
                    titulo: null
                }
                res.json(resposta);
            }
            else{
                var request = new sql.Request();
                request.input("idempresa",EnterpriseID);
                request.query(query, function (err, recordset) {
                    if (err){
                        resposta = {
                            status: -3,
                            mensagem: ["" + err],
                            titulo: null
                        }
                        res.json(resposta);
                    }
                    else{
                        var venda = recordset.recordsets[0][0];
                        var titulosVenda = recordset.recordsets[1];
                        var i = 0;

                        titulo = {
                            idEmpresa: EnterpriseID,
                            idUsuario: parametros.idUsuario,
                            idTitulo: "",
                            idEntidade: venda.id_entidade,
                            idPedido: parametros.idVenda,
                            idNotaFiscal: "",
                            nrTitulo: venda.nr_pedido,
                            emissao: new Date(venda.dt_emissao).toISOString(),
                            competencia: "",
                            valor: "",
                            idContaFinanceira: "",
                            idParcelamento: venda.id_parcelamento,
                            observacao: "",
                            dre: 0,
                            parcelas: []
                        };
                        
                        for(i = 0; i < titulosVenda.length; i++){
                            nrParcela++;
                            parcela = {
                                idParcela: "",
                                documento: venda.nr_pedido,
                                parcela: nrParcela,
                                vencimento: new Date(titulosVenda[i].dt_vencimento).toISOString(),
                                valor: titulosVenda[i].vl_valor,
                                idBanco: "",
                                idFormaPagamento: venda.id_formapagamento,
                                idConfCNAB: venda.id_configuracao_cnab,
                                idContaFinanceira: "",
                                fluxoCaixa: "1"
                            };
                            total += parseFloat(titulosVenda[i].vl_valor);
                            titulo.parcelas.push(parcela);
                        }
                        
                        titulo.valor = total;

                        if(total > 0){
                            funAtualizarConta(titulo,(function(repostacallback){
                                res.json(repostacallback);
                            }));
                        }
                        else{
                            resposta = {
                                status: 0,
                                mensagem: ["Não foram geradas parcelas para esta venda"],
                                titulo: null
                            }
                            res.json(reposta);
                        }
                    }
                })
            }
        })
    }
    catch(erro){
        resposta = {
            status: -1,
            mensagem: [],
            titulo: null
        }
        resposta.mensagem.push("" + erro);
        res.json(resposta);
    }
})


/*------------------------------------------------------------------------------
Inclui ou atualiza uma conta com suas parcelas.
--------------------------------------------------------------------------------
*/
router.route('/atualizarconta').post(function(req, res) {
    var query = "";
    var queryItens = "";
    var parcela = 0;
    var resposta = null;
    var parametros = null;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed

    resposta = {
        status: 0,
        mensagem: [],
        titulo: null
    }

    try{
        parametros = req.body.parametros;

        if(!(parametros.hasOwnProperty("idPedido")))
            parametros.idPedido = "";

        if(!(parametros.hasOwnProperty("idNotaFiscal")))
            parametros.idNotaFiscal = "";

        funAtualizarConta(parametros,(function(repostacallback){
            res.json(repostacallback);
        }));
    }
    catch(erro){
        resposta.status = -1;
        resposta.mensagem = [];
        resposta.mensagem.push("" + erro);
        titulo = null;
        res.json(resposta);
    }
})



/*------------------------------------------------------------------------------
Inclui ou atualiza uma conta com suas parcelas.
--------------------------------------------------------------------------------
*/
function funAtualizarConta(parametros,callbackf) {
    var query = "";
    var queryItens = "";
    var parcela = 0;
    var resposta = null;

    resposta = {
        status: 0,
        mensagem: [],
        titulo: null
    }
    console.log(parametros);

    try{
        if(parametros.idTitulo == ""){
            parametros.idTitulo = general.guid();
            query = "insert into contas_receber (id,id_empresa,id_entidade,id_venda,id_notafiscal,id_parcelamento,id_plano_contas_financeiro,nm_documento,dt_emissao,nm_competencia,vl_valor,sn_dre,nm_observacao) values("
            query += "'" + parametros.idTitulo + "',";
            query += "'" + EnterpriseID + "',";
            query += "'" + parametros.idEntidade + "',";
            query += ((parametros.idPedido == "" || parametros.idPedido == "undefined") ? "null" : "'" + parametros.idPedido + "'") + ",";
            query += ((parametros.idNotaFiscal == "" || parametros.idNotaFiscal == "undefined") ? "null" : "'" + parametros.idNotaFiscal + "'") + ",";
            query += "'" + parametros.idParcelamento + "',";
            query += ((parametros.idContaFinanceira == "" || parametros.idContaFinanceira == "undefined") ? "null" : "'" + parametros.idContaFinanceira + "'") + ",";
            query += "'" + parametros.nrTitulo + "',";
            query += "'" + parametros.emissao + "',";
            query += "'" + parametros.competencia  + "',";
            query += parametros.valor.toString().trim() + ",";
            query += parametros.dre.toString().trim() + ",";
            query += "'" + parametros.observacao + "'";
            query += ")";

            queryItens += "insert into contas_receber_parcelas (id,id_empresa,id_contas_receber,id_Banco,id_forma_pagamento,id_configuracao_cnab,id_plano_contas_financeiro,nr_parcela,nm_documento,sn_fluxocaixa,dt_data_vencimento,vl_valor)";
            queryItens += " values ";
            for(parcela = 0; parcela < parametros.parcelas.length; parcela++){
                if(parcela > 0)
                    queryItens += ",";
                
                parametros.parcelas[parcela].idParcela = general.guid();
                queryItens += "(";
                queryItens += "'" + parametros.parcelas[parcela].idParcela + "',";
                queryItens += "'" + EnterpriseID + "',";
                queryItens += "'" + parametros.idTitulo + "',";
                queryItens += (parametros.parcelas[parcela].idBanco == "" ? "null" : "'" + parametros.parcelas[parcela].idBanco + "'") + ",";
                queryItens += (parametros.parcelas[parcela].idFormaPagamento == "" ? "null" : "'" + parametros.parcelas[parcela].idFormaPagamento + "'") + ",";
                queryItens += (parametros.parcelas[parcela].idConfCNAB == "" ? "null" : "'" + parametros.parcelas[parcela].idConfCNAB + "'") + ",";
                queryItens += (parametros.parcelas[parcela].idContaFinanceira == "" ? "null" : "'" + parametros.parcelas[parcela].idContaFinanceira + "'") + ",";
                queryItens += "'" + parametros.parcelas[parcela].parcela + "',";
                queryItens += "'" + parametros.parcelas[parcela].documento + "',";
                queryItens +=  parametros.parcelas[parcela].fluxoCaixa + ",";
                queryItens += "'" + parametros.parcelas[parcela].vencimento + "',";
                queryItens += parametros.parcelas[parcela].valor.toString().trim()
                queryItens += ")";
            }
        }
        else{
            queryItens = "";
            query += "update contas_receber set " 
            query += "id_plano_contas_financeiro = " + (parametros.idContaFinanceira == "" ? "null" : "'" + parametros.idContaFinanceira + "'") + ",";
            query += "id_venda = " +  ((parametros.idPedido == "" || parametros.idPedido == "undefined") ? "null" : "'" + parametros.idPedido + "'") + ",";
            query += "id_notafiscal = " + ((parametros.idNotaFiscal == "" || parametros.idNotaFiscal == "undefined") ? "null" : "'" + parametros.idNotaFiscal + "'") + ",";
            query += "nm_competencia = '" + parametros.competencia + "',"
            query += "sn_dre = " + parametros.dre.toString() + ","
            query += "nm_observacao = '" + parametros.observacao + "'";
            query += "where id = '" + parametros.idTitulo + "'";
            query += " and id_empresa = '" + EnterpriseID + "'";
        }
        console.log(query);
        sql.close();
        sql.connect(config, function (err) {    
            if (err){
                resposta.status = -2;
                resposta.mensagem = [];
                resposta.mensagem.push("f: " + err);
                resposta.titulo = null;
                callbackf(resposta);
            }
            else{
                try{
                    var transacao = new sql.Transaction();
                    transacao.begin(err =>{
                        var request = new sql.Request(transacao);
                        request.query(query, function (err, recordset) {
                            if (err){
                                resposta.status = -3;
                                resposta.mensagem = [];
                                resposta.mensagem.push("f: " + err);
                                resposta.titulo = null;
                                transacao.rollback();
                                callbackf(resposta);
                            }
                            else{
                                if(queryItens != ""){
                                    try{
                                        var request = new sql.Request(transacao);
                                        request.query(queryItens, function (err, recordset) {
                                            if (err){
                                                resposta.status = -4;
                                                resposta.mensagem = [];
                                                resposta.mensagem.push("f: " + err);
                                                titulo = null;
                                                transacao.rollback();
                                                callbackf(resposta);
                                            }
                                            else{
                                                resposta.status = 1;
                                                resposta.mensagem = ["ok"];
                                                resposta.titulo =  parametros;
                                                transacao.commit();
                                                callbackf(resposta);
                                            }
                                        })                                    
                                    }
                                    catch(err){
                                        resposta.status = -5;
                                        resposta.mensagem = [];
                                        resposta.mensagem.push("f: " + erro);
                                        resposta.titulo = null;                            
                                        callbackf(resposta);
                                    }
                                }
                                else{
                                    resposta.status = 1;
                                    resposta.mensagem = ["ok"];
                                    resposta.titulo =  parametros;
                                    transacao.commit();
                                    callbackf(resposta);
                                }
                            }
                        })
                    })
                }
                catch(err){
                    resposta.status = -6;
                    resposta.mensagem = [];
                    resposta.mensagem.push("f: " + erro);
                    resposta.titulo = null;
                    callbackf(resposta);
                }
            }
        });
    }
    catch(erro){
        resposta.status = -1;
        resposta.mensagem = [];
        resposta.mensagem.push("f: " + erro);
        resposta.titulo = null;
        callbackf(resposta);
    }
}


/*------------------------------------------------------------------------------
Registra o recebimento de uma conta
--------------------------------------------------------------------------------
*/
router.route('/realizarrecebimento').post(function(req, res) {
    var query = "";
    var queryBaixa = "";
    var resposta = null;
    var parametros = null;
    var formasPagamento = require("./formaspagamento");

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed

    resposta = {
        status: 1,
        mensagem: [],
        titulo: null
    }
    try{
        parametros = req.body.parametros;

        parametros.data = parametros.dataRecebimento;
        parametros.tipoMovimento = "C";        
        
        /* Validando os dados */        
        resposta = formasPagamento.validarDados(parametros);

        if(resposta.status <= 0){
            resposta.titulo = null;
            res.json(resposta);
        }
        else{
            query += "select cr.id idconta,parc.nm_documento documento,parc.nr_parcela parcela,ent.nm_razaosocial razaosocial"
            query += " from contas_receber_parcelas parc,contas_receber cr,entidade ent"
            query += " where parc.id = '" + parametros.idTitulo + "'";
            query += " and parc.id_empresa = '" + EnterpriseID + "'";
            query += " and cr.id = parc.id_contas_receber and cr.id_empresa = '" + EnterpriseID + "'";
            query += " and ent.id = cr.id_entidade and ent.id_empresa = '" + EnterpriseID + "'";

            sql.close();
            sql.connect(config, function (err) {    
                if (err){
                    resposta.status = -2;
                    resposta.mensagem = [];
                    resposta.mensagem.push("" + err);
                    resposta.titulo = null;
                    res.json(resposta);
                }
                else{
                    try{
                        var request = new sql.Request();
                        request.query(query, function (err, recordset) {
                            if (err){
                                resposta.status = -3;
                                resposta.mensagem = [];
                                resposta.mensagem.push("" + err);
                                resposta.titulo = null;
                                res.json(resposta);
                            }
                            else{
                                try{
                                    var element = recordset.recordsets[0];
                                    var descricao = "";

                                    descricao = "Recebimento do documento " + element[0].documento.trim() + "/" + element[0].parcela;
                                    descricao += " (" + element[0].razaosocial.trim() + ")";

                                    parametros.idBaixa = general.guid();
                                    parametros.idBaixaProcesso = general.guid();
                                    parametros.idBaixaForma = general.guid();
                                    parametros.idMovimento = general.guid();
                        
                                    queryBaixa += " update contas_receber_parcelas set ";
                                    queryBaixa += " id_banco = '" + parametros.idBanco + "',";
                                    queryBaixa += " id_forma_pagamento = '" + parametros.idFormaPagamento + "'"
                                    queryBaixa += " where id = '" + parametros.idTitulo + "'"
                                    queryBaixa += " and id_empresa = '" + EnterpriseID + "'";
                                    queryBaixa += "; ";
                                    
                                    queryBaixa += "insert into contas_receber_baixas (id,id_empresa,id_contas_receber_parcela,id_processo_recebimento,dt_data,vl_valor) values (";
                                    queryBaixa += "'" + parametros.idBaixa + "',";
                                    queryBaixa += "'" + EnterpriseID + "',";
                                    queryBaixa += "'" + parametros.idTitulo + "',";
                                    queryBaixa += "'" + parametros.idBaixaProcesso + "',";
                                    queryBaixa += "'" + parametros.dataRecebimento + "',";
                                    queryBaixa += parametros.valor;
                                    queryBaixa += "); ";
                        
                                    queryBaixa += "insert into contas_receber_baixas_formaspagamento (id,id_empresa,id_processo_recebimento,id_contas_receber_baixas,id_formapagamento,id_banco,id_movimento,nm_documento,id_dsg_banco,nm_conta,nm_agencia,vl_valor) values (";
                                    queryBaixa += "'" + parametros.idBaixaForma + "',";
                                    queryBaixa += "'" + EnterpriseID + "',";
                                    queryBaixa += "'" + parametros.idBaixaProcesso + "',";
                                    queryBaixa += "'" + parametros.idBaixa + "',";
                                    queryBaixa += "'" + parametros.idFormaPagamento + "',";
                                    queryBaixa += "'" + parametros.idBanco + "',";
                                    queryBaixa += "'" + parametros.idMovimento + "',";
                                    queryBaixa += "'" + parametros.documento + "',";
                                    queryBaixa += (parametros.idBancoOper == "" ? "null" : "'" + parametros.idBancoOper + "'") + ",";
                                    queryBaixa += "'" + parametros.contaOper + "',";
                                    queryBaixa += "'" + parametros.agenciaOper + "',";
                                    queryBaixa += parametros.valor;
                                    queryBaixa += "); ";
                                    
                                    queryBaixa += "insert into movimentacao_bancaria (id,id_empresa,id_processo_recebimento,id_dsg_banco,nm_agencia,nm_conta,id_banco,dt_data,vl_valor,nm_tipo_movimentacao,nm_descricao,nm_documento,sn_conciliado) values ("
                                    queryBaixa += "'" + parametros.idMovimento + "',";
                                    queryBaixa += "'" + EnterpriseID + "',";
                                    queryBaixa += "'" + parametros.idBaixaProcesso + "',";
                                    queryBaixa += (parametros.idBancoOper == "" ? "null" : "'" + parametros.idBancoOper + "'") + ",";
                                    queryBaixa += "'" + parametros.agenciaOper + "',";
                                    queryBaixa += "'" + parametros.contaOper + "',";
                                    queryBaixa += "'" + parametros.idBanco + "',";
                                    queryBaixa += "'" + parametros.dataRecebimento + "',";
                                    queryBaixa += parametros.valor + ",";
                                    queryBaixa += "'E',";
                                    queryBaixa += "'" + descricao + "',";
                                    queryBaixa += "'" + parametros.documento + "',";
                                    queryBaixa += "0";
                                    queryBaixa += "); ";

                                    var transacao = new sql.Transaction();
                                    transacao.begin(err =>{
                                        try{
                                            var request = new sql.Request(transacao);
                                            request.query(queryBaixa, function (err, recordset) {
                                                if (err){
                                                    resposta.status = -4;
                                                    resposta.mensagem = [];
                                                    resposta.mensagem.push("" + err);
                                                    resposta.titulo = null;
                                                    transacao.rollback();
                                                    res.json(resposta);
                                                }
                                                else{
                                                    resposta.status = 1;
                                                    resposta.mensagem = ["ok"];
                                                    resposta.titulo =  parametros;
                                                    transacao.commit();
                                                    res.json(resposta);
                                                }
                                            })
                                        }
                                        catch(err){
                                            resposta.status = -5;
                                            resposta.mensagem = [];
                                            resposta.mensagem.push("" + err);
                                            resposta.titulo = null;
                                            res.json(resposta);                                    
                                        }
                                    })
                                }
                                catch(err){
                                    resposta.status = -6;
                                    resposta.mensagem = [];
                                    resposta.mensagem.push("" + err);
                                    resposta.titulo = null;
                                    res.json(resposta);                                    
                                }
                            }
                        })
                    }
                    catch(err){
                        resposta.status = -7;
                        resposta.mensagem = [];
                        resposta.mensagem.push("" + err);
                        resposta.titulo = null;
                        res.json(resposta);                                    
                    }
                }
            })
        }
    }
    catch(err){
        resposta.status = -1;
        resposta.mensagem = [];
        resposta.mensagem.push("" + err);
        resposta.titulo = null;
        res.json(resposta);
    }
})


/*------------------------------------------------------------------------------
Cancela o recebimento de uma conta
--------------------------------------------------------------------------------
*/
router.route('/cancelarrecebimento').post(function(req, res) {
    var query = "";
    var queryBaixa = "";
    var resposta = null;
    var parametros = null;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed

    resposta = {
        status: 0,
        mensagem: [],
        baixa: null
    }

    try{
        parametros = req.body.parametros;

        query = "select id,id_contas_receber_parcela,id_processo_recebimento,dt_data,vl_valor from contas_receber_baixas"
        query += " where id = @idbaixa and id_empresa = @idempresa"

        sql.close();
        sql.connect(config, function (err) {    
            if (err){
                resposta.status = -2;
                resposta.mensagem = [];
                resposta.mensagem.push("" + err);
                resposta.baixa = null;
                res.json(resposta);
            }
            else{
                try{
                    var request = new sql.Request();
                    request.input("idempresa",EnterpriseID);
                    request.input("idbaixa",parametros.idBaixa);
                    request.query(query, function (err, recordset) {
                        if (err){
                            resposta.status = -3;
                            resposta.mensagem = [];
                            resposta.mensagem.push("" + err);
                            resposta.baixa = null;
                            res.json(resposta);
                        }
                        else{
                            try{
                                var element = recordset.recordsets[0];
                                resposta.baixa = {
                                    idBaixa: element[0].id,
                                    idParcela: element[0].id_contas_receber_parcela,
                                    idProcesso: element[0].id_processo_recebimento,
                                    data: element[0].dt_data,
                                    valor: element[0].vl_valor
                                }
                                query += " delete movimentacao_bancaria where id in (select id_movimento from contas_receber_baixas_formaspagamento where id_contas_receber_baixas = @idbaixa and id_empresa = @idempresa); ";
                                query += "delete contas_receber_baixas_formaspagamento where id_contas_receber_baixas = @idbaixa and id_empresa = @idempresa; ";
                                query += " delete contas_receber_baixas where id = @idbaixa and id_empresa = @idempresa;";            
                                var transacao = new sql.Transaction();
                                transacao.begin(err =>{
                                    try{
                                        var request = new sql.Request(transacao);
                                        request.input("idempresa",EnterpriseID);
                                        request.input("idbaixa",parametros.idBaixa);
                                        request.query(query, function (err, recordset) {
                                            if (err){
                                                resposta.status = -4;
                                                resposta.mensagem = [];
                                                resposta.mensagem.push("" + err);
                                                resposta.baixa = null;
                                                transacao.rollback();
                                                res.json(resposta);
                                            }
                                            else{
                                                resposta.status = 1;
                                                resposta.mensagem = ["ok"];
                                                transacao.commit();
                                                res.json(resposta);           
                                            }
                                        })
                                    }
                                    catch(err){
                                        resposta.status = -5;
                                        resposta.mensagem = [];
                                        resposta.mensagem.push("" + err);
                                        resposta.baixa = null;
                                        res.json(resposta);                                    
                                    }
                                })
                            }
                            catch(err){
                                resposta.status = -7;
                                resposta.mensagem = [];
                                resposta.mensagem.push("" + err);
                                resposta.baixa = null;
                                res.json(resposta);                                    
                            }
                        }
                    })
                }
                catch(err){
                    resposta.status = -6;
                    resposta.mensagem = [];
                    resposta.mensagem.push("" + err);
                    resposta.baixa = null;
                    res.json(resposta);                                    
                }
            }
        })
    }
    catch(erro){
        resposta.status = -1;
        resposta.mensagem = [];
        resposta.mensagem.push("" + erro);
        baixa = null;
        res.json(resposta);
    }
})

/*------------------------------------------------------------------------------
Registra o recebimento de várias contas
--------------------------------------------------------------------------------
*/
router.route('/realizarmultirecebimento').post(function(req, res) {
    var query = "";
    var resposta = null;
    var validacaoForma = null;
    var tituloBaixado = null;
    var tituloRecusado = null;
    var parametros = null;
    var parcela = 0;
    var mensagem = 0;
    var dadosFormaPagamento = null;    
    var formasPagamento = require("./formaspagamento");

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed

    resposta = {
        status: 0,
        mensagem: [],
        titulosBaixados: [],
        titulosRecusados: []
    }
    try{
        parametros = req.body.parametros;
        for(parcela = 0; parcela < parametros.listaParcelas.length; parcela++){
            query += "select cr.id idconta,parc.id idparcela,parc.nm_documento documento,parc.nr_parcela parcela,parc.id_banco idbanco,parc.id_forma_pagamento idformapagamento,parc.vl_valor valorparcela,ent.nm_razaosocial razaosocial,"
            query += "(select sum(baixas.vl_valor) from contas_receber_baixas baixas where baixas.id_contas_receber_parcela = parc.id and baixas.id_empresa = '" + EnterpriseID + "')  totalbaixas";
            query += " from contas_receber_parcelas parc,contas_receber cr,entidade ent"
            query += " where parc.id = '" + parametros.listaParcelas[parcela] + "'";
            query += " and parc.id_empresa = '" + EnterpriseID + "'";
            query += " and cr.id = parc.id_contas_receber and cr.id_empresa = '" + EnterpriseID + "'";
            query += " and ent.id = cr.id_entidade and ent.id_empresa = '" + EnterpriseID + "'; ";
        }
        sql.close();
        sql.connect(config, function (err) {    
            if (err){
                resposta.status = -2;
                resposta.mensagem = [];
                resposta.mensagem.push("" + err);
                resposta.titulosBaixados = [];
                resposta.titulosRecusados = [];
                res.json(resposta);
            }
            else{
                try{
                    var request = new sql.Request();
                    request.query(query, function (err, recordset) {
                        if (err){
                            resposta.status = -3;
                            resposta.mensagem = [];
                            resposta.mensagem.push("" + err);
                            resposta.titulosBaixados = [];
                            resposta.titulosRecusados = [];
                            res.json(resposta);
                        }
                        else{
                            try{
                                var elementos = 0;
                                var element = null;
                                var descricao = "";
                                var queryParcela = "";
                                var queryBaixa = "";
                                var idBaixa = null;
                                var idBaixaProcesso = null;
                                var idBaixaForma = null;
                                var idBanco = null;
                                var idMovimento = null;
                                var dataRecebimento = null;
                                var transacao = null;

                                for(elementos = 0; elementos < recordset.recordsets.length; elementos++){
                                    element = recordset.recordsets[elementos];

                                    tituloRecusado = {
                                        clifor: element[0].razaosocial,
                                        titulo: element[0].documento.trim() + "/" + element[0].parcela,
                                        mensagem: []
                                    }

                                    queryParcela = "";
                                    
                                    descricao = "Recebimento do documento " + element[0].documento.trim() + "/" + element[0].parcela;
                                    descricao += " (" + element[0].razaosocial.trim() + ")";

                                    idBaixa = general.guid();
                                    idBaixaProcesso = general.guid();
                                    idBaixaForma = general.guid();
                                    idMovimento = general.guid();
                                    idBanco = parametros.idBanco;
                                    idFormaPagamento = parametros.idFormaPagamento;

                                    if(parametros.dataRecebimento == "")
                                        dataRecebimento = new Date();
                                    else
                                        dataRecebimento = new Date(parametros.dataRecebimento);
                                    
                                    if(parametros.idBanco != ""){
                                        idBanco = parametros.idBanco;
                                        queryParcela += " id_banco = '" + idBanco + "'";
                                    }
                                    else{
                                        idBanco = element[0].idbanco == null ? "" : element[0].idbanco;
                                    }
                                    
                                    if(parametros.idFormaPagamento != ""){
                                        idFormaPagamento = parametros.idFormaPagamento;
                                        if(queryParcela != "")
                                            queryParcela += ",";
                                        queryParcela += " id_forma_pagamento = '" + idFormaPagamento + "'";
                                    }
                                    else{
                                        idFormaPagamento = element[0].idformapagamento == null ? "" : element[0].idformapagamento;
                                    }

                                    if(queryParcela != ""){
                                        queryBaixa += " update contas_receber_parcelas set ";
                                        queryBaixa += queryParcela;
                                        queryBaixa += " where id = '" + element[0].idparcela + "'"
                                        queryBaixa += " and id_empresa = '" + EnterpriseID + "'";
                                        queryBaixa += "; ";
                                    }

                                    if(element[0].totalbaixas != null && parseFloat(element[0].totalbaixas) != 0)
                                        tituloRecusado.mensagem.push("Este título já foi recebido.");
                                    else{
                                        dadosFormaPagamento = {
                                            idBanco: idBanco,
                                            data: dataRecebimento.toISOString(),
                                            documento: parametros.documento,
                                            idFormaPagamento: idFormaPagamento,
                                            valor: parametros.valor,
                                            idBancoOper: parametros.idBancoOper,
                                            agenciaOper: parametros.agenciaOper,
                                            contaOper: parametros.contaOper,
                                            tipoMovimento: "C"
                                        }
                                        validacaoForma = formasPagamento.validarDados(dadosFormaPagamento);
                                        if(validacaoForma.status <= 0){
                                            for(mensagem = 0; mensagem < validacaoForma.mensagem.length; mensagem++){
                                                tituloRecusado.mensagem.push(validacaoForma.mensagem[mensagem]);
                                            }
                                        }
                                    }

                                    if(tituloRecusado.mensagem.length == 0){                                    
                                        queryBaixa += "insert into contas_receber_baixas (id,id_empresa,id_contas_receber_parcela,id_processo_recebimento,dt_data,vl_valor) values (";
                                        queryBaixa += "'" + idBaixa + "',";
                                        queryBaixa += "'" + EnterpriseID + "',";
                                        queryBaixa += "'" + element[0].idparcela + "',";
                                        queryBaixa += "'" + idBaixaProcesso + "',";
                                        queryBaixa += "'" + dataRecebimento.toISOString() + "',";
                                        queryBaixa += element[0].valorparcela;
                                        queryBaixa += "); ";
                            
                                        queryBaixa += "insert into contas_receber_baixas_formaspagamento (id,id_empresa,id_processo_recebimento,id_contas_receber_baixas,id_formapagamento,id_banco,id_movimento,nm_documento,id_dsg_banco,nm_conta,nm_agencia,vl_valor) values (";
                                        queryBaixa += "'" + idBaixaForma + "',";
                                        queryBaixa += "'" + EnterpriseID + "',";
                                        queryBaixa += "'" + idBaixaProcesso + "',";
                                        queryBaixa += "'" + idBaixa + "',";
                                        queryBaixa += "'" + idFormaPagamento + "',";
                                        queryBaixa += "'" + idBanco + "',";
                                        queryBaixa += "'" + idMovimento + "',";
                                        queryBaixa += "'" + parametros.documento + "',";
                                        queryBaixa += (parametros.idBancoOper == "" ? "null" : "'" + parametros.idBancoOper + "'") + ",";
                                        queryBaixa += "'" + parametros.contaOper + "',";
                                        queryBaixa += "'" + parametros.agenciaOper + "',";
                                        queryBaixa += element[0].valorparcela;
                                        queryBaixa += "); ";
                                        
                                        queryBaixa += "insert into movimentacao_bancaria (id,id_empresa,id_processo_recebimento,id_dsg_banco,nm_agencia,nm_conta,id_banco,dt_data,vl_valor,nm_tipo_movimentacao,nm_descricao,nm_documento,sn_conciliado) values ("
                                        queryBaixa += "'" + idMovimento + "',";
                                        queryBaixa += "'" + EnterpriseID + "',";
                                        queryBaixa += "'" + idBaixaProcesso + "',";
                                        queryBaixa += (parametros.idBancoOper == "" ? "null" : "'" + parametros.idBancoOper + "'") + ",";
                                        queryBaixa += "'" + parametros.agenciaOper + "',";
                                        queryBaixa += "'" + parametros.contaOper + "',";
                                        queryBaixa += "'" + idBanco + "',";
                                        queryBaixa += "'" + dataRecebimento.toISOString() + "',";
                                        queryBaixa += element[0].valorparcela    + ",";
                                        queryBaixa += "'E',";
                                        queryBaixa += "'" + descricao + "',";
                                        queryBaixa += "'" + parametros.documento + "',";
                                        queryBaixa += "0";
                                        queryBaixa += "); ";

                                        tituloBaixado = {
                                            idParcela: element[0].idparcela,
                                            valorBaixa: element[0].valorparcela,
                                            documento: parametros.documento,
                                            dataBaixa: dataRecebimento.toISOString(),
                                            idBanco: idBanco,
                                            idFormaPagamento: idFormaPagamento
                                        }
                                        resposta.titulosBaixados.push(tituloBaixado);
                                    }
                                    else{
                                        resposta.titulosRecusados.push(tituloRecusado);
                                    }
                                }
                                transacao = new sql.Transaction();
                                transacao.begin(err =>{
                                    try{
                                        var request = new sql.Request(transacao);
                                        request.query(queryBaixa, function (err, recordset) {
                                            if (err){
                                                resposta.status = -4;
                                                resposta.mensagem = [];
                                                resposta.mensagem.push("" + err);
                                                resposta.titulosRecusados = [];
                                                resposta.titulosBaixados = [];
                                                transacao.rollback();
                                                res.json(resposta);
                                            }
                                            else{
                                                resposta.status = 1;
                                                if(resposta.titulosRecusados.length > 0){
                                                    resposta.mensagem = ["Alguns títulos não puderam ser baixados."];
                                                }
                                                else{
                                                    resposta.mensagem = ["ok"];
                                                }
                                                transacao.commit();
                                                res.json(resposta);
                                            }
                                        })
                                    }
                                    catch(err){
                                        resposta.status = -5;
                                        resposta.mensagem = [];
                                        resposta.mensagem.push("" + err);
                                        resposta.titulosBaixados = [];
                                        resposta.titulosRecusados = [];
                                        res.json(resposta);                                    
                                    }
                                })
                            }
                            catch(err){
                                resposta.status = -7;
                                resposta.mensagem = [];
                                resposta.mensagem.push("" + err);
                                resposta.titulosBaixados = [];
                                resposta.titulosRecusados = [];
                                res.json(resposta);                                    
                            }
                        }
                    })
                }
                catch(err){
                    resposta.status = -6;
                    resposta.mensagem = [];
                    resposta.mensagem.push("" + err);
                    resposta.titulosBaixados = [];
                    resposta.titulosRecusados = [];
                    res.json(resposta);                                    
                }
            }
        })
    }
    catch(err){
        resposta.status = -1;
        resposta.mensagem = [];
        resposta.mensagem.push("" + err);
        resposta.titulosBaixados = [];
        resposta.titulosRecusados = [];
        res.json(resposta);
    }
})



/*------------------------------------------------------------------------------
Cancela o recebimento de várias contas
--------------------------------------------------------------------------------
*/
router.route('/cancelarmultirecebimento').post(function(req, res) {
    var query = "";
    var resposta = null;
    var recebimentoCancelado = null;
    var tituloRecusado = null;
    var parametros = null;
    var parcela = 0;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed

    resposta = {
        status: 0,
        mensagem: [],
        recebimentoCancelado: [],
        titulosRecusados: []
    }
    try{
        parametros = req.body.parametros;
        for(parcela = 0; parcela < parametros.listaParcelas.length; parcela++){
            query += "select cr.id idconta,parc.id idparcela,parc.nm_documento documento,parc.nr_parcela parcela,parc.vl_valor valorparcela,ent.nm_razaosocial razaosocial,"
            query += "(select sum(baixas.vl_valor) from contas_receber_baixas baixas where baixas.id_contas_receber_parcela = parc.id and baixas.id_empresa = '" + EnterpriseID + "')  totalbaixas";
            query += " from contas_receber_parcelas parc,contas_receber cr,entidade ent"
            query += " where parc.id = '" + parametros.listaParcelas[parcela] + "'";
            query += " and parc.id_empresa = '" + EnterpriseID + "'";
            query += " and cr.id = parc.id_contas_receber and cr.id_empresa = '" + EnterpriseID + "'";
            query += " and ent.id = cr.id_entidade and ent.id_empresa = '" + EnterpriseID + "'; ";
        }
        sql.close();
        sql.connect(config, function (err) {    
            if (err){
                resposta.status = -2;
                resposta.mensagem = [];
                resposta.mensagem.push("" + err);
                resposta.recebimentoCancelado = [];
                resposta.titulosRecusados = [];
                res.json(resposta);
            }
            else{
                try{
                    var request = new sql.Request();
                    request.query(query, function (err, recordset) {
                        if (err){
                            resposta.status = -3;
                            resposta.mensagem = [];
                            resposta.mensagem.push("" + err);
                            resposta.recebimentoCancelado = [];
                            resposta.titulosRecusados = [];
                            res.json(resposta);
                        }
                        else{
                            try{
                                var elementos = 0;
                                var element = null;
                                var queryBaixa = "";
                                var transacao = null;

                                for(elementos = 0; elementos < recordset.recordsets.length; elementos++){
                                    element = recordset.recordsets[elementos];

                                    tituloRecusado = {
                                        clifor: element[0].razaosocial,
                                        titulo: element[0].documento.trim() + "/" + element[0].parcela,
                                        mensagem: []
                                    }                                    

                                    if(element[0].totalbaixas == null)
                                        tituloRecusado.mensagem.push("Parcela não possui recebimento registrado.");

                                    if(tituloRecusado.mensagem.length == 0){
                                        queryBaixa += "delete movimentacao_bancaria where id_empresa = @idempresa and  id_processo_recebimento = (select id_processo_recebimento from contas_receber_baixas where id_empresa = @idempresa and id_contas_receber_parcela = '" + element[0].idparcela + "'); ";
                                        queryBaixa += "delete contas_receber_baixas_formaspagamento where id_empresa = @idempresa and id_processo_recebimento = (select id_processo_recebimento from contas_receber_baixas where id_empresa = @idempresa and id_contas_receber_parcela =  '" + element[0].idparcela + "'); ";
                                        queryBaixa += "delete contas_receber_baixas where id_empresa = @idempresa and id_contas_receber_parcela =  '" + element[0].idparcela + "'; ";

                                        recebimentoCancelado = {
                                            idParcela: element[0].idparcela,
                                            valorBaixa: element[0].valorparcela,
                                        }

                                        resposta.recebimentoCancelado.push(recebimentoCancelado);
                                    }
                                    else{
                                        resposta.titulosRecusados.push(tituloRecusado);
                                    }
                                }
                                transacao = new sql.Transaction();
                                transacao.begin(err =>{
                                    try{
                                        var request = new sql.Request(transacao);
                                        request.input("idempresa",EnterpriseID);
                                        request.query(queryBaixa, function (err, recordset) {
                                            if (err){
                                                resposta.status = -4;
                                                resposta.mensagem = [];
                                                resposta.mensagem.push("" + err);
                                                resposta.titulosRecusados = [];
                                                resposta.recebimentoCancelado = [];
                                                transacao.rollback();
                                                res.json(resposta);
                                            }
                                            else{
                                                resposta.status = 1;
                                                if(resposta.titulosRecusados.length > 0){
                                                    resposta.mensagem = ["Alguns recebimento não puderam ser cancelados."];
                                                }
                                                else{
                                                    resposta.mensagem = ["ok"];
                                                }
                                                transacao.commit();
                                                res.json(resposta);
                                            }
                                        })
                                    }
                                    catch(err){
                                        resposta.status = -5;
                                        resposta.mensagem = [];
                                        resposta.mensagem.push("" + err);
                                        resposta.recebimentoCancelado = [];
                                        resposta.titulosRecusados = [];
                                        res.json(resposta);                                    
                                    }
                                })
                            }
                            catch(err){
                                resposta.status = -7;
                                resposta.mensagem = [];
                                resposta.mensagem.push("" + err);
                                resposta.recebimentoCancelado = [];
                                resposta.titulosRecusados = [];
                                res.json(resposta);                                    
                            }
                        }
                    })
                }
                catch(err){
                    resposta.status = -6;
                    resposta.mensagem = [];
                    resposta.mensagem.push("" + err);
                    resposta.recebimentoCancelado = [];
                    resposta.titulosRecusados = [];
                    res.json(resposta);                                    
                }
            }
        })
    }
    catch(err){
        resposta.status = -1;
        resposta.mensagem = [];
        resposta.mensagem.push("" + err);
        resposta.recebimentoCancelado = [];
        resposta.titulosRecusados = [];
        res.json(resposta);
    }
})


/*------------------------------------------------------------------------------
Verifica se uma conta pode ser excluída.
--------------------------------------------------------------------------------
*/
router.route('/verificarexclusaoconta').post(function(req, res) {
    var query = "";
    var resposta = null;
    var parametros = null;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed

    resposta = {
        status: 1,
        mensagem: ["ok"]
    }
    res.json(resposta);
})


/*------------------------------------------------------------------------------
Exclui uma conta com suas parcelas.
--------------------------------------------------------------------------------
*/
router.route('/excluirconta').post(function(req, res) {
    var query = ""
    var resposta = null;
    var parametros = null;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed

    resposta = {
        status: 0,
        mensagem: [],
        documento: null
    }

    try{
        parametros = req.body.parametros;

        query += "select cr.id,cr.nm_documento,ent.nm_razaosocial from contas_receber cr,entidade ent";
        query += " where cr.id_empresa = '" + EnterpriseID + "'";
        query += " and cr.id = '" + parametros.idTitulo + "'";      
        query += " and ent.id = cr.id_entidade; ";

        query += "delete contas_receber_parcelas where id_empresa = '" + EnterpriseID + "'";
        query += " and id_contas_receber = '" + parametros.idTitulo + "'; ";
        
        query += "delete contas_receber where id_empresa = '" + EnterpriseID + "'";
        query += " and id = '" + parametros.idTitulo + "'";

        sql.close();
        sql.connect(config, function (err) {    
            if (err){
                resposta.status = -1;
                resposta.mensagem = [];
                resposta.mensagem.push("" + err);
                resposta.documento = null;
                sql.close();
                res.json(resposta);
            }
            else{
                try{
                    var transacao = new sql.Transaction();
                    transacao.begin(err =>{
                        var request = new sql.Request(transacao);
                        request.query(query, function (err, recordset) {
                            if (err){
                                resposta.status = -2;
                                resposta.mensagem = [];
                                resposta.mensagem.push("" + err);
                                resposta.documento = null;
                                transacao.rollback();
                                res.json(resposta);
                            }
                            else{
                                try{
                                    var element = recordset.recordsets[0];
                                    resposta.status = 1
                                    resposta.mensagem = ["ok"];
                                    resposta.documento = {
                                        idTitulo: element[0].id,
                                        documento: element[0].nm_documento,
                                        entidade: element[0].nm_razaosocial
                                    }
                                    transacao.commit();
                                    res.json(resposta);
                                }
                                catch(err){
                                    resposta.status = -3;
                                    resposta.mensagem = [];
                                    resposta.mensagem.push("" + err);
                                    resposta.documento = null;
                                    transacao.rollback();
                                    res.json(resposta);                
                                }
                            }
                        })
                    })
                }
                catch(err){
                    resposta.status = -4;
                    resposta.mensagem = [];
                    resposta.mensagem.push("" + err);
                    resposta.documento = null;
                    transacao.rollback();
                    res.json(resposta);
                }
            }
        });
    }
    catch(erro){
        resposta.status = -1;
        resposta.mensagem = [];
        resposta.documento = null;
        resposta.mensagem.push("" + erro);
        res.json(resposta);
    }
})



/*------------------------------------------------------------------------------
Atualiza uma parcela em particular
--------------------------------------------------------------------------------
*/
router.route('/atualizarparcela').post(function(req, res) {
    var query = "";
    var queryItens = "";
    var parcela = 0;
    var resposta = null;
    var parametros = null;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed

    resposta = {
        status: 0,
        mensagem: [],
        parcela: null
    }

    try{
        parametros = req.body.parametros;

        query += "update contas_receber_parcelas set "
        query += "id_banco = " + (parametros.idBanco == "" ? "null" : "'" + parametros.idBanco + "'") + ",";
        query += "id_forma_pagamento = " + (parametros.idFormaPagamento == "" ? "null" : "'" + parametros.idFormaPagamento + "'") + ",";
        query += "id_configuracao_cnab = " + (parametros.idConfCNAB == "" ? "null" : "'" + parametros.idConfCNAB + "'") + ",";
        query += "id_plano_contas_financeiro = " + (parametros.idContaFinanceira == "" ? "null" : "'" + parametros.idContaFinanceira + "'") + ",";
        query += "nr_parcela = '" + parametros.parcela + "',";
        query += "dt_data_vencimento = '" + parametros.vencimento + "',";
        query += "vl_valor = " + parametros.valor + ",";
        query += "nm_documento = '" + parametros.documento + "',";
        query += "sn_fluxocaixa = " + parametros.fluxoCaixa;
        query += " where id = '" + parametros.idParcela + "'"
        query += " and id_empresa = '" + EnterpriseID + "'";

        sql.close();
        sql.connect(config, function (err) {    
            if (err){
                resposta.status = -2;
                resposta.mensagem = [];
                resposta.mensagem.push("" + err);
                parcela = null;
                res.json(resposta);
            }
            else{
                try{
                    var transacao = new sql.Transaction();
                    transacao.begin(err =>{
                        var request = new sql.Request(transacao);
                        request.query(query, function (err, recordset) {
                            if (err){
                                resposta.status = -3;
                                resposta.mensagem = [];
                                resposta.mensagem.push("" + err);
                                parcela = null;
                                transacao.rollback();
                                res.json(resposta);
                            }
                            else{
                                resposta.status = 1;
                                resposta.mensagem = ["ok"];
                                resposta.parcela =  parametros;
                                transacao.commit();
                                res.json(resposta);                                    
                                }
                        })
                    })
                }
                catch(err){
                    resposta.status = -4;
                    resposta.mensagem = [];
                    resposta.mensagem.push("" + erro);
                    parcela = null;
                    res.json(resposta);                    
                }
            }
        });
    }
    catch(erro){
        resposta.status = -1;
        resposta.mensagem = [];
        resposta.mensagem.push("" + erro);
        titulo = null;
        res.json(resposta);
    }
})




/*------------------------------------------------------------------------------
Cria as parcelas conforme o tipo de parcelamento.
--------------------------------------------------------------------------------
*/
router.route('/criarparcelas').post(function(req, res) {
    var parcela = 0;
    var resposta = null;
    var parametros = null;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed

    resposta = {
        status: 0,
        mensagem: [],
        parcelas: [],
    }

    try{
        parametros = req.body.parametros;
        if(parametros.emissao == null || parametros.emissao == "" || parametros.emissao.indexOf("undefined") >= 0){
            throw "Data de emissão inválida."
        }
        else{
            if(parametros.idParcelamento == null || parametros.idParcelamento == ""){
                throw "Parcelamento não definido."
            }
        }

        funcoesFinanceiro.gerarparcelas(config,EnterpriseID,parametros.idParcelamento,parametros.valor,new Date(parametros.emissao),(function(resposta){
            try{
                if(resposta.status > 0){
                    for(parcela = 0; parcela < resposta.parcelas.length; parcela++){
                        resposta.parcelas[parcela].documento = parametros.documento;
                        resposta.parcelas[parcela].idContaFinanceira = parametros.idContaFinanceira;
                        resposta.parcelas[parcela].fluxoCaixa = "Sim";
                    }
                }
               res.json(resposta);
            }
            catch(erro){
                resposta.status = -2;
                resposta.mensagem = [];
                resposta.mensagem.push("criarparcelas: " + erro);
                resposta.parcelas = [];
                sql.close();
                res.json(resposta);
            }
        }));
    }
    catch(erro){
        resposta.status = -1;
        resposta.mensagem = [];
        resposta.mensagem.push("criarparcelas: " + erro);
        resposta.parcelas = [];
        res.json(resposta);
    }
})