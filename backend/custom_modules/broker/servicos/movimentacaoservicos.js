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
        var select = "SELECT produtos.id AS 'id', produtos.nm_descricao AS 'desc', (SELECT TOP 1 cliente_servicos.id_dsg_moeda FROM cliente_servicos WHERE id_entidade='" + idEntidade + "' AND id_produtos=produtos.id) AS 'moeda', (SELECT TOP 1 cliente_servicos.vl_valor FROM cliente_servicos WHERE id_entidade='" + idEntidade + "' AND id_produtos=produtos.id) AS 'precovenda'   FROM produtos_subservicos INNER JOIN produtos ON produtos.id=produtos_subservicos.id_subservicos WHERE produtos_subservicos.id_produtos='" + idProdutos + "'";
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



router.route('/carregaListaComissao/:idEntidade/:dataDe/:dataAte').get(function(req, res) {
    var idEntidade = req.param('idEntidade');
    var dataDe = req.param('dataDe');
    var dataAte = req.param('dataAte');

    var where = ""; 
    var select = "";
    select += " SELECT  movimentacao_servicos.id as 'id', FORMAT (movimentacao_servicos.dt_emissao, 'd', 'pt-BR' ) as 'dt_emissao', entidade.nm_razaosocial as 'cliente',  ";
    select += " op.nm_razaosocial as 'operador', produtos.nm_descricao as 'produto', comiss.vl_venda as 'valorvenda', comiss.status as 'status', comiss.vl_comissao as 'valor' ";
    select += " FROM movimentacao_servicos ";
    select += " INNER JOIN entidade ON entidade.id=movimentacao_servicos.id_entidade ";
    select += " INNER JOIN entidade op ON op.id=movimentacao_servicos.id_operador ";
    select += " INNER JOIN produtos ON produtos.id=movimentacao_servicos.id_produtos ";
    select += " INNER JOIN comiss ON comiss.id_venda=movimentacao_servicos.id ";

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
                where = " WHERE FORMAT(movimentacao_servicos.dt_emissao, 'd', 'pt-BR' ) >= '" + dataDe + "' "; 
            }else{ 
                where = " AND FORMAT(movimentacao_servicos.dt_emissao, 'd', 'pt-BR' ) >= '" + dataDe + "' "; 
            } 
        } 
    } 
    if(dataAte){ 
        if(dataAte != "*"){ 
            dataAte = dataAte.replace("-","/"); 
            dataAte = dataAte.replace("-","/"); 
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




router.route('/carregaListaDetalhesServicos/:dataDe/:dataAte/:cliente/:cnpj/:dtfat/:nfse/:bol').get(function(req, res) {
    var cliente = req.param('cliente');
    var dataDe = req.param('dataDe');
    var dataAte = req.param('dataAte');
    var cnpj = req.param('cnpj');
    var dtfat = req.param('dtfat');
    var nfse = req.param('nfse');
    var bol = req.param('bol');
    
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