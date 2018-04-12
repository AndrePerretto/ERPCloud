const _ = require('lodash')
const database = require('./database')
const server = require('../config/server')
const express = require('express')
const dados = require('./connections')
var sql = require("mssql");
const general = require('./general')
const ObjectID = require('mongodb').ObjectID
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

var EnterpriseID = "";
var UserID = "";

router.route('/*').get(function(req, res, next) {
    var full = req.host; //"http://homologa.empresarioerpcloud.com.br"; //
    
    var parts = full.split('.');
    var dados = "";
    if (parts.length > 3) {
        dados = parts[0];
    }
    dados = dados.replace("http://","");

    if(full.indexOf("localhost") > -1){
        serverWindows = "http://localhost:2444";
        dados = "homologa";
        configEnvironment = {user: 'sa', password: '1234567890', server: '127.0.0.1',  database: 'Environment'};
    }else{
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
                next();
            }
        });
    });    
});

var http = require('http');
//var jsreport = require('jsreport');
var jsreport = require('jsreport-core')()

router.route('/report/:nome').get(function(req, res) {
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/erpcloud";
        
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
                
                jsreport.init().then(function () {     
                    return jsreport.render({
                        template: {
                            content: html,
                            engine: 'jsrender', //'handlebars', 'jsrender',
                            recipe: 'phantom-pdf' //'xlsx' 'phantom-pdf'
                         },
                         data:  recordset.recordset
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
    var url = "mongodb://localhost:27017/erpcloud";
        
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
                res.send(recordset.recordset)            
            });
        }); 
        });
    });
})

router.route('/listall/:id').get(function(req, res) {
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/erpcloud";
    var id = req.param('id');
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

                console.log(select);
                // send records as a response
                res.send(recordset)            
            });
        });    

      });
    });

    

});

router.route('/findid/:id').get(function(req, res) {
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/erpcloud";
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
    var url = "mongodb://localhost:27017/erpcloud";
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
    var url = "mongodb://localhost:27017/erpcloud";
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
            
                        delete submit[ind]['EnterpriseID'];
                        delete submit[ind]['UserID'];
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
                        
                        insertOrUpdate = createInsert(submit, ind, guid)
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
                            if (submit.length == countfor) {
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
                        })
                    }
                }else{
                    if (countfor > 0) {
                        retorno += ",";
                    }
                    countfor +=1;
                    if (submit.length == countfor) { 
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
            if (submit.length == countfor) {
                retorno += "]"
                var obj = JSON.parse(retorno)
                res.send(obj)
            }
        }
    }); 
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
    //callWebAPI(arraySubmitObject,   serverWindows + "/api/DataBase/BeforeSave", function(retorno){
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

function createInsert(submit, index, guid){
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
    var url = "mongodb://localhost:27017/erpcloud";
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

router.route('/DeleteData/:containerID/:id').get(function(req, res) {
    var id = req.param('id');
    var containerID = req.param('containerID');

    containerID = containerID.toUpperCase();
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/erpcloud";

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

});


router.route('/containergrid/:id/:filtro').get(function(req, res) {
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/erpcloud";
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
    var url = "mongodb://localhost:27017/erpcloud";
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

    
module.exports = database






