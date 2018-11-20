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

//% servicos/movimentacaoservicos/carregaSubServico 


//* servicos/movimentacaoservicos/testeconexao 

router.route('/testeconexao').get(function(req, res) {

sql.close(); 
 sql.connect(config, function (err) { 
 var select = "SELECT nm_razaosocial AS 'razao' FROM entidade ";
 var request = new sql.Request(); 
 request.query(select, function (err, recordset){
 if (err) console.log(err) 
 res.send(recordset);
});
});

});
//% servicos/movimentacaoservicos/testeconexao 



//* servicos/movimentacaoservicos/carregaSubServico 

router.route('/carregaSubServico/:idProdutos/:idEntidade').get(function(req, res) {
    var idProdutos = req.param('idProdutos');
    var idEntidade = req.param('idEntidade');
    sql.close();
    sql.connect(config, function (err) {
        if (err) console.log(err); 
        var select = "SELECT produtos.id AS 'id', produtos.nm_descricao AS 'desc', (SELECT TOP 1 cliente_servicos.id_dsg_moeda FROM cliente_servicos WHERE id_entidade='" + idEntidade + "' AND id_produtos=produtos.id) AS 'moeda', (SELECT TOP 1 cliente_servicos.vl_valor FROM cliente_servicos WHERE id_entidade='" + idEntidade + "' AND id_produtos=produtos.id) AS 'precovenda'   FROM produtos_subservicos INNER JOIN produtos ON produtos.id=produtos_subservicos.id_subservicos WHERE produtos_subservicos.id_produtos='" + idProdutos + "';";
        select += " SELECT produtos.id AS 'id',  produtos.nm_descricao AS 'desc', (SELECT TOP 1 cliente_servicos.id_dsg_moeda FROM cliente_servicos WHERE id_entidade='" + idEntidade + "' AND id_produtos=produtos.id) AS 'moeda', (SELECT TOP 1 cliente_servicos.vl_valor FROM cliente_servicos WHERE id_entidade='" + idEntidade + "' AND id_produtos=produtos.id) AS 'precovenda'   FROM produtos WHERE produtos.id='" + idProdutos + "' ";
        
        console.log(select)
        var request = new sql.Request();
        request.query(select, function (err, recordset){ 
            if (err) console.log(err); 

            
            res.send(recordset);
        });
    });
});
//% servicos/movimentacaoservicos/carregaSubServico 

//* servicos/movimentacaoservicos/testesoma 

router.route('/testesoma/:param1/:param2').get(function(req, res) {
var param1 = req.param('param1');
var param2 = req.param('param2');

 res.send(param1 + ' - ' + param2);
});
//% servicos/movimentacaoservicos/testesoma 

//* servicos/movimentacaoservicos/carregaListaServicos 

router.route('/carregaListaServicos/:idEntidade/:dataDe/:dataAte/:fat/:bol').get(function(req, res) {
var idEntidade = req.param('idEntidade');
var dataDe = req.param('dataDe');
var dataAte = req.param('dataAte');
var fat = req.param('fat');
var bol = req.param('bol');


    var where = ""; 
    var select = "SELECT newID() AS 'id', "; 
    select += " entidade.nm_cnpj AS 'cnpj', "; 
    select += " entidade.nm_razaosocial AS 'razaosocial', "; 
    select += " FORMAT(SUM(movimentacao_servicos.vl_valor), 'c', 'pt-BR' )  AS 'dt_faturamento', "; 
    select += " FORMAT(movimentacao_servicos.dt_faturamento, 'd', 'pt-BR' )  AS 'valor', "; 
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
            dataDe = dataDe.replace("-","/"); 
            dataDe = dataDe.replace("-","/"); 
            if(!where){ 
                where += " WHERE FORMAT(movimentacao_servicos.dt_emissao, 'd', 'pt-BR' ) >= '" + dataDe + "' "; 
            }else{ 
                where += " AND FORMAT(movimentacao_servicos.dt_emissao, 'd', 'pt-BR' ) >= '" + dataDe + "' "; 
            } 
        } 
    } 
    if(dataAte){ 
        if(dataAte != "*"){ 
            dataAte = dataAte.replace("-","/"); 
            dataAte = dataAte.replace("-","/"); 
            if(!where){ 
                where += " WHERE FORMAT(movimentacao_servicos.dt_emissao, 'd', 'pt-BR' ) <= '" + dataAte + "' "; 
            }else{ 
                where += " AND FORMAT(movimentacao_servicos.dt_emissao, 'd', 'pt-BR' ) <= '" + dataAte + "' "; 
            } 
        } 
    } 
    if(fat){ 
        if(fat == "true"){ 
            if(!where){ 
                where += " WHERE movimentacao_servicos.nm_numero_nfes  IS NOT NULL "; 
            }else{ 
                where += " AND  movimentacao_servicos.nm_numero_nfes  IS NOT NULL "; 
            } 
        }else{
            if(!where){ 
                where += " WHERE movimentacao_servicos.nm_numero_nfes  IS  NULL "; 
            }else{ 
                where += " AND  movimentacao_servicos.nm_numero_nfes  IS  NULL "; 
            } 
        }
    } 
    if(bol){ 
        if(bol == "true"){ 
            if(!where){ 
                where += " WHERE movimentacao_servicos.nm_numero_boleto  IS NOT NULL "; 
            }else{ 
                where += " AND  movimentacao_servicos.nm_numero_boleto  IS NOT NULL "; 
            } 
        } 
    } else{
        if(bol == "true"){ 
            if(!where){ 
                where += " WHERE movimentacao_servicos.nm_numero_boleto  IS  NULL "; 
            }else{ 
                where += " AND  movimentacao_servicos.nm_numero_boleto  IS  NULL "; 
            } 
        } 

    }

    select = select + where; 
    select = select + "  GROUP BY entidade.nm_cnpj, entidade.nm_razaosocial,  movimentacao_servicos.dt_faturamento,  movimentacao_servicos.nm_numero_nfes,  movimentacao_servicos.nm_numero_boleto";
    
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
//% servicos/movimentacaoservicos/carregaListaServicos 

router.route('/carregaListaComissao/:idEntidade/:dataDe/:dataAte/:equipe/:servico/:status/:mes').get(function(req, res) {
    var idEntidade = req.param('idEntidade');
    var dataDe = req.param('dataDe');
    var dataAte = req.param('dataAte');
    var equipe = req.param('equipe');
    var servico = req.param('servico');
    var status = req.param('status');
    var mes = req.param('mes');

    var where = ""; 
    var select = "";
    select += " SELECT  comiss.id as 'id', FORMAT (comiss.dt_emissao, 'd', 'pt-BR' ) as 'dt_emissao', entidade.nm_razaosocial as 'cliente',  ";
    select += " op.nm_razaosocial as 'operador', produtos.nm_descricao as 'produto', comiss.vl_venda as 'valorvenda', comiss.nm_status as 'status', comiss.vl_comissao as 'valor', ";
    select += " (SELECT TOP 1 vl_comissaooperador FROM vendedor_servicos WHERE vendedor_servicos.id_vendedor=comiss.id_vendedor AND vendedor_servicos.id_produtos = movimentacao_servicos.id_produtos) as'percentualcomiss', ";
    select += " FORMAT ((comiss.vl_comissao - ((SELECT vl_tributoservicos FROM empresa WHERE empresa.id='9F39BDCF-6B98-45DE-A819-24B7F3EE2560')) * movimentacao_servicos.vl_valor / 100 ), 'c', 'pt-BR' ) AS 'valorliquido' ";
    select += " FROM movimentacao_servicos ";
    select += " INNER JOIN comiss ON comiss.id_venda=movimentacao_servicos.id ";
    select += " INNER JOIN entidade ON entidade.id=movimentacao_servicos.id_entidade ";
    select += " INNER JOIN entidade op ON op.id=comiss.id_vendedor ";
    select += " INNER JOIN entidade ind ON ind.id = comiss.id_vendedor   ";
    select += " INNER JOIN produtos ON produtos.id=movimentacao_servicos.id_produtos ";

    if(idEntidade){ 
        if(idEntidade != "*"){ 
            where += " WHERE (op.id='" + idEntidade + "' OR ind.id='" + idEntidade + "' "; 
        } 
    } 
    
    if(dataDe){ 
        if(dataDe != "*"){ 
            dataDe = dataDe.replace("-","/"); 
            dataDe = dataDe.replace("-","/"); 
            if(!where){ 
                where += " WHERE FORMAT(comiss.dt_emissao, 'd', 'pt-BR' ) >= '" + dataDe + "' "; 
            }else{ 
                where += " AND FORMAT(comiss.dt_emissao, 'd', 'pt-BR' ) >= '" + dataDe + "' "; 
            } 
        } 
    } 

    if(dataAte){ 
        if(dataAte != "*"){ 
            dataAte = dataAte.replace("-","/"); 
            dataAte = dataAte.replace("-","/"); 
            if(!where){ 
                where += " WHERE FORMAT(comiss.dt_emissao, 'd', 'pt-BR' ) <= '" + dataAte + "' "; 
            }else{ 
                where += " AND FORMAT(comiss.dt_emissao, 'd', 'pt-BR' ) <= '" + dataAte + "' "; 
            } 
        } 
    } 
    
    if(equipe){ 
        if(equipe != "*"){ 
            if(!where){ 
                where += " WHERE (op.id_equipe = '" + equipe + "' OR ind.id_equipe = '" + equipe + "') "; 
            }else{ 
                where += " AND (op.id_equipe = '" + equipe + "' OR ind.id_equipe = '" + equipe + "')  "; 
            } 
        } 
    } 
    
    if(servico){ 
        if(servico != "*"){ 
            if(!where){ 
                where += " WHERE movimentacao_servicos.id_produtos = '" + servico + "' "; 
            }else{ 
                where += " AND movimentacao_servicos.id_produtos = '" + servico + "' "; 
            } 
        } 
    } 

    if(status){ 
        if(status != "*"){ 
            if(!where){ 
                where += " WHERE (comiss.nm_status = '" + status + "') "; 
            }else{ 
                where += " AND (comiss.nm_status = '" + status + "')  "; 
            } 
        } 
    } 
    
    if(mes){ 
        if(mes != "*"){ 
            var dataFull = new Date();
            var ano4    = dataFull.getFullYear();
            if(mes.length == 1){
                mes = "0" + mes;
            }
            if(!where){ 
                where += " WHERE (SUBSTRING(CONVERT(CHAR(8),comiss.dt_emissao,112),1,6)='" + ano4 + mes + "') "; 
            }else{ 
                where += " AND (SUBSTRING(CONVERT(CHAR(8),comiss.dt_emissao,112),1,6)='" + ano4 + mes + "') "; 
            } 
        } 
    } 

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

router.route('/carregaListaDetalhesServicos/:dataDe/:dataAte/:cliente/:cnpj/:dtfat/:nfse/:bol').get(function(req, res) {
    var cliente = req.param('cliente');
    var dataDe = req.param('dataDe');
    var dataAte = req.param('dataAte');
    var cnpj = req.param('cnpj');
    var dtfat = req.param('dtfat');
    var nfse = req.param('nfse');
    var bol = req.param('bol');
    
    cnpj = cnpj.replace("(*_*)","/");

    var where = ""; 
    var select = "SELECT newID() AS 'id', "; 
    select += " movimentacao_servicos.nm_documento AS 'doc', "; 
    select += " FORMAT(movimentacao_servicos.dt_emissao, 'd', 'pt-BR' ) AS 'data', "; 
    select += " entidade.nm_razaosocial AS 'razaosocial', "; 
    select += " (prod.nm_descricao + ' - ' + sub.nm_descricao) AS 'prodSub', "; 
    select += " FORMAT(movimentacao_servicos.vl_valor, 'c', 'pt-BR' )  AS 'valor'  "; 
    select += " FROM movimentacao_servicos "; 
    select += " INNER JOIN produtos sub ON sub.id=movimentacao_servicos.id_subservicos "; 
    select += " INNER JOIN produtos prod ON prod.id=movimentacao_servicos.id_produtos "; 
    select += " INNER JOIN entidade ON entidade.id=movimentacao_servicos.id_entidade "; 
    if(cliente != "-"){ 
        where = " WHERE entidade.nm_razaosocial='" + cliente + "' "; 
    }

    if(cnpj != "-"){ 
        if(!where){ 
            where += " WHERE entidade.nm_cnpj = '" + cnpj + "' "; 
        }else{ 
            where += " AND entidade.nm_cnpj = '" + cnpj + "' "; 
        } 
    }else{
        if(!where){ 
            where += " WHERE entidade.nm_cnpj IS NULL "; 
        }else{ 
            where += " AND entidade.nm_cnpj IS NULL  "; 
        } 
    }

    if(dtfat != "-"){ 
        dtfat = dtfat.replace("-","/"); 
        dtfat = dtfat.replace("-","/");
        if(!where){ 
            where += " WHERE FORMAT(movimentacao_servicos.dt_faturamento, 'd', 'pt-BR' ) = '" + dtfat + "' "; 
        }else{ 
            where += " AND FORMAT(movimentacao_servicos.dt_faturamento, 'd', 'pt-BR' ) = '" + dtfat + "' "; 
        } 
    }else{
        if(!where){ 
            where += " WHERE movimentacao_servicos.dt_faturamento IS NULL "; 
        }else{ 
            where += " AND movimentacao_servicos.dt_faturamento IS NULL  "; 
        } 
    }
    
    if(nfse != "-"){ 
        if(!where){ 
            where += " WHERE movimentacao_servicos.nm_numero_nfes = '" + nfse + "' "; 
        }else{ 
            where += " AND movimentacao_servicos.nm_numero_nfes = '" + nfse + "' "; 
        } 
    }else{
        if(!where){ 
            where += " WHERE movimentacao_servicos.nm_numero_nfes IS NULL "; 
        }else{ 
            where += " AND movimentacao_servicos.nm_numero_nfes IS NULL  "; 
        } 
    }
    
    if(bol != "-"){  
        if(!where){ 
            where += " WHERE movimentacao_servicos.nm_numero_boleto = '" + bol + "' "; 
        }else{ 
            where += " AND movimentacao_servicos.nm_numero_boleto = '" + bol + "' "; 
        } 
    }else{
        if(!where){ 
            where += " WHERE movimentacao_servicos.nm_numero_boleto IS NULL "; 
        }else{ 
            where += " AND movimentacao_servicos.nm_numero_boleto IS NULL  "; 
        } 
    }
    if(dataDe){ 
        if(dataDe != "*"){ 
            dataDe = dataDe.replace("-","/"); 
            dataDe = dataDe.replace("-","/"); 
            if(!where){ 
                where += " WHERE FORMAT(movimentacao_servicos.dt_emissao, 'd', 'pt-BR' ) >= '" + dataDe + "' "; 
            }else{ 
                where += " AND FORMAT(movimentacao_servicos.dt_emissao, 'd', 'pt-BR' ) >= '" + dataDe + "' "; 
            } 
        } 
    } 
    if(dataAte){ 
        if(dataAte != "*"){ 
            dataAte = dataAte.replace("-","/"); 
            dataAte = dataAte.replace("-","/"); 
            if(!where){ 
                where += " WHERE FORMAT(movimentacao_servicos.dt_emissao, 'd', 'pt-BR' ) <= '" + dataAte + "' "; 
            }else{ 
                where += " AND FORMAT(movimentacao_servicos.dt_emissao, 'd', 'pt-BR' ) <= '" + dataAte + "' "; 
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

router.route('/carregaListaComissaoEquipe').get(function(req, res) {
    
    var where = ""; 
    var select = "SELECT newID() AS 'id', "; 
    select += " movimentacao_servicos.nm_documento AS 'doc', "; 
    select += " FORMAT(movimentacao_servicos.dt_emissao, 'd', 'pt-BR' ) AS 'data', "; 
    select += " entidade.nm_razaosocial AS 'razaosocial', "; 
    select += " (prod.nm_descricao + ' - ' + sub.nm_descricao) AS 'prodSub', "; 
    select += " FORMAT(movimentacao_servicos.vl_valor, 'c', 'pt-BR' )  AS 'valor'  "; 
    select += " FROM movimentacao_servicos "; 
    select += " INNER JOIN produtos sub ON sub.id=movimentacao_servicos.id_subservicos "; 
    select += " INNER JOIN produtos prod ON prod.id=movimentacao_servicos.id_produtos "; 
    select += " INNER JOIN entidade ON entidade.id=movimentacao_servicos.id_entidade "; 
    //if(cliente != "-"){ 
    //    where = " WHERE entidade.nm_razaosocial='" + cliente + "' "; 
    //}

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

router.route('/concluirComissao').post(function(req, res) {   
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed
    var full = req.host; 
    var submit = req.body;
    var sqlstring = "";

    for(var i = 0; i < submit.array.length; i++){
        sqlstring += "UPDATE comiss SET nm_status='Em Pagamento' WHERE id='" + submit.array[i] + "'; ";
    }
    
    sql.close()
    sql.connect(config).then(function() {
        var request = new sql.Request();
        request.query(sqlstring).then(function(recordset) {
            res.send(true)
        }).catch(function(err) { 
            console.log(err)                   
            res.send(false)
        });
    })
});

router.route('/carregaControleComissaoPagar/:dataDe/:dataAte/:equipe').get(function(req, res) {
    
    var dataDe = req.param('dataDe');
    var dataAte = req.param('dataAte');
    var equipe = req.param('equipe');

    var where = ""; 
    var select = "";

    var campoequipe = "";

    if(equipe != "*" && equipe){
        campoequipe = "='" + equipe + "'"
    }else{        
        campoequipe = " IS NULL"
    }

    select += " SELECT IIF((SELECT id FROM comissao_apuracao WHERE comissao_apuracao.id_entidade=op.id ";
    select += "     AND comissao_apuracao.nm_datade='" + dataDe + "' AND comissao_apuracao.nm_dataate='" + dataAte + "' AND comissao_apuracao.id_equipe " + campoequipe + ") IS NULL, NEWID(), ";
    select += "     (SELECT id FROM comissao_apuracao WHERE comissao_apuracao.id_entidade=op.id ";
    select += "     AND comissao_apuracao.nm_datade='" + dataDe + "' AND comissao_apuracao.nm_dataate='" + dataAte + "' AND comissao_apuracao.id_equipe " + campoequipe ;
    select += "     )) as 'id',  ";
    select += " op.id as 'idoperador',  ";
    select += " op.nm_razaosocial as 'operador',  FORMAT(SUM(comiss.vl_venda), 'c', 'pt-BR' ) as 'valorvenda', FORMAT(SUM(comiss.vl_comissao), 'c', 'pt-BR' ) as 'valor',  ";
    select += " FORMAT (SUM(comiss.vl_comissao) - IIF((SELECT SUM(vl_desconto) FROM comissao_desconto WHERE id_contas_pagar=(SELECT id FROM comissao_apuracao WHERE comissao_apuracao.id_entidade=op.id  AND comissao_apuracao.nm_datade='" + dataDe + "' AND comissao_apuracao.nm_dataate='" + dataAte + "' AND comissao_apuracao.id_equipe  " + campoequipe + ")) IS NULL,0,(SELECT SUM(vl_desconto) FROM comissao_desconto WHERE id_contas_pagar=(SELECT id FROM comissao_apuracao WHERE comissao_apuracao.id_entidade=op.id  AND comissao_apuracao.nm_datade='" + dataDe + "' AND comissao_apuracao.nm_dataate='" + dataAte + "' AND comissao_apuracao.id_equipe  " + campoequipe + "))), 'c', 'pt-BR' ) AS 'valorliquido' , ";
    select += " (SELECT FORMAT (SUM(vl_desconto), 'c', 'pt-BR' ) FROM comissao_desconto WHERE id_contas_pagar=(SELECT id FROM comissao_apuracao WHERE comissao_apuracao.id_entidade=op.id  AND comissao_apuracao.nm_datade='" + dataDe + "' AND comissao_apuracao.nm_dataate='" + dataAte + "' AND comissao_apuracao.id_equipe  " + campoequipe + ")) as desconto  ";
    select += " FROM movimentacao_servicos  ";
    select += " INNER JOIN comiss ON comiss.id_venda=movimentacao_servicos.id ";
    select += " INNER JOIN entidade op ON op.id=comiss.id_vendedor   ";
    
    where += " WHERE comiss.nm_status='Em Pagamento' ";

    if(dataDe){ 
        if(dataDe != "*"){ 
            dataDe = dataDe.replace("-","/"); 
            dataDe = dataDe.replace("-","/"); 
            if(!where){ 
                where += " WHERE FORMAT(comiss.dt_emissao, 'd', 'pt-BR' ) >= '" + dataDe + "' "; 
            }else{ 
                where += " AND FORMAT(comiss.dt_emissao, 'd', 'pt-BR' ) >= '" + dataDe + "' "; 
            } 
        } 
    } 

    if(dataAte){ 
        if(dataAte != "*"){ 
            dataAte = dataAte.replace("-","/"); 
            dataAte = dataAte.replace("-","/"); 
            if(!where){ 
                where += " WHERE FORMAT(comiss.dt_emissao, 'd', 'pt-BR' ) <= '" + dataAte + "' "; 
            }else{ 
                where += " AND FORMAT(comiss.dt_emissao, 'd', 'pt-BR' ) <= '" + dataAte + "' "; 
            } 
        } 
    } 
    
    if(equipe){ 
        if(equipe != "*"){ 
            if(!where){ 
                where += " WHERE (op.id_equipe = '" + equipe + "') "; 
            }else{ 
                where += " AND (op.id_equipe = '" + equipe + "')  "; 
            } 
        }else{
            if(!where){ 
                where += " WHERE (op.id_equipe IS NULL) "; 
            }else{ 
                where += " AND (op.id_equipe  IS NULL)  "; 
            } 
        } 
    } 
    
    select = select + where; 
    select += " GROUP BY op.nm_razaosocial, op.id ";
    console.log(select);

    sql.close(); 
    sql.connect(config, function (err) { 
        if (err) console.log(err); 
         var request = new sql.Request(); 
        request.query(select, function (err, recordset){ 
            if (err) console.log(err); 

            var retorno = recordset;
            var sqlstring = "";
            
                       
            if(equipe == "*"){
                equipe = "NULL";
            }else{
                equipe = "'" + equipe + "'";
            }

            if(retorno.recordset){
                sqlstring += " DELETE FROM comissao_apuracao WHERE nm_datade='" + dataDe + "' AND nm_dataate='" + dataAte + "' AND id_equipe " + campoequipe + "; ";
             
                for(var i = 0; i < retorno.recordset.length; i++){
                    sqlstring += " INSERT INTO comissao_apuracao (id, id_entidade, nm_datade, nm_dataate, id_equipe) VALUES('" + retorno.recordset[i].id + "','" + retorno.recordset[i].idoperador + "', '" + dataDe + "', '" + dataAte + "' , " + equipe + "); ";
                }
            }
            
            sql.close()
            sql.connect(config).then(function() {
                var request = new sql.Request();
                request.query(sqlstring).then(function(recordset) {
                    res.send(retorno); 
                }).catch(function(err) { 
                    console.log(err)                   
                    res.send(false)
                });
            });

            
        }); 
     }); 

});

router.route('/carregaListaEquipe').get(function(req, res) {
    var retorno = "<option value=''>Selecione...</option>";
    var select = "SELECT equipe.id AS 'id', "; 
    select += " equipe.nm_descricao AS 'descricao' "; 
    select += " FROM equipe "; 

    sql.close(); 
    sql.connect(config, function (err) { 
        if (err) console.log(err); 
        var request = new sql.Request(); 
        request.query(select, function (err, recordset){ 
                if (err) console.log(err);
                
                for(var i = 0; i < recordset.recordset.length; i++){
                    retorno += "<option value='" + recordset.recordset[i].id + "'>" + recordset.recordset[i].descricao + "</option>"; 
                }
                
                res.send(retorno); 
        }); 
    }); 
});

router.route('/gravarControleComissaoPagarDesconto/:descricao/:desconto/:idcomissaoapuracao/:id').get(function(req, res) { 
    var id = req.param('id');   
    var descricao = req.param('descricao'); 
    var desconto = req.param('desconto'); 
    var idcomissaoapuracao = req.param('idcomissaoapuracao'); 

    var insertupdate = ""; 

    if(desconto.indexOf(',') >= 0){
        desconto = desconto.replace(".", "").replace(",", ".");
    }

    if(id == "*"){
        insertupdate = "INSERT INTO comissao_desconto (id, nm_descricao, id_contas_pagar, vl_desconto) ";
        insertupdate += " VALUES(newID(), '" + descricao + "', '" + idcomissaoapuracao + "', '" + desconto + "')";
    }else{
        
        insertupdate = "UPDATE comissao_desconto SET nm_descricao='" + descricao + "', vl_desconto=" + desconto + " WHERE id='" + id + "'";
    }

    console.log(insertupdate);

    sql.close(); 
    sql.connect(config, function (err) { 
        if (err) console.log(err); 
        var request = new sql.Request(); 
        request.query(insertupdate, function (err, recordset){ 
            if (err) console.log(err);
                            
            res.send(true); 
        }); 
    });  
});

router.route('/carregaDropdownSubservicosMovimentacao/:id').get(function(req, res) {
   var retorno = "<option value=''>Selecione...</option>";
    var id = req.param('id'); 
    var select = "SELECT produtos.id AS 'id', produtos.nm_descricao AS 'descricao', "; 
    select += " movimentacao_servicos.id_subservicos AS 'index' , produtos.id_dsg_moeda AS 'idmoeda',";
    select += " (SELECT vl_valor FROM cliente_servicos WHERE cliente_servicos.id_dsg_moeda=produtos.id_dsg_moeda AND cliente_servicos.id_produtos=produtos.id AND cliente_servicos.id_entidade=movimentacao_servicos.id_entidade) AS 'valorproduto' ";
    select += " FROM movimentacao_servicos ";
    select += " INNER JOIN produtos_subservicos ON produtos_subservicos.id_produtos=movimentacao_servicos.id_produtos ";
    select += " INNER JOIN produtos ON produtos.id=produtos_subservicos.id_subservicos ";
    select += " WHERE movimentacao_servicos.id='" + id + "' ";
    
    sql.close(); 
    sql.connect(config, function (err) { 
        if (err) console.log(err); 
        var request = new sql.Request(); 
        request.query(select, function (err, recordset){ 
                if (err) console.log(err);
                
                var selected = "";
                console.log(recordset.recordset)
                for(var i = 0; i < recordset.recordset.length; i++){
                    selected = "";
                    if(recordset.recordset[i].id == recordset.recordset[i].index){
                        selected ="selected='selected'";
                    }
                    //retorno += "<option " + selected + " value='" + recordset.recordset[i].id + "'>" + recordset.recordset[i].descricao + "</option>"; 
                    
                    retorno += "<option " + selected + "  data-idoption='" + recordset.recordset[i].id + "' data-valorvenda='" + recordset.recordset[i].valorproduto + "' data-moedavenda='" + recordset.recordset[i].idmoeda + "' value='" + recordset.recordset[i].id + "'>" + recordset.recordset[i].descricao + "</option>";

                }
                
                res.send(retorno); 
        }); 
    }); 
});

router.route('/gerarComissao/:id').get(function(req, res) { 
    var id = req.param('id');   

    var select = " SELECT  ";
    select += " (SELECT TOP 1 id FROM comiss WHERE id_venda=movimentacao_servicos.id AND comiss.id_vendedor=movimentacao_servicos.id_operador) AS 'idop', ";
    select += " (SELECT TOP 1 id FROM comiss WHERE id_venda=movimentacao_servicos.id AND comiss.id_vendedor=movimentacao_servicos.id_indicador) AS 'idind', ";
    select += " movimentacao_servicos.id_operador AS 'idoperador', ";
    select += " movimentacao_servicos.id_indicador AS 'idindicador',  ";
    select += " (SELECT TOP 1 nm_status FROM comiss WHERE id_venda=movimentacao_servicos.id AND id_operador=movimentacao_servicos.id_operador) AS 'statusop', ";
    select += " (SELECT TOP 1 nm_status FROM comiss WHERE id_venda=movimentacao_servicos.id AND id_operador=movimentacao_servicos.id_indicador) AS 'statusind', ";
    select += " (SELECT TOP 1 vl_comissaooperador FROM vendedor_servicos WHERE vendedor_servicos.id_vendedor=movimentacao_servicos.id_operador AND vendedor_servicos.id_produtos=movimentacao_servicos.id_produtos) AS 'comissaopercop', ";
    select += " (SELECT TOP 1 vl_comissaooperador FROM vendedor_servicos WHERE vendedor_servicos.id_vendedor=movimentacao_servicos.id_indicador AND vendedor_servicos.id_produtos=movimentacao_servicos.id_produtos) AS 'comissaopercind'  ";
    select += " , movimentacao_servicos.vl_valor AS 'valormov' ";
 
    select += " FROM movimentacao_servicos ";
    select += " LEFT JOIN comiss ON comiss.id_venda=movimentacao_servicos.id ";

    select += " WHERE movimentacao_servicos.id='" + id + "' ";
    
    sql.close(); 
    sql.connect(config, function (err) { 
        if (err) console.log(err); 
        var request = new sql.Request(); 
        request.query(select, function (err, recordset){ 
            if (err) console.log(err);
                                 

            if(recordset.recordset.length > 0){
                if(recordset.recordset[0].statusop == "Concluído"){
                    var sucesso = false;
                    var message = "Status Concluído não gera comissão";

                    var resposta = {
                        success: sucesso,
                        message: message
                    }
                    res.json(resposta);
                }
                

                var idcomissop =  recordset.recordset[0].idop;
                var idcomissind =  recordset.recordset[0].idind;
                var idcomiss = recordset.recordset[0].id;
                var id_operador = recordset.recordset[0].idoperador;
                var id_indicador = recordset.recordset[0].idindicador;
                var nm_status = "Pendente";
                var id_empresa = "9F39BDCF-6B98-45DE-A819-24B7F3EE2560";
                var numero_pedido = "";
                var dt_emissao = "";
                var vl_venda =  recordset.recordset[0].valormov;
                var vl_comissaoOp = "";
                var vl_comissaoInd = "";
                var vl_comissaopercOP = recordset.recordset[0].comissaopercop;
                var vl_comissaopercIND = recordset.recordset[0].comissaopercind;
                
                var insertupdate = ""; 

                var today = new Date();
                var dd = today.getDate();
                var mm = today.getMonth() + 1;

                var yyyy = today.getFullYear();
                if(dd<10){
                    dd='0'+dd;
                } 
                if(mm<10){
                    mm='0'+mm;
                } 
                var dt_emissao = mm + '/' + dd + '/' + yyyy;   
                var valorcomiss = 0;

                if((idcomissop != null && idcomissind == null) || (idcomissop == idcomissind && idcomissop != null && idcomissind != null)){
                   
                    if(vl_comissaopercOP){
                        valorcomiss = (parseFloat(vl_venda) * parseFloat(vl_comissaopercOP).toFixed(2)) / 100;
                        vl_comissaoOp = valorcomiss.toString();
                    }
                    id_indicador = "";
                }else{
                    if(id_operador != id_indicador){
                        if(vl_comissaopercIND){
                            valorcomiss = (parseFloat(vl_venda) * parseFloat(vl_comissaopercIND).toFixed(2)) / 100;
                            valorcomiss = valorcomiss.toFixed(2);                                
                            vl_comissaoInd = valorcomiss.toString();

                            if(vl_comissaopercOP){
                                valorcomiss = ((parseFloat(vl_venda) - parseFloat(vl_comissaoInd)) * parseFloat(vl_comissaopercOP).toFixed(2)) / 100;
                                valorcomiss = valorcomiss.toFixed(2); 
                                vl_comissaoOp = valorcomiss.toString();
                            }
                            
                        }
                    }
                }


                if(idcomissop == null){
                    if(id_operador){
                        insertupdate = " INSERT INTO comiss ";
                        insertupdate += " (id, id_vendedor, id_venda, nm_status, id_empresa, numero_pedido, dt_emissao, vl_venda, vl_comissao)";
                        insertupdate += " VALUES(newID(), '" + id_operador + "', '" + id + "', '" + nm_status + "', '" + id_empresa + "', '" + numero_pedido + "', '" + dt_emissao + "', " + vl_venda + ", " + vl_comissaoOp + ");";          
                    }
                }else{
                    if(id_operador){
                        insertupdate += " UPDATE comiss SET id_vendedor='" + id_operador + "',id_venda='" + id + "', nm_status='" + nm_status + "', id_empresa='" + id_empresa + "', numero_pedido='" + numero_pedido + "', dt_emissao='" + dt_emissao + "', vl_venda=" + vl_venda + ", vl_comissao=" + vl_comissaoOp + " WHERE id='" + idcomissop + "' ;";
                    }
                }
                
                
                if(idcomissind == null){
                    if(id_indicador){
                        insertupdate += " INSERT INTO comiss ";
                        insertupdate += " (id, id_vendedor, id_venda, nm_status, id_empresa, numero_pedido, dt_emissao, vl_venda, vl_comissao)";
                        insertupdate += " VALUES(newID(), '" + id_indicador + "', '" + id + "', '" + nm_status + "', '" + id_empresa + "', '" + numero_pedido + "', '" + dt_emissao + "', " + vl_venda + ", " + vl_comissaoInd + ");";          
                    }
                }else{
                    if(id_indicador){
                        insertupdate += " UPDATE comiss SET id_vendedor='" + id_indicador + "',id_venda='" + id + "', nm_status='" + nm_status + "', id_empresa='" + id_empresa + "', numero_pedido='" + numero_pedido + "', dt_emissao='" + dt_emissao + "', vl_venda=" + vl_venda + ", vl_comissao=" + vl_comissaoInd + " WHERE id='" + idcomissind + "' ;";
                    }
                }

                console.log(insertupdate)
                sql.close(); 
                sql.connect(config, function (err) { 
                    if (err) console.log(err); 
                    
                    var request = new sql.Request();
                    request.query(insertupdate).then(function(recordset) {
                        var sucesso = true;
                        var message = "Comissão gerada com sucesso!";

                        var resposta = {
                            success: sucesso,
                            message: message
                        }
                        res.json(resposta); 
                    }).catch(function(err) { 
                        console.log(err)
                        var sucesso = false;
                        var message = "Falha ao gerar a comissão";

                        var resposta = {
                            success: sucesso,
                            message: message
                        }
                        res.json(resposta);
                    });
                }); 
            }
        });
    });     
});


router.route('/carregaControleComissaoPagarDesconto/:id').get(function(req, res) {
    var id = req.param('id'); 
    var where = ""; 
    var select = "SELECT id AS 'id', nm_descricao AS 'descricao' , vl_desconto AS 'desconto'"; 
    select += " FROM comissao_desconto "; 
    select += " WHERE id_contas_pagar='" + id + "'";

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



router.route('/editarControleComissaoPagarDesconto/:id').get(function(req, res) {
    var id = req.param('id'); 
    var where = ""; 
    var select = "SELECT id AS 'id', nm_descricao AS 'descricao' , vl_desconto AS 'desconto'"; 
    select += " FROM comissao_desconto "; 
    select += " WHERE id='" + id + "'";

    sql.close(); 
    sql.connect(config, function (err) { 
        if (err) console.log(err); 
        var request = new sql.Request(); 
        request.query(select, function (err, recordset){ 
                if (err) console.log(err);

                res.send(recordset.recordset); 
        }); 
    }); 
});



router.route('/carregaControleComissaoPagarEquipe/:id/:equipe').get(function(req, res) {
    var id = req.param('id'); 
    var equipe = req.param('equipe'); 
    var where = ""; 
    var select = "SELECT entidade.id AS 'id', entidade.nm_razaosocial AS 'descricao', ('0') AS 'valor'  ";
    select += " FROM entidade ";
    select += " INNER JOIN equipe ON equipe.id=entidade.id_equipe ";
    select += " WHERE equipe.id='" +  equipe + "'"; 

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