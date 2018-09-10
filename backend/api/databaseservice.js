const _ = require('lodash')
const database = require('./database')
const server = require('../config/server')
const express = require('express')
const dados = require('./connections')
var sql = require("mssql");
const general = require('./general')
const ObjectID = require('mongodb').ObjectID


var pdf = require('html-pdf');
const PDFDocument = require('pdfkit')

var fs = require('fs');

const router = express.Router()
server.use('/api', router)

// config for your database
var config = {};
//var config = {user: 'sa', password: 'IntSql2015@', server: '52.89.63.119',  database: 'eCloud-homologa'};
//var config = {user: 'sa', password: '1234567890', server: '127.0.0.1',  database: 'eCloud-homologa'};
//var config = {user: 'sa', password: 'IntSql2015@', server: '172.31.8.216',  database: 'eCloud-homologa'};

var serverWindows = "";
//var serverWindows = "http://localhost:2444";
//var serverWindows = "http://homologa.empresariocloud.com.br";

var configEnvironment = {};
//var configEnvironment = {user: 'sa', password: '1234567890', server: '127.0.0.1',  database: 'Environment'};
//var configEnvironment = {user: 'sa', password: 'IntSql2015@', server: '172.31.8.216',  database: 'Environment'};

var pastaParametrosRelatorios = "../frontend/reports/parametrosusuarios/";

var EnterpriseID = "";
var EnterpriseName = "";
var UserID = "";
var base = "erpcloud"; //erpcloudfoodtown
var url = "mongodb://localhost:27017/" + base;
var host = "";
var local;

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
        dados = "homologa";  //"homologa"; //"foodtown";
        configEnvironment = {user: 'sa', password: '12345678', server: '127.0.0.1',  database: 'Environment'};
        local = true;
    }else{
        serverWindows = "http://" + dados + ".empresariocloud.com.br"; //"http://localhost:2444";
        configEnvironment = {user: 'sa', password: 'IntSql2015@', server: '172.31.8.216',  database: 'Environment'};
        local = false;
    }

    var database = ""; //"eCloud-homologa";
    var server = ""; //"127.0.0.1";
    var password = ""; //"1234567890";
    var user = ""; //"sa";

    var select = "SELECT id AS idempresa,nm_CompanyName nome,nm_DatabaseName_Aplication AS 'database',  ";
    select += " nm_ServerIP_Aplication AS 'server', ";
    select += " password_Aplication AS 'password', ";
    select += " nm_User_Aplication AS 'user' ";
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
                
                config = {user: user, password: password, server: server,  database: database};

                next();
            }
        });
    });    
});


function conectionsLink(full, callback){
    if(String(full).indexOf("localhost") > -1){
        serverWindows = "http://localhost:2444";
        dados = "homologa"; //"foodtown";
        configEnvironment = {user: 'sa', password: '12345678', server: '127.0.0.1',  database: 'Environment'};
    }else{
        var parts = String(full).split('.');
        var dados = "";
        if (parts.length > 3) {
            dados = parts[0];
        }
        dados = dados.replace("http://","");
        serverWindows = "http://" + dados + ".empresariocloud.com.br"; //"http://localhost:2444";
        configEnvironment = {user: 'sa', password: 'IntSql2015@', server: '172.31.8.216',  database: 'Environment'};
    }

    var database = ""; //"eCloud-homologa";
    var server = ""; //"127.0.0.1";
    var password = ""; //"1234567890";
    var user = ""; //"sa";

    var select = "SELECT nm_DatabaseName_Aplication AS 'database',  ";
    select += " nm_ServerIP_Aplication AS 'server', ";
    select += " password_Aplication AS 'password', ";
    select += " nm_User_Aplication AS 'user' ";
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
                
                config = {user: user, password: password, server: server,  database: database};
                
                callback(true);
            }
        });
    }); 
    
}

router.route('/report').get(function(req, res) {
    var html = "";
    var full = req.host;
    full = full.replace("http://","");
    full = "http://" + full;

    var MongoClient = require('mongodb').MongoClient;

    var nome = req.param('nome');
    var select = ""; //'select Id, nm_razaosocial, nr_codigo, dt_cadastro, nm_nomefantasia, sn_pessoafisica, nm_cpf, nm_cnpj FROM entidade'
    var html = "";
    var engine = "";
    var recipe = "";
    var selectheader = "";
    var titulo = "";
    var headerhtml = "";
    var headersize = "";

    //nome = nome.toUpperCase();
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
      
        db.collection("reports").find().toArray(function(err, result) {
            if (err) throw err;
            if (result) {
                result = result.sort(compareObj);
                res.send(result) 
            }
        })
    })

})

function compareObj(a,b) {
    if (a.nome < b.nome)
      return -1;
    if (a.nome > b.nome)

      return 1;
    return 0;
}

  router.route('/r/:id/:parametros').get(function(req, res) {
    var fs = require('fs');
    var id = req.param('id');
    var nomeArquivo = "";
    var nome = id;
    var html = "";
    var handlef = null;
    var full = req.host;
    var paramRelatorio = null;
    var paraRelatorioProps = null;
    var saidaRelatorio = "";
    var orientacaoRelatorio = "portrait";
    var MongoClient = require('mongodb').MongoClient;

    var select = ""; //'select Id, nm_razaosocial, nr_codigo, dt_cadastro, nm_nomefantasia, sn_pessoafisica, nm_cpf, nm_cnpj FROM entidade'
    var html = "";
    var engine = "";
    var recipe = "";
    var selectheader = "";
    var titulo = "";
    var headerhtml = "";
    var headersize = "";

    full = full.replace("http://","");
    full = "http://" + full;

    paramRelatorio = JSON.parse(req.param('parametros'));
    nomeArquivo = id + "_" + paramRelatorio.userId.value;
    saidaRelatorio = paramRelatorio._saida_.value;
    orientacaoRelatorio = paramRelatorio._orientacao_.value;
    delete paramRelatorio.userId;

    try{
        if(!fs.existsSync(pastaParametrosRelatorios)){
            fs.mkdirSync(pastaParametrosRelatorios);
        }
        handlef = fs.openSync(pastaParametrosRelatorios + nomeArquivo,"w");
        if(handlef > -1){
            fs.writeFileSync(handlef,JSON.stringify(paramRelatorio));
            fs.closeSync(handlef);
        }
        else{
            console.log("Relatório: " + id + " *** Não foi possível abrir o arquivo de parâmetros de usuário ***");
        }
    }
    catch(err){
        console.log("Relatório: " + id + " *** " + err + " ***");
    }
    
    delete paramRelatorio._orientacao_;
    delete paramRelatorio._saida_;

    //nome = nome.toUpperCase();
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
      
        db.collection("reports").find({"idReport": id}, { _id: false }).toArray(function(err, result) {
            if (err) throw err;

            if (result) {
                if (result.length > 0) {
                    select = result[0].select;
                    
                    if(result[0].headerhtml){
                        headerhtml = result[0].headerhtml
                    }
                    
                    if(result[0].headersize){
                        headersize = result[0].headersize
                    }
                                        
                    html = result[0].html;  
                    recipe = result[0].recipe;
                    titulo = result[0].titulo;
                }
            }
            
            db.close();
            sql.close();

            // connect to your database
            sql.connect(config, function (err) {    
                if (err) console.log(err);
    
                // create Request object
                var request = new sql.Request();

                //Parametro com o id da empresa
                request.input("idempresa",EnterpriseID);
                /*
                Parâmetros do relatórios */                
                paramRelatorioProps = Object.getOwnPropertyNames(paramRelatorio);
                for(var i = 0; i < paramRelatorioProps.length; i++){
                    if(paramRelatorio[paramRelatorioProps[i]].type == "numeric")
                        request.input(paramRelatorioProps[i],(paramRelatorio[paramRelatorioProps[i]].value == "" ? null : Number(paramRelatorio[paramRelatorioProps[i]].value)));
                    else
                        request.input(paramRelatorioProps[i],(paramRelatorio[paramRelatorioProps[i]].value == "" ? null : paramRelatorio[paramRelatorioProps[i]].value));
                }
    
                // query to the database and get the records
                request.query(select, function (err, recordset) {
                    if (err){
                        console.log(err);
                        res.writeHeader(200, {"Content-Type": "text/html"});  
                        res.write(err);  
                        res.end();
                    }
                    else{
                        var element = recordset.recordsets[0];   
                        result[0].recipe = saidaRelatorio;     
                        result[0].orientation = orientacaoRelatorio;                                        
                        html = createHTML(result[0],element,paramRelatorio);
                        /*                    
                        var header = createHeader(element, headerhtml, titulo);
                        html = createMaster(element, html);
                        html = createDetails(element, html);
                        html = createFooter(element, html);
                        html = createGraphic(element, html, "pie");
                        */
                        switch (saidaRelatorio){
                            case "pdf":
                                if(!headersize){
                                    headersize = "20";
                                }
                                
                                var orientation = "portrait";
                                if(orientacaoRelatorio != "")
                                    orientation = orientacaoRelatorio;
                                else{
                                    if(result[0].orientation != "")
                                        orientation = result[0].orientation;
                                }

                                //var options = { paginationOffset: 1,orientation: orientation, header: {"height": "" + headersize + "mm", "contents": html.header} ,footer: {"height":"10mm", "contents": '<span style="float:right;font-weight:bold;font-family:Arial;font-size:x-small;">{{page}}</span>' } };
                                var options = {paginationOffset: 1,orientation: orientation, header: {"height": "" + headersize + "mm", "contents": html.header} ,footer: {"height":"10mm", "contents":html.footer} };
                                //var options = {};
                                pdf.create(html.topo +  html.detail + html.footer + html.base, options).toStream(function(err, stream){
                                    //console.log(fs.createWriteStream('../frontend/reports/' + nome + '.pdf'))
                                    if(local == true){
                                        stream.pipe(fs.createWriteStream('../frontend/reports/' + nome + '.pdf'));
                                        res.setHeader('Content-type', 'application/pdf')
                                        stream.pipe(res)
                                    }else{
                                        res.writeHeader(200, {"Content-Type": "text/html"});  
                                        res.write(fs.createWriteStream('/home/ubuntu/ERPCloud/frontend/frontend/reports/' + nome + '.pdf'));  
                                        res.end();  
                                    }
                                    
                                });
                            
                                break;
                            case "html":
                                //var stream = fs.createWriteStream('../frontend/reports/' + nome + '.html');
                                //stream.on('open', function(fd) {
                                //    stream.write(html.topo + html.header + html.detail + html.footer + html.base);
                                //    stream.end();
                                    res.writeHeader(200, {"Content-Type": "text/html"});  
                                    res.write(html.topo + html.header + html.detail + html.footer + html.base);  
                                    res.end();  
                                //});                                
                            
                                break; 
                        }
                    }
                });
            });            
        })
    });
})


router.route('/ntlctreports/:id/:userid').get(function(req, res) {
    var id = req.param('id');
    var full = "http://" + req.headers.host;
    var MongoClient = require('mongodb').MongoClient;

    MongoClient.connect(url, function(err, db) {
        if (err)
            throw err;
        else{      
            db.collection("reports").find({"idReport": id}, { _id: false }).toArray(function(err, result) {
                if (err) 
                    throw err;
                else{            
                    db.close();
                    if (result) {
                        createModalParam(result[0],req.param("userid"),full,function(html){
                            res.writeHeader(200, {"Content-Type": "text/html"});  
                            res.write(html);  
                            res.end();
                        });
                    }
                }
            })
        }
    });
})


function createModalParam(element,userid,rota,callback){
    var fs = require("fs");
    var id = "";
    var html = "";
    var nomeArquivo = "";
    var query = "";
    var vlrAnterior = "";
    var htmlAux = "";
    var jsonParametros = "";
    var tiporetorno = "";
    var ind = 0;
    var handlef = 0;
    var colunas = 0;
    var parametro = 0;
    var nrelementos = 0;
    var parametros = [];
    var valoresAnteriores = {};
    var guid = general.guid();     
    
    try{
        nomeArquivo = element.idReport + "_" + userid
        handlef = fs.openSync(pastaParametrosRelatorios + nomeArquivo,"r");
        if(handlef > -1){
            jsonParametros = fs.readFileSync(handlef);
            fs.closeSync(handlef);
            valoresAnteriores = JSON.parse(jsonParametros);
        }       
        else{
            console.log("Relatório (parâmetros): " + nomeArquivo + " *** Não foi possível abrir o arquivo de parâmetros de usuário ***");
        }
    }
    catch(err){
        console.log("Relatório (parâmetros): " + nomeArquivo + " *** " + err + " ***");
    }
    
    jsonParametros = "parametros = {";
    jsonParametros += "\"userId\":{\"value\":\"" + userid + "\",\"text\":\"" + userid + "\"},";  
    
/*
    html = "<html>";
    html += "<head>";
    html += "<meta charset='UTF-8'>"
    html += "<head>";
    html += "<body>";
*/
    html += "<div id=\"" + guid + "\">";
    html += "<h3>" + element.titulo + " (parâmetros)</h3>";
    html += "<form id=\"" + guid + "_form\">";
    html += "<table class=\"table table-borderless\" id=\"" + guid + "_table\" cellspacing=\"10\" style=\"width:100%;\">";
    html += "<tbody>";
    html += "<tr>";
    /*
    Parâmetro para orientação */
    if(valoresAnteriores.hasOwnProperty("_orientacao_")){
        vlrAnterior = valoresAnteriores._orientacao_.value;
    }
    else
        vlrAnterior = "";
    html += "<td style=\"width:50%\">";
    html += "<div class=\"form-group\" id=\"" + guid + "orientacao_formgroup\">";
    html += "<div class=\"control-group\" id=\"" + guid + "orientacao_controlgroup\">";
    id = guid + "_orientacao";
    html += "<label class for=\"" + id + "\">Orientação</label>";
    jsonParametros += "\"_orientacao_\":{\"value\":document.getElementById(\"" + id + "\").value,\"text\":document.getElementById(\"" + id + "\").selectedOptions[0].text},";
    html += "<select id=\"" + id + "\" class=\"form-control\">";
    html += "<option value=\"portrait\"" + (vlrAnterior == "portrait"?"selected":"") + ">Retrato</option>";
    html += "<option value=\"landscape\"" + (vlrAnterior == "landscape"?"selected":"") + ">Paisagem</option>";
    html += "</select>";
    html += "</div>";
    html += "</div>";
    html += "</td>";
    /*
    Parâmetro para tipo de saída */
    if(valoresAnteriores.hasOwnProperty("_saida_"))
        vlrAnterior = valoresAnteriores._saida_.value;
    else
        vlrAnterior = "";
    html += "<td style=\"width:50%\">";
    html += "<div class=\"form-group\" id=\"" + guid + "tiposaida_formgroup\">";
    html += "<div class=\"control-group\" id=\"" + guid + "tiposaida_controlgroup\">";
    id = guid + "_tiposaida";
    html += "<label class for=\"" + id + "\">Saída</label>";
    jsonParametros += "\"_saida_\":{\"value\":document.getElementById(\"" + id + "\").value,\"text\":document.getElementById(\"" + id + "\").selectedOptions[0].text},";  
    html += "<select id=\"" + id + "\" class=\"form-control\" value=\"" + vlrAnterior + "\">";
    html += "<option value=\"html\"" + (vlrAnterior == "html"?"selected":"") + ">html</option>";
    html += "<option value=\"pdf\"" + (vlrAnterior == "pdf"?"selected":"") + ">Pdf</option>";
    html += "</select>";
    html += "</div>";
    html += "</div>";
    html += "</td>";
    html += "</tr>";
    /*-*/
    nrelementos = element.parameters.length;
    colunas = 0;
    for(parametro = 0; parametro < nrelementos; parametro++){
        if(colunas == 0)
            html += "<tr>";
        if(parametro > 0)
            jsonParametros += ",";
        id = guid + "_" + element.parameters[parametro].name
        if(valoresAnteriores.hasOwnProperty(element.parameters[parametro].name))
            vlrAnterior = valoresAnteriores[element.parameters[parametro].name].value;
        else
            vlrAnterior = "";

        if(element.parameters[parametro].hasOwnProperty("returntype"))
            tiporetorno = element.parameters[parametro].returntype;
        else
            tiporetorno = "caracter";
            
        switch(element.parameters[parametro].type){
            case "check":
                jsonParametros += "\"" + element.parameters[parametro].name + "\":{\"value\":document.getElementById(\"" + id + "\").value,\"type\":\"" + tiporetorno + "\",\"text\":document.getElementById(\"" + id + "\").value}";
                colunas = 2;
                html += "<td colspan=\"2\">";
                //html += "<div class=\"form-group\" id=\"" + id + "_formgroup\">";
                //html += "<div class=\"control-group\" id=\"" + id + "_controlgroup\">";
                html += "<br>";
                html += "<label>";
                html += "<div class=\"icheckbox_flat-blue hover\" id=\"" + id + "_icheckbox\">";
                html += "<input class=\"icheck-grey\" type=\"checkbox\" id=\"" + id + "\">"
                html += "</div>";
                html += " " + element.parameters[parametro].title;
                html += "</label>";
                //html += "</div>";
                //html += "</div>";
                html += "</td>";
                break;
            case "drop":
                jsonParametros += "\"" + element.parameters[parametro].name + "\":{\"value\":document.getElementById(\"" + id + "\").value,\"type\":\"" + tiporetorno + "\",\"text\":document.getElementById(\"" + id + "\").selectedOptions[0].text}";  
                colunas = 2;
                html += "<td colspan=\"2\">";
                html += "<div class=\"form-group\" id=\"" + id + "_formgroup\">";
                html += "<div class=\"control-group\" id=\"" + id + "_controlgroup\">";
                html += "<label class for=\"" + id + "\">" + element.parameters[parametro].title + "</label>";
                if(element.parameters[parametro].hasOwnProperty("options")){
                   if(element.parameters[parametro].options.length > 0){
                        html += "<select id=\"" + id + "\" class=\"form-control\" autocomplete=\"on\">";
                        for(ind = 0; ind < element.parameters[parametro].options.length; ind++){
                            html += "<option value = \"" + element.parameters[parametro].options[ind].value + "\"" + (element.parameters[parametro].options[ind].value == vlrAnterior ?"selected":"") + ">" + element.parameters[parametro].options[ind].text;
                            html += "</option>" ;
                        }
                        html += "</select>";
                    }
                }
                else{
                    if(element.parameters[parametro].hasOwnProperty("select")){
                        parametros.push({"parametro":element.parameters[parametro].name,"tipo":"drop","valoranterior":vlrAnterior,"query":element.parameters[parametro].select});
                        html += "<select id=\"" + id + "\" class=\"form-control\" autocomplete=\"on\">";
                        html += "<option value = \"\"> </option>";
                        html += "{{" + element.parameters[parametro].name + "}}";
                        html += "</select>";
                    }
                }
                html += "</div>";
                html += "</div>";
                html += "</td>";
                break;
            case "date":
                jsonParametros += "\"" + element.parameters[parametro].name + "\":{\"value\":document.getElementById(\"" + id + "\").value,\"type\":\"" + tiporetorno + "\",\"text\":document.getElementById(\"" + id + "\").value.split(\"-\").reverse().join(\"-\").toString()}";
                colunas++;
                html += "<td style=\"width:50%\">";
                html += "<div class=\"form-group\" id=\"" + id + "_formgroup\">";
                html += "<div class=\"control-group\" id=\"" + id + "_controlgroup\">";
                html += "<label class for=\"" + id + "\">" + element.parameters[parametro].title + "</label>";
                html += "<input type=\"date\" data-mask=\"00/00/0000\" name=\"" + element.parameters[parametro].name + "\" id=\"" + id + "\" class=\"form-control\" value=\"" + vlrAnterior + "\">";
                html += "</div>";
                html += "</div>";
                html += "</td>";
                break;                
            default:
                jsonParametros += "\"" + element.parameters[parametro].name + "\":{\"value\":document.getElementById(\"" + id + "\").value,\"type\":\"" + tiporetorno + "\",\"text\":document.getElementById(\"" + id + "\").value}";  
                colunas++;
                html += "<td style=\"width:50%\">";
                html += "<div class=\"form-group\" id=\"" + id + "_formgroup\">";
                html += "<div class=\"control-group\" id=\"" + id + "_controlgroup\">";
                html += "<label class for=\"" + id + "\">" + element.parameters[parametro].title + "</label>";
                html += "<input type=\"text\" name=\"" + element.parameters[parametro].name + "\" id=\"" + id + "\" class=\"form-control\" value=\"" + vlrAnterior + "\">";
                html += "</div>";
                html += "</div>";
                html += "</td>";
                break;
        }
        if(colunas == 2){
            colunas = 0;
            html += "</tr>";
        }
    }
    jsonParametros += "}; ";
    html += "</tbody>";
    html += "</table>";
    html += "<br><br>";
    html += "<div id=\"" + guid + "_botoes\">"
    html += "<button id=\"" + guid + "_btnConfRel\" type=\"button\" class=\"btn btn-icon btn-success btn-round btn-xs\" style=\"height: 20px;\" title=\Confirmar\" onclick=\"geraRelatorio()\"><span class=\"fa fa-check\"></span></button>"
    html += "<button id=\"" + guid + "_btnCancRel\" type=\"button\" class=\"btn btn-icon btn-danger btn-round btn-xs\" style=\"height: 20px;\" title=\"Cancelar\" onclick=\"(function(){$('.close').click();})()\"><span class=\"fa fa-remove\"></span></button>"
    html += "</div>"
    html += "</form>";
    html += "</div>";
    html += "<script>";
    html += "function geraRelatorio(){ ";
    html += "var parametros = \"\"; ";
    html += jsonParametros;    
    html += "window.open('" + rota+ "/api/r/" + element.idReport + "/' + JSON.stringify(parametros)); "
    html += "$('.close').click(); ";
    html += "}";
    html += "</script>";
    html += "</body>";
    html += "</html>";
    html += "</div>";
    html += "</body>";
    if(parametros.length == 0){
        callback(html);
    }
    else{
        query = "select parametro,tipo,valoranterior,valor,descricao from (";
        for(parametro = 0; parametro < parametros.length; parametro++){
            if(parametro > 0)
                query += " union all ";

            query += "select '" + parametros[parametro].parametro + "' parametro,"
            query += "'" + parametros[parametro].tipo + "' tipo,"
            query += "'" + parametros[parametro].valoranterior + "' valoranterior,"
            query += parametros[parametro].query.substring(parametros[parametro].query.indexOf("select ") + 7);
        }
        query += ") opcoes order by parametro,descricao"
        sql.close();
        sql.connect(config, function (err) {
            if (err) console.log(err);
            var request = new sql.Request();
            request.query(query, function (err, recordset) {
                if (err) console.log(err)
                var i = 0;
                var nomeParametro = "";
                while(i < recordset.recordsets[0].length){
                    nomeParametro = recordset.recordsets[0][i].parametro;
                    htmlAux = "";
                    while(i < recordset.recordsets[0].length && nomeParametro == recordset.recordsets[0][i].parametro){
                        if(recordset.recordsets[0][i].tipo == "drop"){
                            htmlAux += "<option value=\"" + recordset.recordsets[0][i].valor + "\"" + (recordset.recordsets[0][i].valor == recordset.recordsets[0][i].valoranterior?"selected":"") + ">" + recordset.recordsets[0][i].descricao + "</option>";
                        }
                        i++;
                    }
                    html = html.replace("{{" + nomeParametro + "}}",htmlAux);
                }
                callback(html);
            })
        })
    }   
}

function createHTML(element,select,paramRelatorio){
    var _eval = require("eval");
    var fs = require('fs');
    var aux = "";
    var valor = "";
    var funcao = "";
    var htmlAux = "";
    var comando = "";
    var varLoop = "";
    var condicao = "";
    var linhaComando = "";
    var itemRelatorio = "";
    var funcoesnumeros = "";
    var corpoRelatorio = "";
    var cmdFinaisFuncao = "";
    var cabecalhoFuncao = "";
    var variaveisFuncao = "";
    var blocoFuncaoDetail = "";
    var blocoFuncaoHeader = "";
    var blocoFuncaoFooter = "";
    var cmdIniciaisFuncao = "";
    var pos = 0;
    var posFim = 0;
    var posInicio = 0;
    var posDetalhe = 0;
    var varCtrlLoop = 0;
    var listaVariaveis = [];
    var retorno = null;
    var resultadoFuncao = null;
    var geraHtmlRelatorio = null;
    var paramRelatorioProps = null

    try{
        retorno = {
            topo: "",
            header: "",
            detail: "",
            footer: "",
            base: ""
        }

        resultadoFuncao = {
            "funcao":"",
            "erro":false
        }

        cabecalhoFuncao = "module.exports = function(_select_,_resultado_) { ";

        variaveisFuncao += "var _html_ = \"\"; ";
        variaveisFuncao += "var _ok_ = true; "
        variaveisFuncao += "var _linhaQuery_ = 0; "; 
        variaveisFuncao += "var _subtitulo_ = \"\"; ";
        variaveisFuncao += "var _titulo_ = \"\"; ";

        listaVariaveis.push("_subtitulo_");
                    
        paramRelatorioProps = Object.getOwnPropertyNames(paramRelatorio);
        for(pos = 0; pos < paramRelatorioProps.length; pos++){
            if(paramRelatorio[paramRelatorioProps[pos]].type == "numeric")
                variaveisFuncao += "var " + "p_" + element.parameters[pos].name.trim() + "_ = " + Number(paramRelatorio[paramRelatorioProps[pos]].value).toString() + "; ";            
            else
                variaveisFuncao += "var " + "p_" + element.parameters[pos].name.trim() + "_ = \"" + paramRelatorio[paramRelatorioProps[pos]].value + "\"; ";            
        }

        cmdIniciaisFuncao += "try{ "
        cmdIniciaisFuncao += "if(_ok_) { ";
        cmdIniciaisFuncao += "_titulo_ += \"" +  element.titulo + "\"; ";

        posInicio = element.html.indexOf("{{ntlct_report}}");    
        posFim = element.html.indexOf("{{/ntlct_report}}");
        if(posInicio > -1 && posFim > -1){
            retorno.topo = element.html.substring(0,posInicio);
            retorno.base = element.html.substring(posFim + 17);
            corpoRelatorio = element.html.substring(posInicio + 16,posFim);
        };

        if(corpoRelatorio != ""){
            posInicio = corpoRelatorio.indexOf("{{header}}");
            posFim = corpoRelatorio.indexOf("{{/header}}");
            if(posInicio > -1 && posFim > -1){
                itemRelatorio = corpoRelatorio.substring(posInicio + 10,posFim);
                posInicio = itemRelatorio.indexOf("{{headerdefault}}")
                if(posInicio > -1){
                    htmlAux = createHeader(element,itemRelatorio,element.titulo);
                    itemRelatorio = itemRelatorio.replace("{{headerdefault}}", htmlAux);
                }
                retorno.header = itemRelatorio;
                resultadoFuncao.funcao = "htmlheader";
                blocoFuncaoHeader = avaliaComando();
            }
            /*-*/
            posInicio = corpoRelatorio.indexOf("{{detail}}");
            posFim = corpoRelatorio.indexOf("{{/detail}}");
            if(posInicio > -1 && posFim > -1){
                itemRelatorio = corpoRelatorio.substring(posInicio + 10,posFim);
                retorno.detail = itemRelatorio;
                resultadoFuncao.funcao = "htmldetail";
                blocoFuncaoDetail = avaliaComando();
            }

            /*-*/
            posInicio = corpoRelatorio.indexOf("{{footer}}");
            posFim = corpoRelatorio.indexOf("{{/footer}}");
            if(posInicio > -1 && posFim > -1){
                itemRelatorio = corpoRelatorio.substring(posInicio + 10,posFim);
                posInicio = itemRelatorio.indexOf("{{footerdefault}}")
                if(posInicio > -1){
                    htmlAux = createFooter(element,itemRelatorio,element.titulo);
                    itemRelatorio = itemRelatorio.replace("{{footerdefault}}", htmlAux);
                }
                retorno.footer = itemRelatorio;
                resultadoFuncao.funcao = "htmlfooter";
                blocoFuncaoFooter = avaliaComando();
            }
        }

        cmdFinaisFuncao += "} ";
        cmdFinaisFuncao += "} ";
        cmdFinaisFuncao += "catch(err) { ";
        cmdFinaisFuncao += "_resultado_.erro = true; ";
        cmdFinaisFuncao += "_html_ = _resultado_.funcao + \" \" + err; "
        cmdFinaisFuncao += "}";
        cmdFinaisFuncao += "return(_html_); ";
        if(local == true){
            funcoesnumeros = fs.readFileSync("../frontend/framework/funcoesnumeros.js");
        }else{
            funcoesnumeros = fs.readFileSync("/home/ubuntu/ERPCloud/frontend/framework/funcoesnumeros.js");
        }
        
        cmdFinaisFuncao += funcoesnumeros;

        cmdFinaisFuncao += "}";

        /*
        Montando o cabecalho */
        if(blocoFuncaoHeader != ""){
            resultadoFuncao.funcao = "cabecalho";
            resultadoFuncao.erro = false;
            funcao = cabecalhoFuncao;
            funcao += variaveisFuncao;
            funcao += cmdIniciaisFuncao;
            funcao += blocoFuncaoHeader;
            funcao += cmdFinaisFuncao;
            geraHtmlRelatorio = _eval(funcao);
            retorno.header = geraHtmlRelatorio(select,resultadoFuncao);
        }
        /*
        Montando o detalhe */
        if(!resultadoFuncao.erro){
            if(blocoFuncaoDetail != ""){
                resultadoFuncao.funcao = "detalhe";
                resultadoFuncao.erro = false;
                funcao = cabecalhoFuncao;
                funcao += variaveisFuncao;
                funcao += cmdIniciaisFuncao;
                funcao += blocoFuncaoDetail;
                funcao += cmdFinaisFuncao;
                geraHtmlRelatorio = _eval(funcao);
                retorno.detail = geraHtmlRelatorio(select,resultadoFuncao);
            }
            /*
            Montando o footer */
            if(!resultadoFuncao.erro){
                if(blocoFuncaoFooter != ""){
                    resultadoFuncao.funcao = "rodape";
                    resultadoFuncao.erro = false;
                    funcao = cabecalhoFuncao;
                    funcao += variaveisFuncao;
                    funcao += cmdIniciaisFuncao;
                    funcao += blocoFuncaoFooter;
                    funcao += cmdFinaisFuncao;
                    geraHtmlRelatorio = _eval(funcao);
                    retorno.footer = geraHtmlRelatorio(select,resultadoFuncao);
                }
            }
        }
    }
    catch(err){
        retorno = {
            topo: err,
            header: "",
            detail: "",
            footer: "",
            base: ""
        }
    }

    return(retorno);


    function avaliaComando(){
        var blocoFuncao = "";
        var textoMsgErro = "";
        var pilhaControleFluxo = [];

        condicao = "true";
        posDetalhe = 0;
        posInicio = itemRelatorio.indexOf("{{",posDetalhe);
        while(posDetalhe < itemRelatorio.length && posInicio > -1){                
            blocoFuncao += "_html_ += \"" + itemRelatorio.substring(posDetalhe,posInicio) +  "\"; ";
            posFim = itemRelatorio.indexOf("}}",posInicio);
            posDetalhe = posFim + 2;
            linhaComando = itemRelatorio.substring(posInicio + 2,posFim);
            posFim = linhaComando.indexOf(":");
            if(posFim < 0)
                posFim = linhaComando.indexOf(".");
            comando = linhaComando.substring(0,posFim + 1).toLowerCase();
            switch(comando){
                /*
                Comandos especiais */
                case "titulo:":
                    blocoFuncao += "_html_ += _titulo_; "
                    break;
                case "subt:":
                    subTitulo = true;
                    blocoFuncao += "_html_ += _subtitulo_; ";
                    break;
                /*
                Controle de fluxo */
                case "if:":
                    pilhaControleFluxo.push("if")
                    condicao = "";
                    linhaComando = linhaComando.substring(posFim + 1);
                    posInicio = 0;
                    posFim = linhaComando.indexOf("select.",posInicio);
                    while(posFim > -1){
                        posInicio = posFim;
                        posFim = linhaComando.indexOf(" ",posInicio);
                        if(posFim < 0)
                            posFim = linhaComando.length;
                        condicao = linhaComando.substring(posInicio,posFim)
                        aux = linhaComando.substring(posInicio + 7,posFim);
                        if(aux == "end"){
                            linhaComando = linhaComando.replace(condicao,"_linhaQuery_ >= _select_.length");
                        }
                        else{
                            linhaComando = linhaComando.replace(condicao,"_select_[_linhaQuery_]." + aux.trim())
                        }
                        posFim = linhaComando.indexOf("select.",posFim);
                    }
                    /*-*/
                    condicao = "";
                    posInicio = 0;
                    posFim = linhaComando.indexOf("paramrel.",posInicio);
                    while(posFim > -1){
                        posInicio = posFim;
                        posFim = linhaComando.indexOf(" ",posInicio);
                        if(posFim < 0)
                            posFim = linhaComando.length;
                        condicao = linhaComando.substring(posInicio,posFim)
                        aux = avaliaParamRel(condicao);
                        aux = linhaComando.substring(posInicio + 9,posFim);
                        linhaComando = linhaComando.replace(condicao,"p_" + aux + "_");
                        posFim = linhaComando.indexOf("paramrel.",posFim);
                    }
                    blocoFuncao += "if(" + linhaComando + ") {";
                    break;
                case "else:":
                    condicao = pilhaControleFluxo.pop();
                    if(condicao != "if"){
                        textoMsgErro = resultadoFuncao.funcao + ": estrutura de controle de fluxo incorreta - \"else\" sem \"if\" correspondente.";
                        throw textoMsgErro;
                    }
                    else{
                        pilhaControleFluxo.push(condicao);
                        blocoFuncao += "} ";
                        blocoFuncao += "else{";
                    }
                    break;
                case "/if:":
                    blocoFuncao += "}; "
                    condicao = pilhaControleFluxo.pop();
                    if(condicao != "if"){
                        textoMsgErro = resultadoFuncao.funcao + ": estrutura de controle de fluxo incorreta - finalização de um \"if\" não inicializado.";
                        throw textoMsgErro;
                    }
                    break;
                case "loop:":
                    pilhaControleFluxo.push("loop");
                    condicao = "true";
                    posInicio = posFim + 1;
                    posFim = linhaComando.indexOf(";",posInicio);
                    if(posFim < 0)
                        posFim = linhaComando.length;
                    while(posFim > -1){
                        aux = linhaComando.substring(0,posFim);
                        linhaComando = linhaComando.substring(posFim + 1);
                        posFim = aux.indexOf("select.");
                        if( posFim > -1){
                            aux = aux.substring(posFim + 7);
                            if(aux == "end"){
                                condicao += " && _linhaQuery_ < _select_.length"
                            }
                            else{
                                varCtrlLoop++;
                                varLoop = "_varloop" + varCtrlLoop.toString().trim() + "_";
                                variaveisFuncao += " var " + varLoop + " = \"\"; ";
                                blocoFuncao += varLoop + " = _select_[_linhaQuery_]." + aux.trim() + "; ";
                                condicao += " && _select_[_linhaQuery_]." + aux.trim() + " == " + varLoop;
                            }
                        }
                        posFim = linhaComando.indexOf(";");
                        if(posFim == -1 && linhaComando.length > 0)
                            posFim = linhaComando.length;
                    }
                    blocoFuncao += "while(" + condicao + ") { ";
                    break;
                case "/loop:":
                    blocoFuncao += "}; ";
                    condicao = pilhaControleFluxo.pop();
                    if(condicao != "loop"){
                        textoMsgErro = resultadoFuncao.funcao + ": estrutura de controle de fluxo incorreta - finalização de um \"loop\" não inicializado.";
                        throw textoMsgErro;
                    }
                    break;
                /*
                Manipulação do resultado de queries */
                case "select.":
                    aux = linhaComando.substring(posFim + 1).trim();
                    if(aux == "next")
                        blocoFuncao += "_linhaQuery_++; ";
                    else
                        blocoFuncao += "_html_ += (_select_[_linhaQuery_]." + aux + " == null ? \" \" : _select_[_linhaQuery_]." + aux + "); ";
                    break;
                /*
                Manipulação de variáveis de memória */
                case "paramrel.": 
                    htmlAux = linhaComando.substring(posFim + 1);
                    comando = avaliaParamRel(htmlAux);
                    blocoFuncao += "_html_ += " + comando + "; ";
                    break;
                case "set:":
                    posInicio = posFim + 1
                    posFim = linhaComando.indexOf(",");
                    if(posFim < 0){
                        posFim = linhaComando.length;
                        aux = linhaComando.substring(posInicio,posFim).trim();
                        valor = "null";
                    }
                    else{
                        aux = linhaComando.substring(posInicio,posFim).trim();
                        valor = linhaComando.substring(posFim + 1);
                        posFim = valor.indexOf("select.");
                        if(posFim > -1){
                            valor = valor.substring(posFim + 7);
                            valor = "_select_[_linhaQuery_]." + valor.trim();
                        }
                        posFim = valor.indexOf("paramrel.");
                        if(posFim > -1){
                            valor = avaliaParamRel(valor);
                        }
                    }
                    if(listaVariaveis.indexOf(aux) < 0){
                        listaVariaveis.push(aux);
                        variaveisFuncao += "var " + aux + " = null; ";
                    }                        
                    blocoFuncao += aux + " = " + valor + "; ";
                    break;
                case "mul:":
                    posInicio = posFim + 1
                    posFim = linhaComando.indexOf(",");
                    if(posFim > -1){
                        aux = linhaComando.substring(posInicio,posFim).trim();
                        valor = linhaComando.substring(posFim + 1);
                        posFim = valor.indexOf("select.");
                        if(posFim > -1){
                            valor = valor.substring(posFim + 7);
                            valor = "_select_[_linhaQuery_]." + valor.trim();
                        }
                        posFim = valor.indexOf("paramrel:");
                        if(posFim > -1){
                            valor = valor.substring(posFim + 9);
                            valor = "p_" + valor.trim() + "_";
                        }
                        if(listaVariaveis.indexOf(aux) < 0){
                            listaVariaveis.push(aux);
                            variaveisFuncao += "var " + aux + " = null; ";
                        }                        
                        blocoFuncao += aux + " *= " + valor + "; ";
                    }
                    break;
                case "sum:":
                    posInicio = posFim + 1
                    posFim = linhaComando.indexOf(",");
                    if(posFim > -1){
                        aux = linhaComando.substring(posInicio,posFim).trim();
                        valor = linhaComando.substring(posFim + 1);
                        posFim = valor.indexOf("select.");
                        if(posFim > -1){
                            valor = valor.substring(posFim + 7);
                            valor = "_select_[_linhaQuery_]." + valor.trim();
                        }
                        posFim = valor.indexOf("paramrel.");
                        if(posFim > -1){
                            valor = avaliaParamRel(valor);
                        }
                        if(listaVariaveis.indexOf(aux) < 0){
                            listaVariaveis.push(aux);
                            variaveisFuncao += "var " + aux + " = null; ";
                        }                        
                        blocoFuncao += aux + " += " + valor + "; ";
                    }
                    break;
                case "sub:":
                    posInicio = posFim + 1
                    posFim = linhaComando.indexOf(",");
                    if(posFim > -1){
                        aux = linhaComando.substring(posInicio,posFim).trim();
                        valor = linhaComando.substring(posFim + 1);
                        posFim = valor.indexOf("select.");
                        if(posFim > -1){
                            valor = valor.substring(posFim + 7);
                            valor = "_select_[_linhaQuery_]." + valor.trim();
                        }
                        posFim = valor.indexOf("paramrel.");
                        if(posFim > -1){
                            valor = avaliaParamRel(valor);
                        }
                        if(listaVariaveis.indexOf(aux) < 0){
                            listaVariaveis.push(aux);
                            variaveisFuncao += "var " + aux + " = null; ";
                        }                        
                        blocoFuncao += aux + " -= " + valor + "; ";
                    }
                    break;
                case "fmtn:":
                    posInicio = posFim + 1
                    posFim = linhaComando.indexOf(",");
                    if(posFim > -1){
                        aux = linhaComando.substring(posInicio,posFim).trim();
                        valor = linhaComando.substring(posFim + 1);
                        if(isNaN(valor)){
                            valor = "0.00";
                        }
                        posFim = aux.indexOf("select.");
                        if(posFim > -1){
                            aux = aux.substring(posFim + 7);
                            aux = "_select_[_linhaQuery_]." + aux.trim()
                        }
                        else{
                           if(listaVariaveis.indexOf(aux) < 0){
                                listaVariaveis.push(aux);
                                variaveisFuncao += "var " + aux + " = null; ";
                            }
                        }                            
                        blocoFuncao += "_html_ += formataNumero((" + aux + " == null ? \"0.00\" : " + aux + ")," + valor + ",\".\",\",\"); ";
                    }
                    break;
                default:
                    if(listaVariaveis.indexOf(linhaComando) > -1){
                        blocoFuncao += "_html_ += " + linhaComando + " == null ? \" \" : " + linhaComando + ".toString(); ";
                    }
                    else{
                        blocoFuncao += "_html_ += \"{{" + linhaComando + "}}\"; ";
                    }
                    break;  
            }

            posInicio = itemRelatorio.indexOf("{{",posDetalhe);
        }
        
        blocoFuncao += "_html_ += \"" + itemRelatorio.substring(posDetalhe) + "\"; ";

        if(pilhaControleFluxo.length > 0){
            textoMsgErro = resultadoFuncao.funcao + ": Há estruturas de controle (loop / if) não finalizadas.";
            throw textoMsgErro;
        }

        return(blocoFuncao);
    }

    function avaliaParamRel(linhaComando){
        var valorParam = "";
        var parametro = "";
        var posInicial = 0;
        var posFinal = 0;
        var pos = 0;

        posInicial = 9;
        posFinal = linhaComando.indexOf(".",posInicial);
        if(posFinal < 0)
            posFinal = linhaComando.length;
        parametro = linhaComando.substring(posInicial,posFinal);
        linhaComando = linhaComando.substring(posFinal + 1);
        if(linhaComando == "")
            linhaComando = "value";
        pos = paramRelatorioProps.indexOf(parametro)
        if(pos > -1){
            if(linhaComando == "name")
                valorParam =  "\"" + element.parameters[pos].title + "\"";
            else{
                if(linhaComando == "text")
                    valorParam = "\"" + paramRelatorio[paramRelatorioProps[pos]].text + "\"";
                else{
                    if(linhaComando == "value"){
                        valorParam = "p_" + parametro.trim() + "_";
                    }
                }
            }
        }
        if(valorParam == ""){
            textoMsgErro = resultadoFuncao.funcao + ": Parâmetro " + parametro + " não reconhecido.";
            throw textoMsgErro;
        }
        return(valorParam);
    }
}


function createGraphic(element, html, type) {
    var item = "";  
    var field = "";
    var data = "";
    var labels = "";
    var index = 0;
    if(html){
        element.forEach(function(name){                        
            for (var key in name) { 
                
                if(labels == "" && key == "labels"){
                    labels += "'" + name[key] + "'" 
                }else{
                    if(data == "" && key == "data"){
                        if(name[key] == null){
                            name[key] = "0";
                        }
                        data += name[key]
                    }else{
                        if(key == "data"){
                            if(name[key] == null){
                                name[key] = "0";
                            }
                            data += ", " + name[key]
                        }else if(key == "labels"){
                            labels += ", '" + name[key] + "'"                            
                        }
                    }                 
                }
                index += 1;
            } 
        });
        
        data = "[" + data + "]";
        labels = "[" + labels + "]";

        item = "<canvas id=\"myChart\" width=\"1000\" height=\"1000\" ></canvas>";
        item += "<script>";
        item += "var ctx = document.getElementById(\"myChart\");";
        item += "var myChart = new Chart(ctx, {";
        item += "    type: '" + type + "',";
        item += "    data: {";
        item += "        labels: " + labels + ",";
        item += "        datasets: [{";
        item += "            label: '',";
        item += "            data: " + data + ",";
        item += "            backgroundColor: [";
        item += "                'red',";
        item += "                'blue',";
        item += "                'yellow',";
        item += "                'green',";
        item += "                'purple',";
        item += "                'orange',";
        item += "                'magenta',";
        item += "                'brown',";
        item += "                'white',";
        item += "                'black',";
        item += "                'gray',";
        item += "                'gold',";
        item += "                'belge',";
        item += "                'violet',";
        item += "                'viridian',";
        item += "                'silver',";
        item += "                'indigo',";
        item += "                'coral'";
        item += "            ],";
        item += "            borderWidth: 1";
        item += "        }]";
        item += "    },";
        item += "    options: {";
        item += "        animation: {";
        item += "            duration: 0";
        item += "        }";
        item += "    }";
        item += "});";
        item += "</script>";

        html = html.replace("{{graphic}}", item);
        
    }
    return html;
}

function createHeader(element, html, reportname){
    var item = "";  
    var field = "";
    var imagem = "";
    var empresa = "";
    var now = new Date();
    var data = now.getDate() + "/" + (now.getMonth() + 1) + "/" + now.getFullYear()

    item = "<div id='pageHeader' style='width:100%'>";
    item += "<table cellspacing='0' style='width:100%;font-family:Arial'>";
    item += "<thead>";
    /*
    item += "<tr>";
    if(element.recipe == "pdf"){
        imagem = fs.readFileSync("/imagens/logos/logo_" + EnterpriseID + ".jpg", "base64");
        //<IMG SRC="data:image/jpg;base64, codigos-base64">
        item += "<th rowspan=2 style=\"width:10%; text-align:left; vertical-align:middle; font-weight: bold; font-size: medium; color:black; border-style:hidden\"> <div><img border=0 src=\"data:image/jpg;base64," + imagem + "\" width=130px height=auto></div> </th>";
        //item += "<th rowspan=2 style=\"width:10%; text-align:left; vertical-align:middle; font-weight: bold; font-size: medium; color:black; border-style:hidden\"> <div><img border=0 src=\"file://imagens/logos/logo_" + EnterpriseID + "\" width=130px height=auto></div> </th>";
    }
    else{
        item += "<th rowspan=2 style=\"width:10%; text-align:left; vertical-align:middle; font-weight: bold; font-size: medium; color:black; border-style:hidden\"> <img border=0 src=\"" + serverWindows + "/imagens/logos/logo_" + EnterpriseID + ".jpg\" width=130px height=auto> </th>";
    }
    */
    item += "<tr>";    
    item += "<th rowspan='2' style='width:10%; text-align:left; vertical-align:middle; font-weight: bold; font-size: medium; color:black; border-style:hidden'> <img border=0 src='" + serverWindows + "/imagens/logos/logo_" + EnterpriseID + ".jpg' width=130px height=auto> </th>";
    item += "<th style='width:80%; text-align:center; vertical-align:middle; font-weight: bold; font-size: large; color:black; border-style:hidden;'>{{titulo:}}</th>";
    item += "<th rowspan='2' style='width:10%; text-align:right; vertical-align:middle; font-weight: bold; font-size: small; color:black; border-style:hidden;'>" + data + "</th>";
    item += "</tr>";
    item += "<tr>";
    item += "<th style='text-align:center; vertical-align:middle; font-weight: bold; font-size:small; color:black; border-style:hidden;'>{{subt:}}</th>";
    item += "</tr>";
    item += "<tr>";
    if(element.recipe == "pdf"){
        item += "<th colspan='2' style='text-align:left; vertical-align:middle; font-weight: bold; font-size: x-small; color:black; border-style:hidden;'>" + EnterpriseName + "</th>";
        item += "<th style='text-align:right; vertical-align:middle; font-weight: bold; font-size: x-small; color:black; border-style:hidden;'>Página: {{page}}</th>";
    }
    else{
        item += "<th colspan='2' style='width:10%;text-align:left; vertical-align:middle; font-weight: bold; font-size: x-small; color:black; border-style:hidden;'>" + EnterpriseName + "</th>";
        item += "<th style='text-align:right; vertical-align:middle; font-weight: bold; font-size: medium; color:black; border-style:hidden'> <img border=0 src='" + serverWindows + "/imagens/logos/logo_empresariocloud.jpg' width=100px height=auto> </th>";
    }
    item += "</tr>";
    item += "<tr><th colspan=3></th></tr>";
    item += "</thead>";
    item += "</table>";
    item += "</div>";
    
    html = html.replace("{{headerdefault}}", item);
    html = html.replace("{{headerdefault}}","");
    html = html.replace("{{/headerdefault}}","");

    return item;
}

function createDetails(element, html){
    var item = "";    
    var arrayHtml = {};
    var arrayAppend = [];
    var fields = "";
    var index = -1;
    var arrayKey = [];
    var arrayKeyName = [];
    var arrayDetail = [];

    if(html.indexOf("{{detail") >= 0) {
        element.forEach(function(name){                        
            for (var key in name) {  
                item = html.substring(html.indexOf("{{foreach " + key + "}}"),html.indexOf("{{/foreach " + key + "}}"));
                item = item.replace("{{foreach " + key + "}}","");
                if(item.indexOf("{{" + key + "}}") > -1){
                    fields += key + ",";                                   
                }
                
                if(item.indexOf("{{" + key + "}}") > -1){
                    index += 1;
                    if(!arrayAppend[key]){
                        arrayAppend[key] = "";
                    }
                    arrayAppend[index] = item.replace("{{" + key + "}}",name[key]);
                }
            } 
        });
    
        arrayDetail[0] = "";
    
        for(var i = 0; i < arrayAppend.length; i++){  
            arrayDetail[0] += arrayAppend[i];
        }
        
        var detail = html.substring(html.indexOf("{{detail 0}}"),html.indexOf("{{/detail 0}}"));
        detail = detail.replace("{{detail 0}}","");
        detail = detail.replace("{{/detail 0}}","");
    
        detail = "{{detail 0}}" + detail + "{{/detail 0}}";
        html = html.replace(detail, arrayDetail[0]);
    
    }
    
    return html;
}

function createFooter(element, html, reportname){
    var item = "";  
    var field = "";

    item += "<div id='pageFooter' style='width:100%'>";
    item += "<table cellspacing='0' style='width:100%;font-family:Arial;border-style:hidden;'>";
    item += "<thead>";
    item += "<tr>";
    if(element.recipe == "pdf"){
        item += "<th style='width:50%; text-align:left; vertical-align:middle; font-weight: bold; font-size: medium; color:black;'> <img border=0 src='" + serverWindows + "/imagens/logos/logo_intelecta.jpg' width=90px height=15px> </th>";
        item += "<th style='width:50%; text-align:right; vertical-align:middle; font-weight: bold; font-size: medium; color:black;'> <img border=0 src='" + serverWindows + "/imagens/logos/logo_empresariocloud.jpg' width=90px height=15px> </th>";
    }
    else{
        item += "<th style='width:50%; text-align:left; vertical-align:middle; font-weight: bold; font-size: medium; color:black;'> <img border=0 src='" + serverWindows + "/imagens/logos/logo_intelecta.jpg' width=100px height=20px> </th>";
        item += "<th style='width:50%; text-align:right; vertical-align:middle; font-weight: bold; font-size: medium; color:black;'> <img border=0 src='" + serverWindows + "/imagens/logos/logo_empresariocloud.jpg' width=100px height=20px> </th>";
    }
    item += "</tr>";
    item += "</thead>";
    item += "</table>";
    item += "</div>";

    return(item);
    /*
    if(html){
        item = html.substring(html.indexOf("{{footer}}"),html.indexOf("{{/footer}}"));
        item = item.replace("{{footer}}","");
        html = html.replace(item,"{{footer}}");

        element.forEach(function(name){                        
            for (var key in name) { 
                if(item.indexOf("{{" + key + "}}") > -1){
                    if(field.indexOf("{{" + key + "}}") == -1){
                        item = item.replace("{{" + key + "}}", name[key]);
                        field += "{{" + key + "}}";
                    }
                }
            } 
        });
        
        html = html.replace("{{footer}}", item);
        html = html.replace("{{footer}}","");
        html = html.replace("{{/footer}}","");
    }
    return html;
    */
}

function createMaster(element, html){
    var item = "";  
    var field = "";
    if(html){
        item = html.substring(html.indexOf("{{master}}"),html.indexOf("{{/master}}"));
        item = item.replace("{{master}}","");
        html = html.replace(item,"{{master}}");

        element.forEach(function(name){                        
            for (var key in name) { 
                if(item.indexOf("{{" + key + "}}") > -1){
                    if(field.indexOf("{{" + key + "}}") == -1){
                        item = item.replace("{{" + key + "}}", name[key]);
                        field += "{{" + key + "}}";
                    }
                }
            } 
        });

        html = html.replace("{{master}}", item);
        html = html.replace("{{master}}","");
        html = html.replace("{{/master}}","");
    }
    return html;
}

var http = require('http');
//var jsreport = require('jsreport');
var jsreport = require('jsreport-core')()

router.route('/reportOLD/:nome').get(function(req, res) {
    var MongoClient = require('mongodb').MongoClient;

    var nome = req.param('nome');
    var select = ""; //'select Id, nm_razaosocial, nr_codigo, dt_cadastro, nm_nomefantasia, sn_pessoafisica, nm_cpf, nm_cnpj FROM entidade'
    var html = "";
    var engine = "";
    var recipe = "";

    //nome = nome.toUpperCase();
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      
      db.collection("reports").find({"nome": nome}, { _id: false }).toArray(function(err, result) {
        if (err) throw err;
        if (result) {
            if (result.length > 0) {
                select = result[0].select;  
                html = result[0].html;  
                engine = result[0].engine;
                recipe = result[0].recipe;
            }
        }
        
        db.close();
        sql.close()

        // connect to your database
        sql.connect(config, function (err) {    
            if (err) console.log(err);
    
            // create Request object
            var request = new sql.Request();       
    
            // query to the database and get the records
            request.query(select, function (err, recordset) {            
                if (err) console.log(err)
                
                jsreport.init().then(function () {   
                    console.log(recordset.recordsets);  
                    return jsreport.render({
                        template: {
                            content: html,
                            engine: engine, //'handlebars', 'jsrender',
                            recipe: recipe //'xlsx' 'phantom-pdf'
                         },
                         data:  recordset.recordsets
                     }).then(function(out) {
                        out.stream.pipe(res);
                    });
                 }).catch(function(e) {
                   console.log(e)
                 })
                     
                // send records as a response
                //res.send(recordset.recordset)            
            });
        }); 
      });
    });    
})



router.route('/reportparam/:nome/:parametros').get(function(req, res) {
    var MongoClient = require('mongodb').MongoClient;

    var parametros = req.param('parametros');
    var nome = req.param('nome');
    var select = ""; //'select Id, nm_razaosocial, nr_codigo, dt_cadastro, nm_nomefantasia, sn_pessoafisica, nm_cpf, nm_cnpj FROM entidade'
    var html = "";
    var engine = "";
    var recipe = "";

    //nome = nome.toUpperCase();
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      
      db.collection("reports").find({"nome": nome}, { _id: false }).toArray(function(err, result) {
        if (err) throw err;
        if (result) {
            if (result.length > 0) {
                select = result[0].select;  
                html = result[0].html;  
                engine = result[0].engine;
                recipe = result[0].recipe;

                var arrayParam = parametros.split(",")
                if(select.indexOf("{{0}}") > -1){
                    for (let i = 0; i < arrayParam.length; i++) {
                        select = select.replace("{{" + i + "}}", arrayParam[i])
                    }
                    
                    console.log(select);
                }

            }
        }
        
        db.close();
        sql.close()

        // connect to your database
        sql.connect(config, function (err) {    
            if (err) console.log(err);
    
            // create Request object
            var request = new sql.Request();       
    
            // query to the database and get the records
            request.query(select, function (err, recordset) {            
                if (err) console.log(err)
                
                jsreport.init().then(function () {   
                    console.log(recordset.recordsets);  
                    return jsreport.render({
                        template: {
                            content: html,
                            engine: engine, //'handlebars', 'jsrender',
                            recipe: recipe //'xlsx' 'phantom-pdf'
                         },
                         data:  recordset.recordsets[0]
                     }).then(function(out) {
                        out.stream.pipe(res);
                    });
                 }).catch(function(e) {
                   console.log(e)
                 })
    
                // send records as a response
                //res.send(recordset.recordset)            
            });
        }); 
      });
    });    
})




router.route('/report3/:nome').get(function(req, res) {
    var MongoClient = require('mongodb').MongoClient;
    //var url = "mongodb://localhost:27017/erpcloud";
        
    var nome = req.param('nome');
    var select = ""; //'select Id, nm_razaosocial, nr_codigo, dt_cadastro, nm_nomefantasia, sn_pessoafisica, nm_cpf, nm_cnpj FROM entidade'
    var html = "";
    //nome = nome.toUpperCase();
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
      
        db.collection("reports").find({"nome": nome}, { _id: false }).toArray(function(err, result) {
        if (err) throw err;
        if (result) {
            if (result.length > 0) {
                select = result[0].select;  
                html = result[0].html;         
            }
        }
    
        db.close();
        sql.close()

        // connect to your database
        sql.connect(config, function (err) {    
            if (err) console.log(err);

            // create Request object
            var request = new sql.Request();       

            // query to the database and get the records
            request.query(select, function (err, recordset) {            
                if (err) console.log(err)    
                // send records as a response
                res.send(recordset)            
            });
        }); 
        });
    });
})

router.route('/listall/:id/:userID').get(function(req, res) {
    //var url = "mongodb://localhost:27017/erpcloud";
    var id = req.param('id');
    var userID = req.param('userID');
    var objret = {};
    userPermission("consultar", id, userID, function(permission){
        
        if(permission == false){            
            objret.status = "error";
            objret.message = "Sem permissão para consultar";
            res.send(objret);
        }else{
            var MongoClient = require('mongodb').MongoClient;
            var select = ""; //'select Id, nm_razaosocial, nr_codigo, dt_cadastro, nm_nomefantasia, sn_pessoafisica, nm_cpf, nm_cnpj FROM entidade'
            id = id.toUpperCase();
            MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            db.collection("layouts").find({"layoutID": id}, { _id: false }).toArray(function(err, result) {
                if (err) throw err;
                if (result) {
                    if (result.length > 0) {
                        select = result[0].listall;
                    }
                }
                
                db.close();

                sql.close()
                // connect to your database
                sql.connect(config, function (err) {    
                    if (err) console.log(err);

                    // create Request object
                    var request = new sql.Request();       

                    // query to the database and get the records
                    request.query(select, function (err, recordset) {            
                        if (err) console.log(err)

                        console.log(config)
                        // send records as a response
                        res.send(recordset)            
                    });
                });    

            });
            });
            
        }
    })    
    

});

router.route('/findid/:id').get(function(req, res) {
    var MongoClient = require('mongodb').MongoClient;
    //var url = "mongodb://localhost:27017/erpcloud";
    var id = "d82d11c8-ea16-47c7-be04-10423467f04e"; //req.param('id');
    var select = ""; //'select Id, nm_razaosocial, nr_codigo, dt_cadastro, nm_nomefantasia, sn_pessoafisica, nm_cpf, nm_cnpj FROM entidade'

    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      db.collection("layouts").find({"layoutID": id}, { _id: false }).toArray(function(err, result) {
        if (err) throw err;
        if (result) {
            if (result.length > 0) {
                select = result[0].finddata;                                
            }
        }
        
        db.close();
      });
    });

    sql.close()

    // connect to your database
    sql.connect(config, function (err) {    
        if (err) console.log(err);
        
        var id = req.param('id');

        // create Request object
        var request = new sql.Request();
        
        select = select.replace("{{id}}", id)
         // query to the database and get the records
        request.query(select, function (err, recordset) {            
            if (err) console.log(err)

            // send records as a response
            res.send(recordset)            
        });
    });    
});


router.route('/findid2/:id/:layoutid').get(function(req, res) {
    var MongoClient = require('mongodb').MongoClient;
    //var url = "mongodb://localhost:27017/foodtown";
    var id = req.param('id');
    var layoutid = req.param('layoutid');
    var select = ""; //'select Id, nm_razaosocial, nr_codigo, dt_cadastro, nm_nomefantasia, sn_pessoafisica, nm_cpf, nm_cnpj FROM entidade'
    layoutid = layoutid.toUpperCase();
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      db.collection("layouts").find({"layoutID": layoutid}, { _id: false }).toArray(function(err, result) {
        if (err) throw err;
        if (result) {
            if (result.length > 0) {
                select = result[0].finddata;                                
            }
        }
       
        db.close();

        
        sql.close()

        // connect to your database
        sql.connect(config, function (err) {    
            if (err) console.log(err);
            
            var id = req.param('id');

            // create Request object
            var request = new sql.Request();
            if (id == "*") {
                select = select.substr(0,select.lastIndexOf("WHERE"));
            }else{
                select = select.replace("{{id}}", id)
            }

            // query to the database and get the records
            request.query(select, function (err, recordset) {  
                if (err) console.log(err)
                var retorno = [];
                var retornoFinal = {};
                var arraydataJSON = [];
                var tableorder = [];
                var table;
                var field;
                if (recordset) {
                    if (recordset.recordsets) {
                        if (recordset.recordsets.length > 0) {
                            var array = recordset.recordsets[0];
                            
                            var arrayindex = [];
                            row = null;
                            var j = 0;
                            for (let i = 0; i < array.length; i++) {
                                var arraytable = [];
                                
                                var row = null;
                                for (var key in array[i]) {
                                    var keyvalue = "";
                                    
                                    var keyfield = key.split('.')
                                    table = keyfield[0];
                                    field = keyfield[1];
                                    keyvalue = key + ":" + array[i][key];
        
                                    if (arraytable.indexOf(table) == -1 ) { 
                                        if(j == 0){
                                            tableorder.push(table);
                                        }
        
                                        if (row) {
                                            if(arraydataJSON.indexOf(JSON.stringify(row)) == -1){
                                                var arrayRow = [];
                                                arrayRow.push(row);
                                                retorno.push(row)
                                                arraydataJSON.push(JSON.stringify(row));
                                            }                                    
                                        }
        
                                        arraytable.push(table);                     
                                        row = {};
                                        row[key] = array[i][key];
                                    }else{
                                        row[key] = array[i][key];
                                    }
                                    
                                    if (key.indexOf("id_") > -1 && key.indexOf("_FK") == -1) {
                                        if (row[key] != null) {
                                            row[key] = row[key].toLowerCase();
                                        }
                                        
                                    }

                                    j++
                                }
                                if (row) {
                                    if(arraydataJSON.indexOf(JSON.stringify(row)) == -1){
                                            var arrayRow = [];
                                            arrayRow.push(row);
                                            retorno.push(row)
                                            arraydataJSON.push(JSON.stringify(row));                                
                                    }                                    
                                }
                            }                    
                        }
                    }
                }
                
            

                retorno = retorno.sort(compare);
                //retorno = [];
                //retorno.push(retornoFinal);
                // send records as a response
                res.send(retorno)            
            });
        });  
      });
    });
  
});

function compare(a,b) {
    var c;
    var d;

    for (var keya in a) {
        for (var keyb in b) {
            break;
        }
        break;
    }
    
    
    if (keya < keyb)
       return -1;
    if (keya > keyb)
      return 1;
    return 0;
  }
router.route('/editGridLine/:id/:filtro').get(function(req, res) {
    var MongoClient = require('mongodb').MongoClient;
    //var url = "mongodb://localhost:27017/erpcloud";
    var id = req.param('id');
    var filtro = req.param('filtro');
    var select = ""; //'select Id, nm_razaosocial, nr_codigo, dt_cadastro, nm_nomefantasia, sn_pessoafisica, nm_cpf, nm_cnpj FROM entidade'

    id = id.toUpperCase();
    console.log(id)
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      db.collection("containers").find({"containerID": id}, { _id: false }).toArray(function(err, result) {
        if (err) throw err;
        if (result) {
            if (result.length > 0) {
                select = result[0].findgriddata;                                
            }
        }
        
        db.close();
      });
    });

    sql.close()
    
    console.log(select)
    // connect to your database
    sql.connect(config, function (err) {    
        if (err) console.log(err);
         
        // create Request object
        var request = new sql.Request();
        
        select = select.replace("{{id}}", filtro)

         // query to the database and get the records
        request.query(select, function (err, recordset) {            
            if (err) {
                console.log(err)
                res.send(err)
            }
            // send records as a response 
            res.send(recordset)            
        });
    });        
});

function incremento(submit, callback){
	var arrayRetorno = [];
    var countFor = 0;

    sql.close();
    sql.connect(config, function (err) {  
        for (var index = 0; index < submit.length; index++) {
            var table;
            var field;
            var indexIncrement = -1;
            var fieldincrement = "";

            for (var key in submit[index]) {
                indexIncrement = key.indexOf("_INCREMENT");
                
                if (indexIncrement >= 0) {
                    fieldincrement = key;
                    break;
                }
            }
            
            field = fieldincrement.replace("_INCREMENT","");
            table = submit[index]["TABLE"];
      
            var select = "SELECT nr_incremento, nm_campo FROM incremento WHERE nm_tabela = '" + table + "' AND nm_campo='" + field + "'"
           
            request = new sql.Request();
            
            request.query(select, function (err, recordset) {	
                if (err) console.log(err)
                
                console.log("recordSET - ")
                if (recordset) {
                    if (recordset.recordset) {
                        arrayRetorno.push(recordset.recordset[0]);
                    }else{
                        arrayRetorno.push(null);
                    } 
                }else{
                    arrayRetorno.push(null);
                }
                countFor += 1;
                
                if(submit.length == countFor){
                    callback(arrayRetorno, submit); 						
                }             
            
            });     
        }
    });
}

router.route('/save').post(function(req, res) {   
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed
    var full = req.host; 
    conectionsLink(full,function(conectado){

    if(conectado){

        
    var update = "";
    var retorno = "0"
    var setrecord;
    var error = "";

    var submit = req.body;
    var insertOrUpdate = ""
    var request = new sql.Request();

    var guid = general.guid(); 
    var countfor = 0;
    var arrayretorno = [];
    var retorno = "["
    
    var ind = -1;
    var layoutID = "";
    var tipo = "";
    UserID = submit[0]["UserID"];
    layoutID = submit[0]["layoutID"];

    if (submit[0]["id"] == "" || !submit[0]["id"]) {
        tipo = "incluir"
    }else{
        tipo = "alterar"
    }

    userPermission(tipo, layoutID, UserID, function(permission){
        
        if(permission == false){
            var array = [];
            objret = {};
            objret.status = "error";
            objret.message = "Sem permissão para " + tipo;
            array.push(objret)
            res.send(array);
        }else{

    incremento(submit, function(resultado, submit){
        sql.close()
        sql.connect(config).then(function() {
        for (var index = 0; index < submit.length; index++) {
            
            beforeSave(submit[index], function(retornoBefore){
                ind += 1;
                var booleanBefore = true;

                if (retornoBefore) {
                    if (retornoBefore.length > 0) {
                        booleanBefore = retornoBefore[0].success;
                        if (retornoBefore[0].title) {
                            if (retornoBefore[0].title.length > 0) {
                                for (let i = 0; i < retornoBefore.length; i++) {
                                    if (i > 0) {
                                        retorno += ",";
                                    }
                                    retorno += '{ "status": "error", "message": "' + retornoBefore[i].title[0].toolTip + '" }'                                    
                                    booleanBefore = false;
                                }                               
                            }
                        }                        
                    }
                }
                if (submit) {
                    if (submit.length > 0) {
                        EnterpriseID = submit[ind]["EnterpriseID"];
                        UserID = submit[ind]["UserID"];
                        layoutID = submit[ind]["layoutID"];

                        delete submit[ind]['EnterpriseID'];
                        delete submit[ind]['UserID'];
                        delete submit[ind]["layoutID"];
                    }
                }

                if (booleanBefore) {      
                    
                    if (submit[ind]["id"] == "" || !submit[ind]["id"]) {
                                                      
                                var numberincrement;
                                var updateincrement = ""
                
                                if(resultado){
                                    if (resultado.length > 0) {
                                        if (resultado[ind] != null) {
                                            if(resultado[ind].nr_incremento){ 
                                                if (resultado[ind].nm_campo) {
                                                    submit[ind][resultado[ind].nm_campo + "_INCREMENT"] = parseInt(resultado[ind].nr_incremento) + 1
                                                    numberincrement = parseInt(resultado[ind].nr_incremento) + 1 
                                                    updateincrement = "UPDATE incremento SET nr_incremento=" + numberincrement + " WHERE nm_tabela='" + submit[ind]["TABLE"] + "' AND nm_campo='" + resultado[ind].nm_campo + "'"
                                                }
                                            }
                                        }                        
                                    }                    
                                }
                                
                                insertOrUpdate = createInsert(submit, ind, guid, layoutID)
                                insertOrUpdate += updateincrement;                
                                request = new sql.Request();
                                request.query(insertOrUpdate).then(function(recordset) {
                                    if (countfor > 0) {
                                        retorno += ",";
                                    }
            
                                    if (resultado[countfor]) {
                                        retorno += '{ "status": "success", "id": "' + guid + '", "increment": "' + numberincrement + '", "incrementfield": "' + submit[countfor]["TABLE"] + "." + resultado[countfor].nm_campo.replace("_INCREMENT","") + '"}'
                                    }else{
                                        retorno += '{ "status": "success", "id": "' + guid + '" }'
                                    }
                                    
                                    submit[countfor]["EnterpriseID"] = EnterpriseID;
                                    submit[countfor]["UserID"] = UserID;
                                    submit[countfor]["id"] = guid;
                                    afterSave(submit[countfor])
            
                                    countfor +=1;
                                    if (submit.length == (countfor)) {
                                        retorno += "]"
                                        var obj = JSON.parse(retorno)
                                        res.send(obj)
                                    }
                                    
                                }).catch(function(err) {
                                    console.log('Request error: ' + err);
                                    if (countfor > 0) {
                                        retorno += ",";
                                    }
                                    retorno += '{ "status": "error", "message": "' + err + '" }'
                                    
                                    countfor +=1;
                                    if (submit.length == countfor) {
                                        retorno += "]"
                                        var obj = JSON.parse(retorno)
                                        res.send(obj)
                                    }
                                });
                    }else{
                        
                                guid = submit[ind]["id"];
                                insertOrUpdate = createUpdate(submit, ind) 
                                request = new sql.Request();
                                request.query(insertOrUpdate).then(function(recordset) {
                                    if (countfor > 0) {
                                        retorno += ",";
                                    }
                                    retorno += '{ "status": "success", "id": "' + guid + '" }'  
                                    

                                    submit[countfor]["EnterpriseID"] = EnterpriseID;
                                    submit[countfor]["UserID"] = UserID;
                                    
                                    afterSave(submit[countfor])
                                    countfor +=1;
                                    if (submit.length == countfor && permission == true) {
                                        retorno += "]"
                                        var obj = JSON.parse(retorno)
                                        res.send(obj)
                                    }
                                }).catch(function(err) {
                                    console.log('Request error: ' + err);
                                    if (countfor > 0) {
                                        retorno += ",";
                                    }
                                    retorno += '{ "status": "error", "message": "' + err + '" }'
                                    countfor +=1;
                                    if (submit.length == countfor && permission == true) { 
                                        retorno += "]"
                                        var obj = JSON.parse(retorno)
                                        res.send(obj)
                                    }
                                })
                                
                    }
                }else{
                    if (countfor > 0) {
                        retorno += ",";
                    }                    
                    countfor +=1;
                    if (submit.length == countfor && permission == true) { 
                        retorno += "]"
                        var obj = JSON.parse(retorno)
                        res.send(obj)
                    }
                }   
            })
        } 
    }).catch(function(err) {
        if (err) {
            console.log('SQL Connection Error: ' + err);
            if (countfor > 0) {
                retorno += ",";
            }
            retorno += '{ "status": "error", "message": "' + err + '" }'
            
            countfor +=1;
            if (submit.length == countfor && permission == true) {
                retorno += "]"
                var obj = JSON.parse(retorno)
                res.send(obj)
            }
        }
    });     
    })    
}
})
}
})
})

function beforeSave(submit, callback){
    var retorno = false;    
    var arraySubmitObject = [];
    
    for (var key in submit) {
        var SubmitObject = {};
        SubmitObject["table"] = submit["TABLE"];
        SubmitObject["field"] = key;
        SubmitObject["newValue"] = [];
        SubmitObject["oldValue"] = [];
        SubmitObject["newValue"].push(submit[key]);
        SubmitObject["oldValue"].push(submit[key]);
        SubmitObject["EnterpriseID"] = submit["EnterpriseID"];
        SubmitObject["UserID"] = submit["UserID"];
        SubmitObject["nativeDataType"] = "";
        SubmitObject["sequenceRecording"] = "0";
        SubmitObject["controlID"] = "";
        SubmitObject["derivedFrom"] = "";
        SubmitObject["ContainerID"] = "";
        SubmitObject["LayoutID"] = "";
        SubmitObject["title"] = "";
        SubmitObject["message"] = [];
        SubmitObject["visibleGrid"] = false;
        arraySubmitObject.push(SubmitObject)
    }
    
    callWebAPI(arraySubmitObject, serverWindows + "/api/DataBase/BeforeSave", function(retorno){
        callback(retorno)
    })
    
}

function afterSave(submit){
    var retorno = false;    
    var arraySubmitObject = [];
    
    for (var key in submit) {
        var SubmitObject = {};
        SubmitObject["table"] = submit["TABLE"];
        SubmitObject["field"] = key;
        SubmitObject["newValue"] = [];
        SubmitObject["oldValue"] = [];
        SubmitObject["newValue"].push(submit[key]);
        SubmitObject["oldValue"].push(submit[key]);
        SubmitObject["EnterpriseID"] = submit["EnterpriseID"];
        SubmitObject["UserID"] = submit["UserID"];
        SubmitObject["nativeDataType"] = "";
        SubmitObject["sequenceRecording"] = "0";
        SubmitObject["controlID"] = "";
        SubmitObject["derivedFrom"] = "";
        SubmitObject["ContainerID"] = "";
        SubmitObject["LayoutID"] = "";
        SubmitObject["title"] = "";
        SubmitObject["message"] = [];
        SubmitObject["visibleGrid"] = false;
        arraySubmitObject.push(SubmitObject)
    }
    //callWebAPI(arraySubmitObject, "http://homologa.empresariocloud.com.br/api/DataBase/AfterSave")
    callWebAPI(arraySubmitObject, serverWindows + "/api/DataBase/AfterSave")    
}

function createInsert(submit, index, guid, layoutID){
    var insertOrUpdate = "";
    var ind = 0;
    var table = "";        
    var sqlfields = "";
    var sqlvalues = "";
    ind = 0;
        
    sqlfields = "( "
    sqlvalues = " VALUES( ";
    
    for (var key in submit[index]) { 
        
        if (submit[index][key]) {
            var valor = String(submit[index][key]);
            if (valor.includes("'") >= 0) {
                submit[index][key] = valor.replace("'","")
            }
        }
        
        if (key === "TABLE") {
            table = submit[index][key]
        }else{
            if (key == "id" && submit[index][key] == "") {
                submit[index][key] = "" + guid + ""
            }
            
            var prefixo = key[0] + key[1];

            switch (prefixo) {
                case "id":
                    if (submit[index][key] == "") {
                        submit[index][key] = "NULL"
                    }else{
                        submit[index][key] = "'" + submit[index][key] + "'"
                    }
                    break;
                case "sn":
                    if (submit[index][key] == "" || submit[index][key] == "false") {
                        submit[index][key] = "0"
                    }else{
                        submit[index][key] = "1"
                    }
                    
                    switch (layoutID.toLowerCase()) {
                        case "d82d11c8-ea16-47c7-be04-10423467f04e":
                            if(key == "sn_tipoentidadecliente"){
                                submit[index][key] = "1";
                            }
                            break;
                        case "589b6dae-4b0b-41f1-9516-3eaf235dff61":
                            if(key == "sn_tipoentidadefornecedor"){
                                submit[index][key] = "1";
                            }
                            break;
                        case "74cfff79-da65-4172-8f8c-e6ce92da5819":
                            if(key == "sn_tipoentidadeprestador"){
                                submit[index][key] = "1";
                            }
                            break;
                        case "26d46f90-5b1f-4e64-b2a8-b97090df03dc":
                            if(key == "sn_tipoentidadevendedor"){
                                submit[index][key] = "1";
                            }
                            break;
                        default:
                            break;
                    }

                    break;
                case "nm":
                    submit[index][key] = "'" + submit[index][key] + "'"                   
                    break;
                case "dt":
                    if (submit[index][key] == "" || submit[index][key] == "01/01/1900") {
                        submit[index][key] = "NULL"
                    }else{
                        var dts = submit[index][key].split('/');
                        if (dts.length > 0) {
                            submit[index][key] = dts[1] + "/" + dts[0] + "/" + dts[2];
                        }
                        submit[index][key] = "'" + submit[index][key] + "'"
                    }

                    break;
                case "vl":
                    if (submit[index][key] == "") {
                        submit[index][key] = "0"
                    }
                    
                    var decimal = submit[index][key].indexOf(','); //1.000,00  ou 1,000.00
                    var unidade = submit[index][key].indexOf('.');
                    
                    if (unidade < decimal) {
                        submit[index][key] = submit[index][key].replace(".","").replace(",",".");
                    }else{
                        submit[index][key] = submit[index][key].replace(",","");
                    }

                    break;
                case "nr":
                if (submit[index][key] == "") {
                    submit[index][key] = "0"
                }
                break;
                default:
                    if (submit[index][key]) {
                        submit[index][key] = "NULL"
                    }
                    break;
            }

            if (ind == 0) {
                sqlvalues += "" + submit[index][key] + " "
                if (key.includes("_INCREMENT")) {
                    key = key.replace("_INCREMENT","")
                 }
                sqlfields += key                    
            }else{
                sqlvalues = sqlvalues + ", " + submit[index][key] + " "
                if (key.includes("_INCREMENT")) {
                    key = key.replace("_INCREMENT","")
                }
                sqlfields = sqlfields + ", " + key
            }

            ind += 1
        }
    }    
    
    sqlfields += ") "
    sqlvalues += ") "
    insertOrUpdate += " INSERT INTO " + table + " ";
    insertOrUpdate +=  sqlfields + " " + sqlvalues

    return insertOrUpdate;
}

function createUpdate(submit, index){
    var update = "OK";
    var ind = 0;
    var table = "";        
    var id = "";
    var sqlvalues = ""

    for (var key in submit[index]) {            
        if (key === "TABLE" || key === "id") {
            if (key === "TABLE") {
                table = submit[index][key]
            }else{
                id = "'" + submit[index][key] + "'"
            }            
        }else{            
            var prefixo = key[0] + key[1];
            
            switch (prefixo) {
                case "id":
                    if (submit[index][key] == "" || submit[index][key] == undefined || submit[index][key] == "undefined") {
                        submit[index][key] = "NULL"
                    }else{
                        submit[index][key] = "'" + submit[index][key] + "'"
                    }
                    break;
                case "sn":
                    if (submit[index][key] == "" || submit[index][key] == "false") {
                        submit[index][key] = "0"
                    }else{
                        submit[index][key] = "1"
                    }
                    break;
                case "nm":
                    submit[index][key] = "'" + submit[index][key] + "'"                   
                    break;
                case "dt":
                    if (submit[index][key] == "" || submit[index][key] == "01/01/1900") {
                        submit[index][key] = "NULL"
                    }else{
                        //if (submit[index][key].length == 10) {
                        //    submit[index][key] = submit[index][key] + " 00:00:00"
                        //}
                        var dtsplit = submit[index][key].split("/")
                        submit[index][key] = dtsplit[1] + "/" + dtsplit[0] + "/" + dtsplit[2]

                        submit[index][key] = "'" + submit[index][key] + "'"
                    }                  
                    break;
                case "vl":
                    if (submit[index][key] == "") {
                        submit[index][key] = "0"
                    }
                    
                    var decimal = submit[index][key].indexOf(','); //1.000,00  ou 1,000.00
                    var unidade = submit[index][key].indexOf('.');
                    
                    if (unidade < decimal) {
                        submit[index][key] = submit[index][key].replace(".","").replace(",",".");
                    }else{
                        submit[index][key] = submit[index][key].replace(",","");
                    }
            
                    break;
                case "nr":
                if (submit[index][key] == "") {
                    submit[index][key] = "0"
                }
                break;
                default:
                    //if (submit[index][key]) {
                        submit[index][key] = "NULL"
                    //}
                    break;
            }


            if (ind == 0) {                                
                sqlvalues += key.replace("_INCREMENT","") + "=" + submit[index][key] + " "
            }else{
                sqlvalues += ", " + key.replace("_INCREMENT","") + "=" + submit[index][key] + " "
            }

            ind += 1
        }
    }
    
    if (sqlvalues) {
        update = "UPDATE " + table + " SET " + sqlvalues + " WHERE id=" + id;
    }else{
        update = "";
    }
    
    return update;
}

router.route('/RenderAutoComplete/:filter/:controlid').get(function(req, res) {
    var MongoClient = require('mongodb').MongoClient;
    //var url = "mongodb://localhost:27017/erpcloud";
    var id = req.param('filter');
    var controlid = req.param('controlid');
    var select = ""; //'select Id, nm_razaosocial, nr_codigo, dt_cadastro, nm_nomefantasia, sn_pessoafisica, nm_cpf, nm_cnpj FROM entidade'
    controlid = controlid.toUpperCase();
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      
      db.collection("controls").find({"controlID": controlid}, { _id: false }).toArray(function(err, result) {
       
        if (err) throw err;
        if (result) {
            if (result.length > 0) {
                select = result[0].autocompleteChange;
            }
        }
       
        db.close();
      });
    });

    //if (sql) {
        sql.close()
        // connect to your database
        sql.connect(config, function (err) {    
            if (err) console.log(err);

            // create Request object
            var request = new sql.Request();  
            if (select) {            
                select = select.replace("{{id}}", id)
            }    
            
            // query to the database and get the records
            request.query(select, function (err, recordset) {            
                if (err) console.log(err)
            
                if (recordset) {
                    if (recordset.recordsets) {
                        if (recordset.recordsets.length > 0) {
                            // send records as a response
                            res.send(recordset.recordsets[0]);
                        }
                    }
                }           
            });
        });    
     //}
});

router.route('/DeleteData/:layoutID/:containerID/:userID/:id').get(function(req, res) {
    var id = req.param('id');
    var containerID = req.param('containerID');
    var layoutID = req.param('layoutID');
    var userID = req.param('userID');

    containerID = containerID.toUpperCase();

    userPermission("excluir", layoutID, userID, function(permission){
        
        if(permission == false){
            objret = {};
            objret.status = "error";
            objret.message = "Sem permissão para excluir";
            res.send(objret);
        }

        var MongoClient = require('mongodb').MongoClient;
        //var url = "mongodb://localhost:27017/erpcloud";

        var deletedata = "";
        
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            db.collection("containers").find({"containerID": containerID}, { _id: false }).toArray(function(err, result) {
            if (err) throw err;
            if (result) {            
                if (result.length > 0) {
                    deletedata = result[0].deletedata;              

                    if (deletedata) {            
                        deletedata = deletedata.split("{{id}}").join(id)
                    } 
            
            
                    if (deletedata == "") {
                        var ret = '{ "status": "err", "message": "Script para deletar não foi inserido no banco"}'
                        var obje = JSON.parse(ret)
                        res.send(obje)
                    }

                sql.close()
                
                sql.connect(config).then(function() {
                        request = new sql.Request();
                        request.query(deletedata).then(function(recordset) {
                            var retorno = '{ "status": "success", "id": "' + id + '" }'
                            var obj = JSON.parse(retorno)
                            res.send(obj)
                        }).catch(function(err) {                    
                            //var retorno = "{ 'status': 'error', 'message': '" + err + "'}"
                            res.send(err)
                        });
                }).catch(function(err) {
                    if (err) {
                    console.log('SQL Connection Error: ' + err);
                    var obj = JSON.parse(err)
                    res.send(obj)
                    }
                });
            
            }
        }

        db.close();
        }); 
        });
    })
});


router.route('/containergrid/:id/:filtro').get(function(req, res) {
    var MongoClient = require('mongodb').MongoClient;
    //var url = "mongodb://localhost:27017/erpcloud";
    var id = req.param('id');
    var filtro = req.param('filtro');
    var select = ""; //'select Id, nm_razaosocial, nr_codigo, dt_cadastro, nm_nomefantasia, sn_pessoafisica, nm_cpf, nm_cnpj FROM entidade'
    id = id.toUpperCase();

    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      db.collection("containers").find({"containerID": id}, { _id: false }).toArray(function(err, result) {
        if (err) throw err;
        if (result) {
            if (result.length > 0) {
                select = result[0].fillgrid;                                
            }
        }
        
        db.close();
      });
    });

    sql.close()    

    // connect to your database
    sql.connect(config, function (err) {    
        if (err) console.log(err);
         
        // create Request object
        var request = new sql.Request();
        
        
        if (filtro == "*") {
            select = select.substr(0,select.lastIndexOf("WHERE"));
        }else{
            select = select.replace("{{id}}", filtro);
        }
        
         // query to the database and get the records
        request.query(select, function (err, recordset) {            
            if (err) {
                console.log(err)
                res.send(err)
            }
            // send records as a response 
            res.send(recordset)            
        });
    });    
});


function refreshIncrement(table, field){
    sql = "SELECT nr_incremento FROM incremento WHERE nm_tabela = '" + table + "' AND nm_campo='" + field + "'"
    var retorno = select(sql);
    if (retorno) {
        if (retorno.recordsets.length > 0) {
            return retorno.recordsets[0]
        }
    }
    return retorno;
}

function select(select){        
    return null;
}

router.route('/teste').get(function(req, res) {
    //var Client = require('node-rest-client').Client;
    
   // direct way 
   //var client = new Client();    
    
   //client.get("http://localhost:2444/api/compiler/CsharpCompiler?EnterpriseID=f1495bcf-9258-4245-8edf-d0fac225412d&Class=CadCliente&Function=ConsultaCNPJ&ValueParameters[0]=07.361.429/0001-53",
   //    function (data, response) {
        //var objectId = new ObjectID();
           // parsed response body as js object 
           res.send(req.host)
           // raw response 
   //        console.log(response);
   //    });
});

function callWebAPI(dados,url, callback){
    var Client = require('node-rest-client').Client;
    
   // direct way 
   var client = new Client();   

   var args = {
    data: dados,
    headers: { "Content-Type": "application/json" }
    };
    
   client.post(url, args,
       function (data, response) {
           if (callback) {
                callback(data);
           }
            
       }
    );
}

router.route('/layout/:id').get(function(req, res) {
    var MongoClient = require('mongodb').MongoClient;
    //var url = "mongodb://localhost:27017/erpcloud";
    var id = req.param('id');

    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      db.collection("layouts").find({"layoutID": id}, { _id: false }).toArray(function(err, result) {
        if (err) throw err;
        
        db.close();
        res.send(result)  
      });
    });

});


router.route('/buttongrid/:tabgen').get(function(req, res) {
    var obj = {};
    var result = [];
    var tabgen = req.param('tabgen');
    var code = " function editarProdutoXml(botao) {var idTela='f8af21d6-e280-060a-1d92-0e7948ad107f_'; console.log(botao); var NomeProduto = $('#7ee809e2-fe73-4b0e-b741-198df26a414f_'+$(botao).attr('data-referenceid')).attr('data-newvalue'); $('#' + idTela + 'CoImportarXML_txtNome').val(NomeProduto); $('#' + idTela + 'CoImportarXML_txtProdutoVinculado_autocomplete').attr('data-iddata',$(botao).attr('data-referenceid')); } "
   
    obj["FormID"]="c6bd6c44-6546-4700-954d-e22c61a20979_f8af21d6-e280-060a-1d92-0e7948ad107f"
    obj["classe"]="hidden"
    obj["containerID"]="194536c8-48b0-43de-b464-cb9b5da4683e_f8af21d6-e280-060a-1d92-0e7948ad107f .panel-body #3818d7aa-e57f-40da-bb26-e93a9aaa28bf_controlgroup"
    obj["containerIDScreen"]="194536c8-48b0-43de-b464-cb9b5da4683e_f8af21d6-e280-060a-1d92-0e7948ad107f"
    obj["controlID"]="3818d7aa-e57f-40da-bb26-e93a9aaa28bf"
    obj["controlType"]="BUTTONGRID"
    obj["derivedFrom"]=null
    obj["field"]=null
    obj["fill1PropertyID"]="00000000-0000-0000-0000-000000000000"
    obj["fill2PropertyID"]="00000000-0000-0000-0000-000000000000"
    obj["icon"]=""
    obj["id"]="f8af21d6-e280-060a-1d92-0e7948ad107f_CoImportarXML_chkok"
    obj["layoutID"]="00000000-0000-0000-0000-000000000000"
    obj["layoutName"]="lyImportarXML"
    obj["layoutScreen"]="c6bd6c44-6546-4700-954d-e22c61a20979"
    obj["localAutoComplete"]=false
    obj["mask"]=""
    obj["nameLayout"]=""
    obj["nativeDataType"]=null
    obj["newValue"]=""
    obj["nome"]=""
    obj["onClickName"]="editarProdutoXml"
    obj["ownerFieldTreeView"]=false
    obj["propertyID"]="00000000-0000-0000-0000-000000000000"
    obj["readOnly"]=false
    obj["required"]=false
    obj["scriptEvents"]= code;
    obj["sequenceRecording"]=0
    obj["serializable"]=false
    obj["symbol"]=""
    obj["tabGenID"]="f8af21d6-e280-060a-1d92-0e7948ad107f"
    obj["table"]=null
    obj["tamanho"]="col-md-9"
    obj["tamanhofield"]=""
    obj["tamanholabel"]=""
    obj["template"]="MASTERDETAIL"
    obj["text"]=""
    obj["textList"]=""
    obj["titleMenu"]=""
    obj["titulo"]="Editar"
    obj["tooltip"]="Editar"
    obj["typeOpeningLayout"]=""
    obj["valueList"]=""
    obj["visibleGrid"]=false
    result.push(obj);

//===========================================================================================
obj = {};
code = ""
   
    obj["FormID"]="1df8627a-f0a4-4c50-8a1c-eb6d7d5d04e5_f8af21d6-e280-060a-1d92-0e7948ad107f"
    obj["classe"]="hidden"
    obj["containerID"]="1df8627a-f0a4-4c50-8a1c-eb6d7d5d04e5_f8af21d6-e280-060a-1d92-0e7948ad107f .panel-body #3818d7aa-e57f-40da-bb26-e93a9aaa28bf_controlgroup"
    obj["containerIDScreen"]="1df8627a-f0a4-4c50-8a1c-eb6d7d5d04e5_f8af21d6-e280-060a-1d92-0e7948ad107f"
    obj["controlID"]="3818d7aa-e57f-40da-bb26-e93a9aaa28bf"
    obj["controlType"]="CHECKBOXGRID"
    obj["derivedFrom"]=null
    obj["field"]=null
    obj["fill1PropertyID"]="00000000-0000-0000-0000-000000000000"
    obj["fill2PropertyID"]="00000000-0000-0000-0000-000000000000"
    obj["icon"]=""
    obj["id"]="f8af21d6-e280-060a-1d92-0e7948ad107f_CoGridGerarTitulosArquivoCnab_checkboxGrid"
    obj["layoutID"]="00000000-0000-0000-0000-000000000000"
    obj["layoutName"]="lyImportarXML"
    obj["layoutScreen"]="c6bd6c44-6546-4700-954d-e22c61a20979"
    obj["localAutoComplete"]=false
    obj["mask"]=""
    obj["nameLayout"]=""
    obj["nativeDataType"]=null
    obj["newValue"]=""
    obj["nome"]=""
    obj["onClickName"]="editarProdutoXml"
    obj["ownerFieldTreeView"]=false
    obj["propertyID"]="00000000-0000-0000-0000-000000000000"
    obj["readOnly"]=false
    obj["required"]=false
    obj["scriptEvents"]= code;
    obj["sequenceRecording"]=0
    obj["serializable"]=false
    obj["symbol"]=""
    obj["tabGenID"]="f8af21d6-e280-060a-1d92-0e7948ad107f"
    obj["table"]=null
    obj["tamanho"]="col-md-9"
    obj["tamanhofield"]=""
    obj["tamanholabel"]=""
    obj["template"]="MASTERDETAIL"
    obj["text"]=""
    obj["textList"]=""
    obj["titleMenu"]=""
    obj["titulo"]="Editar"
    obj["tooltip"]="Editar"
    obj["typeOpeningLayout"]=""
    obj["valueList"]=""
    obj["visibleGrid"]=false
    result.push(obj);

    //===============================================================================

    obj = {};
    code = ""
       
        obj["FormID"]="df94b0c8-7fbd-4253-ad4f-fe1adf307889_f8af21d6-e280-060a-1d92-0e7948ad107f"
        obj["classe"]="hidden"
        obj["containerID"]="df94b0c8-7fbd-4253-ad4f-fe1adf307889_f8af21d6-e280-060a-1d92-0e7948ad107f .panel-body #3818d7aa-e57f-40da-bb26-e93a9aaa28bf_controlgroup"
        obj["containerIDScreen"]="df94b0c8-7fbd-4253-ad4f-fe1adf307889_f8af21d6-e280-060a-1d92-0e7948ad107f"
        obj["controlID"]="3818d7aa-e57f-40da-bb26-e93a9aaa28bf"
        obj["controlType"]="CHECKBOXGRID"
        obj["derivedFrom"]=null
        obj["field"]=null
        obj["fill1PropertyID"]="00000000-0000-0000-0000-000000000000"
        obj["fill2PropertyID"]="00000000-0000-0000-0000-000000000000"
        obj["icon"]=""
        obj["id"]="f8af21d6-e280-060a-1d92-0e7948ad107f_CoGridGerarTitulosArquivoCnab_checkboxGrid"
        obj["layoutID"]="00000000-0000-0000-0000-000000000000"
        obj["layoutName"]="lyImportarXML"
        obj["layoutScreen"]="c6bd6c44-6546-4700-954d-e22c61a20979"
        obj["localAutoComplete"]=false
        obj["mask"]=""
        obj["nameLayout"]=""
        obj["nativeDataType"]=null
        obj["newValue"]=""
        obj["nome"]=""
        obj["onClickName"]="editarProdutoXml"
        obj["ownerFieldTreeView"]=false
        obj["propertyID"]="00000000-0000-0000-0000-000000000000"
        obj["readOnly"]=false
        obj["required"]=false
        obj["scriptEvents"]= code;
        obj["sequenceRecording"]=0
        obj["serializable"]=false
        obj["symbol"]=""
        obj["tabGenID"]="f8af21d6-e280-060a-1d92-0e7948ad107f"
        obj["table"]=null
        obj["tamanho"]="col-md-9"
        obj["tamanhofield"]=""
        obj["tamanholabel"]=""
        obj["template"]="MASTERDETAIL"
        obj["text"]=""
        obj["textList"]=""
        obj["titleMenu"]=""
        obj["titulo"]="Editar"
        obj["tooltip"]="Editar"
        obj["typeOpeningLayout"]=""
        obj["valueList"]=""
        obj["visibleGrid"]=false
        result.push(obj);
    
        //===============================================================================
    

obj = {};
code = ""
   
    obj["FormID"]="e350e395-0e70-4bd1-84dd-af8db72152f7_f8af21d6-e280-060a-1d92-0e7948ad107f"
    obj["classe"]="hidden"
    obj["containerID"]="e350e395-0e70-4bd1-84dd-af8db72152f7_f8af21d6-e280-060a-1d92-0e7948ad107f .panel-body #3818d7aa-e57f-40da-bb26-e93a9aaa28bf_controlgroup"
    obj["containerIDScreen"]="e350e395-0e70-4bd1-84dd-af8db72152f7_f8af21d6-e280-060a-1d92-0e7948ad107f"
    obj["controlID"]="3818d7aa-e57f-40da-bb26-e93a9aaa28bf"
    obj["controlType"]=""
    obj["derivedFrom"]=null
    obj["field"]=null
    obj["fill1PropertyID"]="00000000-0000-0000-0000-000000000000"
    obj["fill2PropertyID"]="00000000-0000-0000-0000-000000000000"
    obj["icon"]=""
    obj["id"]="f8af21d6-e280-060a-1d92-0e7948ad107f_CoGridGerarTitulosArquivoCnab_checkboxGrid"
    obj["layoutID"]="00000000-0000-0000-0000-000000000000"
    obj["layoutName"]="lyImportarXML"
    obj["layoutScreen"]="c6bd6c44-6546-4700-954d-e22c61a20979"
    obj["localAutoComplete"]=false
    obj["mask"]=""
    obj["nameLayout"]=""
    obj["nativeDataType"]=null
    obj["newValue"]=""
    obj["nome"]=""
    obj["onClickName"]="editarProdutoXml"
    obj["ownerFieldTreeView"]=false
    obj["propertyID"]="00000000-0000-0000-0000-000000000000"
    obj["readOnly"]=false
    obj["required"]=false
    obj["scriptEvents"]= code;
    obj["sequenceRecording"]=0
    obj["serializable"]=false
    obj["symbol"]=""
    obj["tabGenID"]="f8af21d6-e280-060a-1d92-0e7948ad107f"
    obj["table"]=null
    obj["tamanho"]="col-md-9"
    obj["tamanhofield"]=""
    obj["tamanholabel"]=""
    obj["template"]="MASTERDETAIL"
    obj["text"]=""
    obj["textList"]=""
    obj["titleMenu"]=""
    obj["titulo"]="Editar"
    obj["tooltip"]="Editar"
    obj["typeOpeningLayout"]=""
    obj["valueList"]=""
    obj["visibleGrid"]=false
    result.push(obj);

    //===============================================================================
    

    obj = {};
    code = ""
   
    obj["FormID"]="6c0c5f73-2339-435b-ab8e-edef71daea37_f8af21d6-e280-060a-1d92-0e7948ad107f"
    obj["classe"]="hidden"
    obj["containerID"]="6c0c5f73-2339-435b-ab8e-edef71daea37_f8af21d6-e280-060a-1d92-0e7948ad107f .panel-body #3818d7aa-e57f-40da-bb26-e93a9aaa28bf_controlgroup"
    obj["containerIDScreen"]="6c0c5f73-2339-435b-ab8e-edef71daea37_f8af21d6-e280-060a-1d92-0e7948ad107f"
    obj["controlID"]="3818d7aa-e57f-40da-bb26-e93a9aaa28bf"
    obj["controlType"]=""
    obj["derivedFrom"]=null
    obj["field"]=null
    obj["fill1PropertyID"]="00000000-0000-0000-0000-000000000000"
    obj["fill2PropertyID"]="00000000-0000-0000-0000-000000000000"
    obj["icon"]=""
    obj["id"]="f8af21d6-e280-060a-1d92-0e7948ad107f_CoGridGerarTitulosArquivoCnab_checkboxGrid"
    obj["layoutID"]="00000000-0000-0000-0000-000000000000"
    obj["layoutName"]="lyImportarXML"
    obj["layoutScreen"]="c6bd6c44-6546-4700-954d-e22c61a20979"
    obj["localAutoComplete"]=false
    obj["mask"]=""
    obj["nameLayout"]=""
    obj["nativeDataType"]=null
    obj["newValue"]=""
    obj["nome"]=""
    obj["onClickName"]="editarProdutoXml"
    obj["ownerFieldTreeView"]=false
    obj["propertyID"]="00000000-0000-0000-0000-000000000000"
    obj["readOnly"]=false
    obj["required"]=false
    obj["scriptEvents"]= code;
    obj["sequenceRecording"]=0
    obj["serializable"]=false
    obj["symbol"]=""
    obj["tabGenID"]="f8af21d6-e280-060a-1d92-0e7948ad107f"
    obj["table"]=null
    obj["tamanho"]="col-md-9"
    obj["tamanhofield"]=""
    obj["tamanholabel"]=""
    obj["template"]="MASTERDETAIL"
    obj["text"]=""
    obj["textList"]=""
    obj["titleMenu"]=""
    obj["titulo"]="Editar"
    obj["tooltip"]="Editar"
    obj["typeOpeningLayout"]=""
    obj["valueList"]=""
    obj["visibleGrid"]=false
    result.push(obj);

    //===============================================================================
    

    obj = {};
    code = ""
   
    obj["FormID"]="90c96f99-9879-4752-83ca-febf573c0a1d_f8af21d6-e280-060a-1d92-0e7948ad107f"
    obj["classe"]="hidden"
    obj["containerID"]="90c96f99-9879-4752-83ca-febf573c0a1d_f8af21d6-e280-060a-1d92-0e7948ad107f .panel-body #3818d7aa-e57f-40da-bb26-e93a9aaa28bf_controlgroup"
    obj["containerIDScreen"]="90c96f99-9879-4752-83ca-febf573c0a1d_f8af21d6-e280-060a-1d92-0e7948ad107f"
    obj["controlID"]="3818d7aa-e57f-40da-bb26-e93a9aaa28bf"
    obj["controlType"]=""
    obj["derivedFrom"]=null
    obj["field"]=null
    obj["fill1PropertyID"]="00000000-0000-0000-0000-000000000000"
    obj["fill2PropertyID"]="00000000-0000-0000-0000-000000000000"
    obj["icon"]=""
    obj["id"]="f8af21d6-e280-060a-1d92-0e7948ad107f_CoGridGerarTitulosArquivoCnab_checkboxGrid"
    obj["layoutID"]="00000000-0000-0000-0000-000000000000"
    obj["layoutName"]="lyImportarXML"
    obj["layoutScreen"]="c6bd6c44-6546-4700-954d-e22c61a20979"
    obj["localAutoComplete"]=false
    obj["mask"]=""
    obj["nameLayout"]=""
    obj["nativeDataType"]=null
    obj["newValue"]=""
    obj["nome"]=""
    obj["onClickName"]="editarProdutoXml"
    obj["ownerFieldTreeView"]=false
    obj["propertyID"]="00000000-0000-0000-0000-000000000000"
    obj["readOnly"]=false
    obj["required"]=false
    obj["scriptEvents"]= code;
    obj["sequenceRecording"]=0
    obj["serializable"]=false
    obj["symbol"]=""
    obj["tabGenID"]="f8af21d6-e280-060a-1d92-0e7948ad107f"
    obj["table"]=null
    obj["tamanho"]="col-md-9"
    obj["tamanhofield"]=""
    obj["tamanholabel"]=""
    obj["template"]="MASTERDETAIL"
    obj["text"]=""
    obj["textList"]=""
    obj["titleMenu"]=""
    obj["titulo"]="Editar"
    obj["tooltip"]="Editar"
    obj["typeOpeningLayout"]=""
    obj["valueList"]=""
    obj["visibleGrid"]=false
    result.push(obj);

    //===============================================================================
    

    obj = {};
    code = ""
   
    obj["FormID"]="69851ed9-00ab-4add-9efd-ae9ce00e5df3_f8af21d6-e280-060a-1d92-0e7948ad107f"
    obj["classe"]="hidden"
    obj["containerID"]="69851ed9-00ab-4add-9efd-ae9ce00e5df3_f8af21d6-e280-060a-1d92-0e7948ad107f .panel-body #3818d7aa-e57f-40da-bb26-e93a9aaa28bf_controlgroup"
    obj["containerIDScreen"]="69851ed9-00ab-4add-9efd-ae9ce00e5df3_f8af21d6-e280-060a-1d92-0e7948ad107f"
    obj["controlID"]="3818d7aa-e57f-40da-bb26-e93a9aaa28bf"
    obj["controlType"]=""
    obj["derivedFrom"]=null
    obj["field"]=null
    obj["fill1PropertyID"]="00000000-0000-0000-0000-000000000000"
    obj["fill2PropertyID"]="00000000-0000-0000-0000-000000000000"
    obj["icon"]=""
    obj["id"]="f8af21d6-e280-060a-1d92-0e7948ad107f_checkboxGrid"
    obj["layoutID"]="00000000-0000-0000-0000-000000000000"
    obj["layoutName"]="lyImportarXML"
    obj["layoutScreen"]="c6bd6c44-6546-4700-954d-e22c61a20979"
    obj["localAutoComplete"]=false
    obj["mask"]=""
    obj["nameLayout"]=""
    obj["nativeDataType"]=null
    obj["newValue"]=""
    obj["nome"]=""
    obj["onClickName"]="editarProdutoXml"
    obj["ownerFieldTreeView"]=false
    obj["propertyID"]="00000000-0000-0000-0000-000000000000"
    obj["readOnly"]=false
    obj["required"]=false
    obj["scriptEvents"]= code;
    obj["sequenceRecording"]=0
    obj["serializable"]=false
    obj["symbol"]=""
    obj["tabGenID"]="f8af21d6-e280-060a-1d92-0e7948ad107f"
    obj["table"]=null
    obj["tamanho"]="col-md-9"
    obj["tamanhofield"]=""
    obj["tamanholabel"]=""
    obj["template"]="MASTERDETAIL"
    obj["text"]=""
    obj["textList"]=""
    obj["titleMenu"]=""
    obj["titulo"]="Editar"
    obj["tooltip"]="Editar"
    obj["typeOpeningLayout"]=""
    obj["valueList"]=""
    obj["visibleGrid"]=false
    result.push(obj);

    //===============================================================================
    

    obj = {};
    code = ""
   
    obj["FormID"]="e1b4201f-5e01-47da-bc6b-c18828f2f990_f8af21d6-e280-060a-1d92-0e7948ad107f"
    obj["classe"]="hidden"
    obj["containerID"]="e1b4201f-5e01-47da-bc6b-c18828f2f990_f8af21d6-e280-060a-1d92-0e7948ad107f .panel-body #3818d7aa-e57f-40da-bb26-e93a9aaa28bf_controlgroup"
    obj["containerIDScreen"]="e1b4201f-5e01-47da-bc6b-c18828f2f990_f8af21d6-e280-060a-1d92-0e7948ad107f"
    obj["controlID"]="3818d7aa-e57f-40da-bb26-e93a9aaa28bf"
    obj["controlType"]=""
    obj["derivedFrom"]=null
    obj["field"]=null
    obj["fill1PropertyID"]="00000000-0000-0000-0000-000000000000"
    obj["fill2PropertyID"]="00000000-0000-0000-0000-000000000000"
    obj["icon"]=""
    obj["id"]="f8af21d6-e280-060a-1d92-0e7948ad107f_CoGridGerarTitulosArquivoCnab_checkboxGrid"
    obj["layoutID"]="00000000-0000-0000-0000-000000000000"
    obj["layoutName"]="lyImportarXML"
    obj["layoutScreen"]="c6bd6c44-6546-4700-954d-e22c61a20979"
    obj["localAutoComplete"]=false
    obj["mask"]=""
    obj["nameLayout"]=""
    obj["nativeDataType"]=null
    obj["newValue"]=""
    obj["nome"]=""
    obj["onClickName"]="editarProdutoXml"
    obj["ownerFieldTreeView"]=false
    obj["propertyID"]="00000000-0000-0000-0000-000000000000"
    obj["readOnly"]=false
    obj["required"]=false
    obj["scriptEvents"]= code;
    obj["sequenceRecording"]=0
    obj["serializable"]=false
    obj["symbol"]=""
    obj["tabGenID"]="f8af21d6-e280-060a-1d92-0e7948ad107f"
    obj["table"]=null
    obj["tamanho"]="col-md-9"
    obj["tamanhofield"]=""
    obj["tamanholabel"]=""
    obj["template"]="MASTERDETAIL"
    obj["text"]=""
    obj["textList"]=""
    obj["titleMenu"]=""
    obj["titulo"]="Editar"
    obj["tooltip"]="Editar"
    obj["typeOpeningLayout"]=""
    obj["valueList"]=""
    obj["visibleGrid"]=false
    result.push(obj);

    res.send(result);
});



router.route('/listreport/:id').get(function(req, res) {
    var MongoClient = require('mongodb').MongoClient;
    //var url = "mongodb://localhost:27017/erpcloud";
    var id = req.param('id');
    id = id.toUpperCase();

    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      db.collection("reports").find({"containerID": id}, { _id: false }).toArray(function(err, result) {
        if (err) throw err;
        
        db.close();
        res.send(result)  
      });
    });

});

function userPermission(type, layoutID, userID, callback){
    var sqlAdmin = "SELECT sn_usuarioadministrador ";
    sqlAdmin += " FROM usuarios WHERE id = '" + userID + "' AND sn_usuarioadministrador=0";

    sql.close()

    sql.connect(config, function (err) {    
        if (err) console.log(err);

        var requestAdmin = new sql.Request();
        requestAdmin.query(sqlAdmin, function (err, recordset) {            
            if (err) console.log(err)    
            if (recordset) {
                if (recordset.recordset.length > 0) {


                    var sqlstring = "SELECT sn_incluir as 'incluir', sn_alterar as 'alterar', sn_consultar as 'consultar', sn_excluir as 'excluir' ";
                    sqlstring += " FROM usuarios_permissoes WHERE id_usuario = '" + userID + "' AND baseObjectID='" + layoutID + "'";
                    var retorno = false;
                    sql.close()
                    sql.connect(config, function (err) {    
                        if (err) console.log(err);

                        var request = new sql.Request();    
                        
                        request.query(sqlstring, function (err, recordset) {            
                            if (err) console.log(err)    
                            if (recordset) {
                                if (recordset.recordset.length > 0) {     
                                    console.log(recordset.recordset[0]);               
                                    switch(type) {
                                        case "incluir":
                                            if(recordset.recordset[0].incluir == true){
                                                retorno = true;
                                            }
                                            break;
                                        case "alterar":
                                            if(recordset.recordset[0].alterar == true){
                                                retorno = true;
                                            }
                                            break;
                                        case "consultar":
                                            if(recordset.recordset[0].consultar == true){
                                                retorno = true;
                                            }
                                            break;
                                        case "excluir":
                                            if(recordset.recordset[0].excluir == true){
                                                retorno = true;
                                            }
                                            break;
                                        default:
                                            break;
                                    }
                                }
                            }    
                            callback(retorno);            
                        });
                    }); 
                }else{
                    callback(true); 
                }
            }else{
                callback(true); 
            }
        })
    })

}

router.route('/testefunction').get(function(req, res) {
    var _eval = require('eval')

    var ret = _eval('module.exports = function () {var ret = 0; for(var i=0;i<3;i++){ ret += i; }  return ret }')
    console.log(ret());
        
    res.send(ret)    
});

router.route('/menucustom/:idusuario').get(function(req, res) {
    var MongoClient = require('mongodb').MongoClient;
    var idusuario = req.param('idusuario');
    idusuario = idusuario.toUpperCase();

    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      db.collection("menus").find({id: 4}, { _id: false }).toArray(function(err, result) {
        if (err) throw err;

        const cheerio = require('cheerio')
        const $ = cheerio.load(result[0].html)
        

        var sqlAdmin = "SELECT sn_usuarioadministrador ";
        sqlAdmin += " FROM usuarios WHERE id = '" + idusuario + "' AND sn_usuarioadministrador=0";

        sql.close()

        sql.connect(config, function (err) {    
            if (err) console.log(err);

            var requestAdmin = new sql.Request();
            requestAdmin.query(sqlAdmin, function (err, recordset) {            
                if (err) console.log(err)    
                if (recordset) {
                    if (recordset.recordset.length > 0) {

                        var sqlstring = "SELECT baseObjectID , sn_alterar, sn_consultar, sn_excluir, sn_incluir ";
                        sqlstring += " FROM usuarios_permissoes WHERE id_usuario = '" + idusuario + "' AND (sn_alterar=1 OR sn_consultar=1 OR sn_excluir=1 OR sn_incluir=1) ";
                      
                        sql.close()

                        sql.connect(config, function (err) {    
                            if (err) console.log(err);

                            var request = new sql.Request();
                            request.query(sqlstring, function (err, recordset) {            
                                if (err) console.log(err)    

                                if (recordset) {
                                    if (recordset.recordset.length > 0) {
                                        var menuAdmin = $("[data-menuname='Administrador']")
                                        if(menuAdmin.length > 0){
                                            $(menuAdmin[0]).remove();
                                        }
                                        var menu = $("li[id]");
                                        for (let j = 0; j < menu.length; j++) {
                                            var itemmenu = 0;
                                            var itemHTML = $(menu[j]).attr("id").toLowerCase()
                                            for (let i = 0; i < recordset.recordset.length; i++) {
                                                var itemBD = recordset.recordset[i].baseObjectID.toLowerCase();

                                                if(itemBD==itemHTML){
                                                    itemmenu = i;
                                                    break;
                                                }
                                            } 
                                            if(itemHTML == "d82d11c8-ea16-47c7-be04-10423467f04e"){
                                                console.log(itemHTML)
                                                console.log(itemmenu)
                                            }
                                            if(itemmenu == 0){
                                                $("#" + itemHTML).remove()                                
                                            }
                                        }                
                                    }
                                }
                        
                                result[0].html = $.html();

                                db.close();
                                res.send(result)             
                            });
                        }); 

                    }else{
                        db.close();
                        res.send(result)  
                    }
                }
            })
        })
      });
    });

});
    
module.exports = database