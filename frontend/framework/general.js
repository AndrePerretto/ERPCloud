function returnCookie(key) {
    var valueKey = localStorage.getItem(key);
    return valueKey ? valueKey : null;
}

function createCookie(strCookie, strValor, lngDias) {
    var dtmData = new Date();

    if (lngDias) {
        dtmData.setTime(dtmData.getTime() + (lngDias * 24 * 60 * 60 * 1000));
        var strExpires = "; expires=" + dtmData.toGMTString();
    }
    else {
        var strExpires = "";
    }

    document.cookie = strCookie + "=" + strValor + strExpires + "; path=/";

    localStorage.setItem(strCookie, strValor);
}


function replaceAll(str, needle, replacement) {
    
    var teste = $.find("#" + needle);
    str = str.split(needle).join(replacement)
    return str;
}

function isDirty(containerid) {
    var dirty = false;

    var lstfrm = $("#" + containerid);

    if (lstfrm.length > 0) {
        var frm = lstfrm[0];
        frm = $(frm).find("input");
        var frm2 = $(lstfrm[0]).find("select");

        for (var i = 0; i < frm2.length; i++) {
            frm.push(frm2[i]);
        }

        for (i = 0; i < frm.length; i++) {
            if ($(frm[i]).attr("data-oldvalue") != undefined) {
                if ($(frm[i]).attr("type") == "checkbox") {
                    $(frm[i]).val(frm[i].checked.toString());
                    $(frm[i]).attr("data-oldvalue", $(frm[i]).attr("data-oldvalue").toLowerCase());
                }

                var valor = $(frm[i]).val();

                if (valor == null || valor == "null" || valor == "undefined") {
                    valor = "";
                }

                if ($(frm[i]).attr("data-oldvalue") == null || $(frm[i]).attr("data-oldvalue") == "null" || ($(frm[i]).attr("data-oldvalue") == "00000000-0000-0000-0000-000000000000") && valor == "") {
                    $(frm[i]).attr("data-oldvalue", "")
                }

                if (valor == "" && $(frm[i]).attr("data-oldvalue") == "00000000-0000-0000-0000-000000000000") {
                    valor = "00000000-0000-0000-0000-000000000000";
                }

                if ($(frm[i]).attr("data-nativedatatype")) {
                    if ($(frm[i]).attr("data-nativedatatype").toUpperCase() == "MOEDA" || $(frm[i]).attr("data-nativedatatype").toUpperCase() == "QUANTIDADE" || $(frm[i]).attr("data-nativedatatype").toUpperCase() == "PERCENT") {
                        if (valor == "" || valor == null || valor == undefined) {
                            valor = "0";
                        }


                        if (!$(frm[i]).attr("data-oldvalue")) {
                            $(frm[i]).attr("data-oldvalue", "0");
                        }

                        var valuecurrency = parseFloat(valor);
                        var oldvaluecurrency = parseFloat($(frm[i]).attr("data-oldvalue"));

                        valor = valuecurrency.toString();

                        $(frm[i]).attr("data-oldvalue", oldvaluecurrency.toString())


                    }

                    if ($(frm[i]).attr("data-nativedatatype").toUpperCase() == "SIMNAO") {
                        if (valor == "false" && $(frm[i]).attr("data-oldvalue") == "0") {
                            $(frm[i]).attr("data-oldvalue", "false");
                        }
                        if (valor == "true" && $(frm[i]).attr("data-oldvalue") == "1") {
                            $(frm[i]).attr("data-oldvalue", "true");
                        }
                    }
                }

                if (frm[i].type == "select-one" && $(frm[i]).attr("data-oldvalue") == "0") {
                    $(frm[i]).attr("data-oldvalue", "")
                }

                var isValid = true;

                if (frm[i].type == "hidden" && ($(frm[i]).attr("data-derivedfrom") != null || $(frm[i]).attr("data-derivedfrom") != "" || $(frm[i]).attr("data-derivedfrom") != undefined)) {
                    var autocomplete = $("#" + frm[i].id + "_autocomplete");
                    if (!autocomplete.length > 0) {
                        isValid = false;
                    }
                }

                if (valor != $(frm[i]).attr("data-oldvalue")) {
                    if ($(frm[i]).attr("data-serializable") == "true") {
                        if (isValid) {
                            dirty = true;
                        }
                    }
                }
            }
        }
    }

    return dirty;
}


function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getUTCMonth() + 1),
        day = '' + (d.getUTCDate()),
        year = d.getUTCFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [day, month, year].join('/');
}


function getGlobalParameters(parametro) {
    
        var global = new Object();
    
        global.urlPlataform = "http://"+ window.location.hostname +":3002"
        global.urlSearch = "http://" + window.location.host + ":8983"
        
        var full = window.location.host;
        var parts = full.split('.');
        if (parts.length > 3) {
            dados = parts[0];
            global.urlPlataforma = "http://" + dados + ".empresariocloud.com.br"
            global.urlInterface = "http://" + dados + ".empresariocloud.com.br"
        }else {
            global.urlPlataforma = "http://localhost:2444"
            global.urlInterface = "http://localhost:2444"
        }
            
        if (parametro) {
            return global[parametro]
        }
        else {
            return global
        }
    
    }


    function jsonp(data) {
        console.log('jsonp was called');
      }
      
      
    
function AjaxParameter(parameters) {
    var retorno = false;
    var dataType = "json"; //(parameters.dataType) ? parameters.dataType : "json";
    var type = (parameters.type) ? parameters.type : "";
    var url = (parameters.url) ? parameters.url : "";
    var dados = (parameters.dados) ? parameters.dados : "";
    var callback = (parameters.callback) ? parameters.callback : "";
    var async = (parameters.async) ? parameters.async : false;
   var contentType = "application/json; charset=utf-8";
   //url = "http://localhost:3001/api/teste"
     $.ajax({
        
                url: url,
                type: "GET",
                crossDomain: true,
                cors: true,
                headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: dados,
                async: async,
                callback: 'jsonp',
                jsonpCallback: 'jsonp',
                success: function (result) {
                    resultadoParametroExterno = result;
                    if (result) {
                        retorno =  JSON.stringify(result);
                        retorno =  JSON.parse(retorno);
                        if (result.length > 0) {
                            if (result[0].message != null) {
                                //if (result[0].message.indexOf("sucesso") != -1) {
                                if (result[0].message[0].success) {
                                    if (callback) {
                                        callback(result);
                                        retorno = JSON.stringify(result);
                                        retorno =  JSON.parse(retorno);
                                    }
                                    notification({ messageTitle: result[0].message[0].title[0].text, messageText: result[0].message[0].title[0].toolTip, fix: false, type: "ok", icon: "thumbs-up" });
                                    //alert(result[0].message);
                                }
                                else {
                                    notification({ messageTitle: result[0].message[0].title[0].text, messageText: result[0].message[0].title[0].toolTip, fix: false, type: "warning", icon: "thumbs-down" });
                                    //alert(result[0].message);
                                }
                            }
                        }
                    }
                },
        
            });
/*
   $.ajax({
        type: type,
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8'
        },
        url: url,
        dataType: dataType,
        //contentType: 'application/json; charset=utf-8',
        cors: true,
        //contentType: contentType,
        async: async,
        crossDomain: true,
        data: dados,
        success: function (result) {
            resultadoParametroExterno = result;
            if (result) {
                retorno = result;
                if (result.length > 0) {
                    if (result[0].message != null) {
                        //if (result[0].message.indexOf("sucesso") != -1) {
                        if (result[0].message[0].success) {
                            if (callback) {
                                callback(result);
                                retorno = result;
                            }
                            notification({ messageTitle: result[0].message[0].title[0].text, messageText: result[0].message[0].title[0].toolTip, fix: false, type: "ok", icon: "thumbs-up" });
                            //alert(result[0].message);
                        }
                        else {
                            notification({ messageTitle: result[0].message[0].title[0].text, messageText: result[0].message[0].title[0].toolTip, fix: false, type: "warning", icon: "thumbs-down" });
                            //alert(result[0].message);
                        }
                    }
                }
            }
        },
        error: function (result) {
            notification({ messageText: "Falha na comunicação com o servidor", messageTitle: "Desculpe!", fix: false, type: "warning", icon: "thumbs-down" });
        }

    });
*/
    var tipo;
    var mensagem;

    //if (resultadoParametroExterno != null) {
    //    if (resultadoParametroExterno.length > 0) {
    //        retorno = resultadoParametroExterno;
    //        if (resultadoParametroExterno[0].Message) {
    //            if (resultadoParametroExterno[0].Message != null) {
    //                tipo = resultadoParametroExterno[0].Message[0].Type;
    //                mensagem = resultadoParametroExterno[0].Message[0].Title[0].text;
    //                Alerta(tipo, mensagem);
    //            }
    //        }
    //    }
    //}

    return retorno;
}


function jsonpCallback(result) {
    resultadoParametroExterno = result;
    if (result) {
        retorno = result;
        if (result.length > 0) {
            if (result[0].message != null) {
                //if (result[0].message.indexOf("sucesso") != -1) {
                if (result[0].message[0].success) {
                    if (callback) {
                        callback(result);
                        retorno = result;
                    }
                    notification({ messageTitle: result[0].message[0].title[0].text, messageText: result[0].message[0].title[0].toolTip, fix: false, type: "ok", icon: "thumbs-up" });
                    //alert(result[0].message);
                }
                else {
                    notification({ messageTitle: result[0].message[0].title[0].text, messageText: result[0].message[0].title[0].toolTip, fix: false, type: "warning", icon: "thumbs-down" });
                    //alert(result[0].message);
                }
            }
        }
    }
  };


  
function ClearForm(formId, clearTable) {
    
        var form = document.getElementById(formId);
    
        if ($(form).hasClass("principalContainer")) {
            form = $(form).parents("form")
            form = form[0]
            clearTable = true
        }
    
        if (form) {
            //var elements = form.getElementsByTagName("input");
            var elements = form.querySelectorAll('input,select,table,textarea,password,checkbox,select-multi,select-one');
    
            for (i = 0; i < elements.length; i++) {
                field_type = elements[i].type;
                var derivedFrom = elements[i].getAttribute("data-derivedFrom");
    
                if (derivedFrom == "null" || elements[i].classList.contains("autocomplete") || $(elements[i]).attr("localautocomplete") != undefined) {
                    switch (field_type) {
                        case "hidden":
                            elements[i].value = "";
                            break;
                        case "text":
                            if (elements[i].getAttribute("data-nativeDataType") == "Data") {
                                elements[i].value = $(elements[i]).attr("data-oldvalue");
    
                                //var today = new Date();
                                //var dd = today.getDate();
                                //var mm = today.getMonth() + 1; //January is 0!
                                //var yyyy = today.getFullYear();
    
                                //if (dd < 10) {
                                //    dd = '0' + dd
                                //}
    
                                //if (mm < 10) {
                                //    mm = '0' + mm
                                //}
    
                                //today = dd + '/' + mm + '/' + yyyy;
                                //elements[i].value = today;
                            }
                            else if (elements[i].getAttribute("data-nativeDataType") == "Moeda" || elements[i].getAttribute("data-nativeDataType") == "Quantidade") {
                                elements[i].value = 0;
                            }
                            else {
                                elements[i].value = "";
                            }
                            break;
                        case "password":
                            elements[i].value = "";
                            break;
                        case "textarea":
                            elements[i].value = "";
                            break;
                            //case "radio":
                        case "number":
                            elements[i].value = 0;
                            break;
                        case "email":
                            elements[i].value = "";
                        case "file":
                            var input = $(elements[i]);
                            var propertyID = $(elements[i]).attr("data-propertyid");
                            input.replaceWith(input.val('').clone(true));
                            $(elements).find("input[data-propertyid=" + propertyID + "]").val("")
                            break;
                        default:
                            break;
                    }
                }
    
                switch (field_type) {
                    case "checkbox":
                        //if (elements[i].checked) {
                        $("#" + elements[i].id).iCheck('uncheck');
                        //}
                        break;
                    case "select-one":
                        elements[i].selectedIndex = 0;
                        break;
                    case "select-multi":
                        elements[i].selectedIndex = 0;
                        break;
                    default:
                        break;
                }

                if (elements[i].value == "undefined" || elements[i].value == undefined) {
                    elements[i].value = ""
                }
            }
    
            var thisTable = $("#" + formId + "_table")
            if (thisTable.length == 0) {
                thisTable = $("<table></table>");
                thisTable.id = ""
            }
    
            thisTable.find("tr.selected").removeClass("selected")
    
            if (clearTable == true) {
                var tables = form.querySelectorAll('table');
    
                for (var i = 0; i < tables.length; i++) {
                    var table = tables[i];
                    if (thisTable) {
                        if (thisTable.length > 0) {
                            thisTable = thisTable[0]
                        }
                    }
                    if ($(table).parents(".tableContainer").id != thisTable.id) {
                        var derivedFrom = table.getAttribute("data-derivedFrom");
                        if (!derivedFrom) {
                            table = (table.tBodies[0]) ? table.tBodies[0] : table;
                            var rowCount = table.rows.length;
    
                            if (rowCount > 0) {
                                for (var j = rowCount; j >= 0; j--) {
                                    var row = table.rows[0];
                                    if (typeof row != 'undefined') {
                                        if(!$(table).parents().hasClass("jsgrid-table")){
                                            table.deleteRow(0);
                                        }
                                    }
                                }

                                if($(table).parents().hasClass("jsgrid-table")){
                                    var source = [];
                                    gridedit($(table).parents("table[id]").attr("id"), source, true);
                                }
                            }
                        }
                    }
    
                }
            }
    
            $(form).formValidation('resetForm', true);
        }
    }
    


    

function loaderImage(id, on) {
    container = $("#" + id)
    if (on) {
        container.prepend("<div class=\"loadingBox\"></div>");
        //$("#" + id).loader();
    }
    else {
        container.find(".loadingBox").remove();
        container.find(".loader").remove();
    }
  }

  
function AjaxQuery(parameters) {
    var retorno = false;
    var dataType = (parameters.dataType) ? parameters.dataType : "json";
    var type = (parameters.type) ? parameters.type : "";
    var url = (parameters.url) ? parameters.url : "";
    var dados = (parameters.dados) ? parameters.dados : "";
    var callbackSuccess = (parameters.callbackSuccess) ? parameters.callbackSuccess : "";
    var callbackError = (parameters.callbackError) ? parameters.callbackError : "";
    var callbackComplete = (parameters.callbackComplete) ? parameters.callbackComplete : "";
    var callBefore = (parameters.callBefore) ? parameters.callBefore : "";
    var async = (parameters.async) ? parameters.async : false;
    var contentType = (parameters.type == "POST") ? "application/json; charset=utf-8" : "";
    var dataReturn;
  
    $.ajax({
        //headers: {
        //'Accept': 'application/json',
        //'Content-Type': 'text/plain; charset=utf-8'
        //},
        type: type,
        url: url,
        dataType: dataType,
        contentType: contentType,
        async: async,
        crossDomain: true,
        data: dados,
        beforeSend: function (result) {
            if (callBefore) {
                callBefore(result);
            }
        },
        success: function (result) {
            if (callbackSuccess) {
                callbackSuccess(result);
            }
        },
        error: function (result) {
            if (callbackError) {
                callbackError(result);
            }
        },
        complete: function (result) {
            if (callbackComplete) {
                callbackComplete(result);
            }
            dataReturn = result
        }
    });
    //console.log(dataReturn)
    return dataReturn
  }

  function getObjMessageJS(numero){
    return "";
  }

  function confirm(message, callback, callbackfalse) {
    
    swal({
        title: message,
        text: "",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#07960e",
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
        closeOnConfirm: true,
        closeOnCancel: true
    },
    function (isConfirm) {
        if (isConfirm) {
            //swal("OK!", "Operação realizada com sucesso.", "success");
            if(callback){
                callback();
            }
           
        } else {
            //swal("Cancelado", "", "error");
            if (callbackfalse)
                callbackfalse();
        }
    });
}
  


function executeFunctionByName(functionName, context, args) {
    var args = [].slice.call(arguments).splice(2);
    var namespaces = functionName.split(".");
    var func = namespaces.pop();
    for (var i = 0; i < namespaces.length; i++) {
        context = context[namespaces[i]];
    }

    return context[func].apply(this, args);

}


function ConvertToNumberFixed(string) {
    var number = 0;
    if (string) {
        number = string.replace(".", "").replace(",", ".").replace(/[^0-9\.-]+/g, "");
        number = parseFloat(number).toFixed(2);
    }
    return number;
}

function gerarGUID(){
    return guid();
}


function getAjaxParameter(url, dados, callback) {
    var retorno = false;
    var errorcount = 0;

    $.ajax({
        type: "get",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'text/plain'
        },
        url: url + "?Dados=" + dados,
        dataType: "json",
        cors: true,
        async: true,
        crossDomain: true,
        success: function (result) {
            resultadoParametroExterno = result;
            retorno = result;
            if (callback) {
                callback(result);
            }
        },
        timeout: 120000,
        error: function (result) {

            if (!errorcount) {
                errorcount = 0;
            }

            errorcount += 1;

            if (errorcount <= 3) {
                getAjaxParameter(url, dados, callback, errorcount);
            }
        }

    });

    if (errorcount > 3) {
        errorcount = 0;
        notification({ messageText: "Falha na comunicação com o servidor", messageTitle: "Desculpe!", fix: false, type: "warning", icon: "thumbs-down" });
    }

    var tipo;
    var mensagem;

    if (resultadoParametroExterno != null) {
        if (resultadoParametroExterno.length > 0) {
            if (resultadoParametroExterno[0].message != null) {
                tipo = resultadoParametroExterno[0].message[0].type;
                mensagem = resultadoParametroExterno[0].message[0].title[0].text;
                Alerta(tipo, mensagem);
            }
        }
    }

    return retorno;
}


function wizardeventclick(containerID, tela, containerIDPrincipal){
    tela = tela.replace("_","");
    
    $("#" + tela + "_btnsair").remove()
    $("#" + containerIDPrincipal + "_" + tela).hide();
    var btn = "<a onclick= eventout('" + containerID + "_" + tela + "','" + tela + "','" + containerIDPrincipal + "')  id='" + tela +  "_btnsair' ";
    btn += "style='left:46%;position:absolute;' class='btn btn-default btn-outline' role='button'>";
    btn += "Sair</a>";	
    $("#" + tela + " .wizard-buttons").last().append(btn); 
    
    var wiz = $(".wizard-pane [tabgenid='" + tela + "'].panel")
    for (let index = 0; index < wiz.length; index++) {
        const element = wiz[index];
        $(element).show();
    }

}

function eventout(containerid, tela, containerIDPrincipal){
    $("#" + containerIDPrincipal + "_" + tela).show();

    var wiz = $(".wizard-pane [tabgenid='" + tela + "'].panel")
    for (let index = 0; index < wiz.length; index++) {
        const element = wiz[index];
        $(element).hide();
    }
   
}