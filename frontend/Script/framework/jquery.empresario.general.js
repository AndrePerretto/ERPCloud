var errorcount;

jQuery.fn.extend({
    loader: function (options) {
        //var settings = $.extend({
        //    load: true,
        //}, options);
        return this.each(function () {
            var loaderHtml = "<div class=\"loader\">"
            loaderHtml += "<svg class=\"spinner-container\" viewBox=\"0 0 52 52\">"
            loaderHtml += "<circle class=\"path\" cx=\"26px\" cy=\"26px\" r=\"20px\" fill=\"none\" stroke-width=\"4px\"></circle>"
            loaderHtml += "</svg>"
            loaderHtml += "</div>"
            var target = $(this)
            isLoading = target.children(".loader")
            if (isLoading.length) {
                isLoading.remove();
            } else {
                target.prepend(loaderHtml);
            }
        });
    }
})


function getUrlVar(parameter) {
    var value = "";

    var vars = [], hash, hashes = null;
    if (window.location.href.indexOf("?") && window.location.href.indexOf("&")) {
        hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    } else if (window.location.href.indexOf("?")) {
        hashes = window.location.href.slice(window.location.href.indexOf('?') + 1);
    }
    if (hashes != null) {
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars[hash[0]] = hash[1];
            if (parameter == hash[0]) {
                value = hash[1];
                break;
            }
        }
    }

    //for (var i = 0; i < hash.length; i++) {
    //    if (parameter == hash[i]) {
    //        value = hash[i + 1];
    //        break;
    //    }
    //}
    if (value) {
        value = value.replace("#", "");
    }

    return value;
}

function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function getAjax(url) {

    $.ajax({
        type: "get",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'text/plain'
        },
        url: url,
        dataType: "json",
        cors: true,
        crossDomain: true,
        async: false,
        success: function (result) {

            resultado = result;
        },
        error: function (result) {

        }

    });

    var tipo;
    var mensagem;

    if (resultado != null) {
        if (resultado[0].message != null) {
            tipo = resultado[0].message[0].type;
            mensagem = resultado[0].message[0].title[0].text;
            Alerta(tipo, mensagem);
        }
    }
}

function getAjaxParameter(url, dados, callback) {
    var retorno = false;


    $.ajax({
        type: "get",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'text/plain'
        },
        url: url + "?Dados=" + dados,
        dataType: "json",
        //cors: true,
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


function Subtitulo(titulo, innerHtml, tooltip) {
    return "<div class='panel-heading'><h5>" + titulo + "</h5>" + innerHtml + "</div>";
}

function Alerta(tipo, mensagem) {

    switch (tipo) {
        case "ALERTAMODAL":
            $("#alertaModal").html("<div id='alertaModal_panel' class='panel'><div class='panel-body'></div></div>");
            $("#mensagem").html("");
            document.getElementById("mensagem").innerHTML = mensagem;
            $('#alertaModalShow').modal('show');
            break;
        case "ERROMODAL":
            $("#ErroModal").html("");
            $("#ErroMensagem").html("");
            document.getElementById("ErroMensagem").innerHTML = mensagem;
            $('#ErroModalShow').modal('show');
            break;
        case "ALERTAPOPUP":
            //$('#alertPopup').modal('show');
            break;
        default:
            notification({ messageText: "", messageTitle: mensagem, fix: false, type: "warning", icon: "exclamation" });

    }

}

function FormOpening(TypeOpeningLayout, nameLayout, LayoutID, TitleMenu, ForcingTemplate) {
    if (TypeOpeningLayout != "" && nameLayout != "" && LayoutID != "" && TitleMenu != "") {

    }
}



function TreeViewOpening(id, TypeOpeningLayout, nameLayout, LayoutID, TitleMenu, tabGenID) {
    if (TypeOpeningLayout != "" && nameLayout != "" && LayoutID != "" && TitleMenu != "") {
        var Dados = "";
        Dados = Dados + "&InstanceID=" + tabGenID;
        Dados = Dados + "&UserID=" + returnCookie("UserID");
        Dados = Dados + "&Lang=" + returnCookie("Lang");
        Dados = Dados + "&EnterpriseID=" + returnCookie("EnterpriseID");

        $('#alertaModalShow .modal-body').html("");
        $('#alertaModalShow .modal-body').loader();
        $('#alertaModalShow').modal('show');
        getAjaxParameter(getGlobalParameters("urlPlataforma") + "/api/render/renderform", nameLayout + Dados, function () {
            $('#alertaModalShow .modal-body').append("<div id='alertaModal'></div>");
            //getAjaxParameter("http://54.201.159.17/api/render/renderform", nameLayout, function () {
            var tabID = Math.random().toString().replace(".", "");
            LayoutID = LayoutID + tabID;
            //CreateControlTreeView("VERTICAL", TitleMenu, "alertaModal", tabID, resultadoParametroExterno[0].TitleAboveControl, resultadoParametroExterno);
            CreateTreeViewSingle({ id: id, titulo: "", conteudoTreeView: resultadoParametroExterno[0].container[0], container: "alertaModal", containerID: "alertaModal" });
            //$.getScript('Script/pages/demo.treeView.js');
            //$.getScript('Script/easyTree.js');
            $('#alertaModalShow .modal-body').loader();

        });
    }
}

function postAjaxParameter(EnterpriseID, url, dados, callbackSucess, callbackError, callbackComplete, async) {
    var retorno = false;
    var asyncLocal = true;

    if (async) {
        asyncLocal = async;
    } else if (async == false) {
        asyncLocal = async;
    }



    $.ajax({
        type: 'POST',
        //headers: {
        //'Accept': 'application/json',
        //'Content-Type': 'text/plain; charset=utf-8'
        //},
        url: url,
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        //cors: true,
        async: asyncLocal,
        crossDomain: true,
        data: dados,//{
        //Dados: person
        //},
        success: function (result) {
            resultadoParametroExterno = result;
            if (result.length > 0) {
                if (result[0].message != null) {
                    //if (result[0].message.indexOf("sucesso") != -1) {


                    var messageTitle = result[0].message[0].title[0].text;
                    var success = result[0].message[0].success;
                    var messageType = result[0].message[0].type;
                    var messageText = result[0].message[0].title[0].toolTip;
                    var messageIcon = "exclamation";

                    if (success == true) {
                        messageIcon = "thumbs-up";
                        if (!messageType) {
                            messageType = "ok"
                        }
                        if (callbackSucess) {
                            callbackSucess(result);
                            retorno = result;
                        }

                        retorno = result;
                    } else if (success == false) {
                        messageIcon = "thumbs-down";
                        if (!messageType) {
                            messageType = "error"
                        }

                        if (callbackError) {
                            callbackError(result);
                        }
                        retorno = false;
                    }

                    notification({ messageText: messageText, messageTitle: messageTitle, fix: false, type: messageType, icon: messageIcon });
                    //return retorno
                    //} else {
                    //notification({ messageText: message, messageTitle: "Desculpe!", fix: false, type: "warning", icon: "thumbs-down" });
                    //return false;
                    //}
                }
            }

        },
        error: function (result) {

            if (callbackError) {
                callbackError(result);
            } else if (callbackSucess) {
                callbackSucess(result);
            }

            notification({ messageText: "falha no processamento", messageTitle: "Desculpe!", fix: false, type: "warning", icon: "thumbs-down" });
            retorno = result;
        },
        complete: function (result) {
            if (callbackComplete) {
                callbackComplete(result);
            }

            //if (result != null) {
            //    if (result.responseJSON) {
            //        if (result.responseJSON.length > 0) {
            //            if (result.responseJSON[0].message) {
            //                tipo = result.responseJSON[0].message[0].Type;
            //                mensagem = result.responseJSON[0].message[0].Title[0].Text;
            //            }
            //        }
            //    }
            //}
        }

    });

    return retorno;
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

function gerarGUID() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
}

function ElementVisible(id, visible) {
    var elemento = document.getElementById(id);
    var elementoFora = elemento.parentElement;
    while (elementoFora.classList.contains("form-group") == false) {
        elementoFora = elementoFora.parentElement;
    }
    if (visible == true) {
        $(elementoFora).show();
    }
    else {
        $(elementoFora).hide();
    }
};

function getGlobalParameters(parametro) {

    var global = new Object();

    //Servidor homologação
    //global.urlPlataforma = "http://54.149.163.193:80"
    //global.urlInterface = "http://54.149.163.193:80"

    //global.urlPlataforma = "http://54.149.163.193:81"
    //global.urlInterface = "http://54.149.163.193:81"

    //Local
    //global.urlInterface = "http://localhost:27707"
    //global.urlPlataforma = "http://localhost:9000"

    //global.urlInterface = "http://localhost:27707"
    //global.urlPlataforma = "http://localhost:27707"

    //Servidor produção
    //global.urlInterface = "http://52.89.57.100/"
    //global.urlPlataforma = "http://52.89.57.100/"

    //global.urlInterface = "http://" + window.location.host
    //global.urlPlataforma = "http://" + window.location.host

    //global.urlDesenvolvimento = "http://localhost:13886/";

    //global.urlSearch = "http://" + window.location.host + ":8983"
    global.urlPlataform = "http://"+ window.location.hostname +":3002"
    //global.urlPlataforma = "http://localhost:2444"
    //global.urlInterface = "http://localhost:2444"
    
    global.urlPlataforma = "http://homologa.empresariocloud.com.br"
    global.urlInterface = "http://homologa.empresariocloud.com.br"

    global.urlSearch = "http://" + window.location.host + ":8983"

    if (parametro) {
        return global[parametro]
    }
    else {
        return global
    }

}

function getBaseUrl() {
    var re = new RegExp(/^.*\//);
    return re.exec(window.location.href);
}

function loaderImage(id, on) {
    container = $("#" + id)
    if (on) {
        //container.prepend("<div class=\"loadingBox\"></div>");
        $("#" + id).loader();
    }
    else {
        container.find(".loadingBox").remove();
        container.find(".loader").remove();
    }
}

function disableField(id, on) {
    container = $("#" + id)
    if (on) {
        container.prepend("<div class=\"disableBox\"></div>");
    }
    else {
        container.find(".disableBox").remove()

    }
}

function getAjaxData(url, dados, callback) {


    $.ajax({
        type: "get",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'text/plain'
        },
        url: url,
        data: dados,
        dataType: "json",
        //cors: true,
        async: true,
        crossDomain: true,
        //data: {
        //    Dados: dados
        //},
        success: function (result) {
            resultadoParametroExterno = result;
            if (callback) {
                callback(result);
            }

            return resultadoParametroExterno;


        },
        error: function (result) {

        }

    });

    var tipo;
    var mensagem;

    //if (resultadoParametroExterno != null) {
    //    if (resultadoParametroExterno[0].Message != null) {
    //        tipo = resultadoParametroExterno[0].Message[0].Type;
    //        mensagem = resultadoParametroExterno[0].Message[0].Title[0].text;
    //        Alerta(tipo, mensagem);
    //    }
    //}

    if (resultadoParametroExterno) {
        return resultadoParametroExterno;
    } else {
        //retorna erro
        //return 
    }

}

function AjaxParameter(parameters) {
    var retorno = false;
    var dataType = (parameters.dataType) ? parameters.dataType : "json";
    var type = (parameters.type) ? parameters.type : "";
    var url = (parameters.url) ? parameters.url : "";
    var dados = (parameters.dados) ? parameters.dados : "";
    var callback = (parameters.callback) ? parameters.callback : "";
    var async = (parameters.async) ? parameters.async : false;
    var contentType = (parameters.type == "POST") ? "application/json; charset=utf-8" : "";

    $.ajax({
        type: type,
        //headers: {
        //'Accept': 'application/json',
        //'Content-Type': 'text/plain; charset=utf-8'
        //},
        url: url,
        dataType: dataType,
        //contentType: 'application/json; charset=utf-8',
        //cors: true,
        contentType: contentType,
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

function returnCookie(key) {
    var valueKey = localStorage.getItem(key);
    return valueKey ? valueKey : null;
}

function ConvertToNumber(string) {
    var number = 0;
    if (string) {
        string.replace(".", "").replace(",", ".").replace(/[^0-9\.-]+/g, "");
        number = parseFloat(number);
    }
    return number;
}

function ConvertToNumberFixed(string) {
    var number = 0;
    if (string) {
        number = string.replace(".", "").replace(",", ".").replace(/[^0-9\.-]+/g, "");
        number = parseFloat(number).toFixed(2);
    }
    return number;
}

function AutorizaDesconto() {
    //var idProduto = document.getElementById("txtIdProduto").value;
    var usuario = document.getElementById("txtUsername").value;
    var senha = document.getElementById("txtPassword").value;
    var desconto = document.getElementById("txtDesconto").value;

    var objs = [usuario, senha];

    $.ajax({
        url: getGlobalParameters("urlPlataforma") + "/api/service/RunServiceMethod?service=SalesService&method=AutorizarDesconto",
        data: { '': objs },
        type: "post",
        dataType: "json",
        async: false,
        crossDomain: true,
        success: function (response) {

            if (response != "") {

                //desconto
                var DecimalSeparator = Number("1.2").toLocaleString().substr(1, 1);
                var quantidade = ConvertToNumber($("#" + idTela + "CoItensVenda_txtquantidade").val());
                var valorUnitario = ConvertToNumber($("#" + idTela + "CoItensVenda_txtvalorunitario").val());
                var idProduto = $("#" + idTela + "CoItensVenda_txtitensid").val();
                var idArmazem = $("#" + idTela + "cbo_armazem").val();



                var valorTotal = ((quantidade * valorUnitario) - desconto);

                var arParts = String(valorTotal).split(DecimalSeparator);
                var intPart = arParts[0];
                var decPart = (arParts.length > 1 ? arParts[1] : '');
                decPart = (decPart + '00').substr(0, 2);

                var valor_1 = intPart + DecimalSeparator + decPart;

                var mask = $("#" + idTela + "CoItensVenda_txtvalortotal").attr("data-mask")

                $("#" + idTela + "CoItensVenda_txtvalortotal").val(valor_1);
                $("#" + idTela + "CoItensVenda_txtvalortotal").mask(mask, { reverse: true });

                $('#alertaModalShow').modal('hide');
                $("#" + idTela + "CoItensVenda_idUsuarioLiberouDesconto").val(response);
                $("#" + idTela + "CoItensVenda_txtvalordesconto").val(desconto);
                notification({ messageTitle: "OK", messageText: "Desconto liberado!", fix: false, type: "ok", icon: "thumbs-up" });
            } else {

                //desconto
                var DecimalSeparator = Number("1.2").toLocaleString().substr(1, 1);
                var quantidade = ConvertToNumber($("#" + idTela + "CoItensVenda_txtquantidade").val());
                var valorUnitario = ConvertToNumber($("#" + idTela + "CoItensVenda_txtvalorunitario").val());
                var idProduto = $("#" + idTela + "CoItensVenda_txtitensid").val();
                var idArmazem = $("#" + idTela + "cbo_armazem").val();



                var valorTotal = ((quantidade * valorUnitario) - 0);

                var arParts = String(valorTotal).split(DecimalSeparator);
                var intPart = arParts[0];
                var decPart = (arParts.length > 1 ? arParts[1] : '');
                decPart = (decPart + '00').substr(0, 2);

                var valor_1 = intPart + DecimalSeparator + decPart;

                var mask = $("#" + idTela + "CoItensVenda_txtvalortotal").attr("data-mask")

                $('#alertaModalShow').modal('hide');
                $("#" + idTela + "CoItensVenda_txtvalordesconto").val("0");
                notification({ messageTitle: "Erro", messageText: "Usuario não tem permissão!", fix: false, type: "warning", icon: "thumbs-down" });
            }
        },

        error: function (xhr, ajaxOptions, thrownError) {
            alert(xhr.status);
            alert(thrownError);
        }
    });
}

function NegaDesconto() {
    $('#alertaModalShow').modal('hide');
    $("#" + idTela + "CoItensVenda_txtvalordesconto").val("0");
}

function getObjMessageJS(number) {
    var message = localStorage.getItem("Message");
    var retorno;
    if (message) {
        var obj = JSON.parse(message);
        $.each(obj, function () {
            if (this.internalNumber == number) {
                retorno = this;
            }
        });
    }

    return retorno;
}

function getMessageJS(number) {
    var message = localStorage.getItem("Message");
    if (message) {
        var obj = JSON.parse(message);
        $.each(obj, function () {
            if (this.internalNumber == number) {
                if (this.type == "MSG") {
                    notification({ messageText: this.title[0].text, messageTitle: this.title[0].toolTip, fix: false, type: "ok", icon: "thumbs-up" });
                } else {
                    notification({ messageText: this.title[0].text, messageTitle: this.title[0].toolTip, fix: false, type: "warning", icon: "thumbs-down" });
                }
            }
        });
    }    
}

function createMessageJS() {
    if (returnCookie("EnterpriseID")) {
        $.ajax({
            url: getGlobalParameters("urlPlataforma") + "/api/render/MessageInternalJS?EnterpriseID=" + returnCookie("EnterpriseID") + "&UserID=" + returnCookie("UserID") + "&Lang=" + returnCookie("Lang"),
            success: function (response) {
                var jsonString = JSON.stringify(response);
                createCookie("Message", jsonString, 1)
            }
        });
    }
   
}

