var cellSelected;
var cellSelectedData;
var buttonCellSelectedData;
var gridButtons = new Object();
var $vl_qt_itens = $('[data-field="vl_qt_itens"]');

function addRowGrid(containerID, controls, navigation, clearFormIgnore) {
    var grid = false;
      
    if ($("#" + containerID + "_table").attr("data-template") == "GRID" || $("#" + containerID + "_table").attr("data-template") == "MASTERDETAIL" ) {
        grid = true;
    }

    var visibleGrid = [];
    var c = "";
    var valueID = "";
    var referenceID = "";
    var lines = "";
    var layoutID = $("#" + containerID).attr("layoutid");
    var buttons = gridButtons[containerID + "_table"];
    var onLostFocusName = "";
    var onClickName = "";
    var onFocusName = "";
    var onChangeName = "";
    var onKeyPressName = "";
    var scriptEvents = "";
    var table = "";

    var data = [];
    var row;

    if (controls.length > 0) {

        //if (controls[0].newValue.length == 1) {
        //    if (controls[0].newValue[0] == "") {
        //        return;
        //    }
        //}



        for (var i = 0; i < controls[0].newValue.length; i++) {
            var status;
            var ActionText;
            var defaultcolumn = "";
            for (var i2 = 0; i2 < controls.length; i2++) {
                if (controls[i2].field == "id") {
                    valueID = controls[i2].newValue[i];
                    referenceID = controls[i2].propertyID;
                    break;
                }
                if (controls[i2].placeholder == "Status") {
                    status = controls[i2];
                }
                if (controls[i2].table != "null") {
                    table = controls[i2].table;
                }
            }




            lines += "<tr id=\"line_" + i + "_" + containerID + "\" class=\"filtered\">"

            if (navigation) {
                lines += " <td class='text-center buttons' data-visibleGrid='true' class='text-center'>";
                lines += " <div class='' style='white-space: nowrap;'>";
                lines += CreateButton({
                    titulo: "", nome: "Edit", tooltip: "editar", onClick: "editLayout(this,\"" + navigation.layoutName + "\", \"" +

    navigation.layoutID + "\", \"" + navigation.title + "\", \"" + navigation.loadData + "\", \"" + referenceID + "\", \"" + valueID + "\");", classe: "btn btn-xs btn-warning", icone: "<i class=\"fa fa-pencil\"></i>", returnString: true
                });
                lines += "</div>";
                lines += "</td>";

            } else {

                lines += " <td class='text-center buttons' data-visibleGrid='true' class='text-center'>";
                lines += " <div class='' style='white-space: nowrap;'>";

                //defaultcolumn += " <td class='text-center buttons' data-visibleGrid='true' class='text-center'>";
                defaultcolumn += " <div class='' style='white-space: nowrap;'>";

                if (!buttons) {
                    buttons = [];
                }

                if (buttons.length > 0) {
                    for (var j = 0; j < buttons.length; j++) {

                        if (buttons[j].onLostFocusName) {
                            onLostFocusName = buttons[j].onLostFocusName;
                        }
                        if (buttons[j].onClickName) {
                            onClickName = buttons[j].onClickName;
                        }
                        if (buttons[j].onFocusName) {
                            onFocusName = buttons[j].onFocusName;
                        }
                        if (buttons[j].onChangeName) {
                            onChangeName = buttons[j].onChangeName;
                        }
                        if (buttons[j].onKeyPressName) {
                            onKeyPressName = buttons[j].onKeyPressName;
                        }
                        if (buttons[j].scriptEvents) {
                            scriptEvents = buttons[j].scriptEvents;
                        }


                        switch (buttons[j].controlType) {
                            case "BUTTONGRID":

                                //disabled
                                var disabled = "";
                                if (controls[0].disabled) {
                                    disabled = controls[0].disabled[i];
                                    if (disabled == "true") {
                                        disabled = "disabled";
                                    }
                                }

                                lines += "<a " + check + " " + disabled + " data-color='" + color + "' data-referenceID='" + valueID + "' class='btn btn-primary' data-controlID='" + buttons[j].id + "' data-propertyID='" + buttons[j].id + "' type='button' id='" + buttons[j].id + "_" + gerarGUID();
                                lines += " ' onblur='" + onLostFocusName + "' onclick='" + onClickName + "(this)' onfocus='" + onFocusName + "' onchange='" + onChangeName + "' onkeypress='" + onKeyPressName + "'>" + buttons[j].titulo + " </a>";
                                lines += "<script>" + scriptEvents + " </script>";

                                defaultcolumn += "<a " + check + " " + disabled + " data-color='" + color + "' data-referenceID='" + valueID + "' class='btn btn-primary' data-controlID='" + buttons[j].id + "' data-propertyID='" + buttons[j].id + "' type='button' id='" + buttons[j].id + "_" + gerarGUID();
                                defaultcolumn += " ' onblur='" + onLostFocusName + "' onclick='" + onClickName + "(this)' onfocus='" + onFocusName + "' onchange='" + onChangeName + "' onkeypress='" + onKeyPressName + "'>" + buttons[j].titulo + " </a>";
                                defaultcolumn += "<script>" + scriptEvents + " </script>";


                                break;
                            case "CHECKBOXGRID":
                                var check = "unchecked";
                                if (controls[0].texto) {
                                    check = controls[0].texto[i];
                                    if (check == "true") {
                                        check = "checked";
                                    }
                                }
                                //disabled
                                var disabled = "";
                                if (controls[0].disabled) {
                                    disabled = controls[0].disabled[i];
                                    if (disabled == "true") {
                                        disabled = "disabled";
                                    }
                                }
                                //color do checkbox padrão azul.
                                var color = "";
                                if (controls[0].color) {
                                    color = controls[0].color[i];
                                    if (color == "" || color == "null") {
                                        color = "blue";
                                    }
                                }
                                else {
                                    color = "blue";
                                }
                                //
                                if (status != undefined) {
                                    if (status.newValue[i] == "Venda Iniciada" || status.newValue[i] == "Parcialmente entregue" || status.newValue[i] == " Orçamento" || status.newValue[i] == "Faturado" || status.newValue[i] == "Em Entrega" || status.newValue[i] == "Cancelada" || status.newValue[i] == "Entregue" || status.newValue[i] == "Separado para entrega") {
                                        lines += "<input " + check + " " + disabled + " data-color='" + color + "' data-referenceID='" + valueID + "' class='icheck-grey' data-controlID='" + buttons[j].id + "' data-propertyID='" + buttons[j].id + "' type='checkbox' id='" + buttons[j].id + "_" + gerarGUID() + "' onblur='" + onLostFocusName + "' onclick='" + onClickName + "' onfocus='" + onFocusName + "' onchange='" + onChangeName + "' onkeypress='" + onKeyPressName + "'/>";
                                        lines += "  ";
                                        lines += "<script>" + scriptEvents + " </script>";

                                        defaultcolumn += "<input " + check + " " + disabled + " data-color='" + color + "' data-referenceID='" + valueID + "' class='icheck-grey' data-controlID='" + buttons[j].id + "' data-propertyID='" + buttons[j].id + "' type='checkbox' id='" + buttons[j].id + "_" + gerarGUID() + "' onblur='" + onLostFocusName + "' onclick='" + onClickName + "' onfocus='" + onFocusName + "' onchange='" + onChangeName + "' onkeypress='" + onKeyPressName + "'/>";
                                        defaultcolumn += "  ";
                                        defaultcolumn += "<script>" + scriptEvents + " </script>";
                                    }
                                    else {
                                        lines += "<input " + check + " " + disabled + " data-color='" + color + "' data-referenceID='" + valueID + "' class='icheck-grey' data-controlID='" + buttons[j].id + "' data-propertyID='" + buttons[j].id + "' type='checkbox' id='" + buttons[j].id + "_" + gerarGUID() + "' onblur='" + onLostFocusName + "' onclick='" + onClickName + "' onfocus='" + onFocusName + "' onchange='" + onChangeName + "' onkeypress='" + onKeyPressName + "'/>";
                                        lines += "  ";
                                        lines += "<script>" + scriptEvents + " </script>";

                                        defaultcolumn += "<input " + check + " " + disabled + " data-color='" + color + "' data-referenceID='" + valueID + "' class='icheck-grey' data-controlID='" + buttons[j].id + "' data-propertyID='" + buttons[j].id + "' type='checkbox' id='" + buttons[j].id + "_" + gerarGUID() + "' onblur='" + onLostFocusName + "' onclick='" + onClickName + "' onfocus='" + onFocusName + "' onchange='" + onChangeName + "' onkeypress='" + onKeyPressName + "'/>";
                                        defaultcolumn += "  ";
                                        defaultcolumn += "<script>" + scriptEvents + " </script>";

                                    }
                                }
                                else {
                                    lines += "<input " + check + " " + disabled + " data-color='" + color + "' data-referenceID='" + valueID + "' class='icheck-grey' data-controlID='" + buttons[j].id + "' data-propertyID='" + buttons[j].id + "' type='checkbox' id='" + buttons[j].id + "_" + gerarGUID() + "' onblur='" +

                                    onLostFocusName + "' onclick='" + onClickName + "' onfocus='" + onFocusName + "' onchange='" + onChangeName + "' onkeypress='" + onKeyPressName + "'/>";
                                    lines += "  ";
                                    lines += "<script>" + scriptEvents + " </script>";


                                    defaultcolumn += "<input " + check + " " + disabled + " data-color='" + color + "' data-referenceID='" + valueID + "' class='icheck-grey' data-controlID='" + buttons[j].id + "' data-propertyID='" + buttons[j].id + "' type='checkbox' id='" + buttons[j].id + "_" + gerarGUID() + "' onblur='" + onLostFocusName + "' onclick='" + onClickName + "' onfocus='" + onFocusName + "' onchange='" + onChangeName + "' onkeypress='" + onKeyPressName + "'/>";
                                    defaultcolumn += "  ";
                                    defaultcolumn += "<script>" + scriptEvents + " </script>";
                                }
                                break;

                            default:

                        }
                    }
                } else {
                    if (table != "produtos_lancamentos" && table != "venda_produtos_impostos") {
                        lines += CreateButton({
                            titulo: "", nome: "Edit", tooltip: "editar", onClick: "editGridLine(this,\"" + containerID + "\", \"" + valueID + "\")", classe: "btn btn-xs btn-warning", icone: "<i class=\"fa fa-pencil\"></i>", returnString: true
                        });
                        lines += "  ";
                        lines += CreateButton({
                            titulo: "", nome: "Delete", tooltip: "excluir", onClick: "deleteRowGrid(this,'" + containerID + "','" + valueID + "')", classe: "btn btn-xs btn-danger", icone: '<i class="fa fa-trash-o"></i>', returnString: true
                        });

                        defaultcolumn += CreateButton({
                            titulo: "", nome: "Edit", tooltip: "editar", onClick: "editGridLine(this,\"" + containerID + "\", \"" + valueID + "\")", classe: "btn btn-xs btn-warning", icone: "<i class=\"fa fa-pencil\"></i>", returnString: true
                        });
                        defaultcolumn += "  ";
                        defaultcolumn += CreateButton({
                            titulo: "", nome: "Delete", tooltip: "excluir", onClick: "deleteRowGrid(this,'" + containerID + "','" + valueID + "')", classe: "btn btn-xs btn-danger", icone: '<i class="fa fa-trash-o"></i>', returnString: true
                        });


                    }
                    if (table == "venda_produtos_impostos") {
                        lines += "<a class=\"btn btn-primary btn-outline popup-modal-ajax\" title=\"Memória de Cálculo\" href=\"http://" + window.location.host + "/WorkFlowVendas/MemoriaCalculo.aspx?id=" + valueID + "\"><i class=\"fa fa-superscript\"></i></a>";
                        defaultcolumn += "<a class=\"btn btn-primary btn-outline popup-modal-ajax\" title=\"Memória de Cálculo\" href=\"http://" + window.location.host + "/WorkFlowVendas/MemoriaCalculo.aspx?id=" + valueID + "\"><i class=\"fa fa-superscript\"></i></a>";
                        
                    }
                }

                defaultcolumn += "</div>";
                //defaultcolumn += "</td>";

                lines += "</div>";
                lines += "</td>";
            }


            row = {};

            row["configuracao"] = defaultcolumn;

            for (var i2 = 0; i2 < controls.length; i2++) {


                isVisible = "";
                isCentered = "";
                if (controls[i2].visibleGrid == "false" || controls[i2].visibleGrid == false || controls[i2].visibleGrid == null) {
                    isVisible = " style='display:none' class=\"no-search\"";
                } else if (navigation && (controls[i2].controlType == "DROPDOWN" || controls[i2].controlType == "DROPDOWNDSG")) {
                    isVisible = " style='display:none' class=\"no-search\"";
                }

                dadoCelula = (controls[i2].newValue[i]) ? controls[i2].newValue[i] : "";
                if (controls[i2].nativeDataType == "SimNao") {
                    if (dadoCelula == true || dadoCelula == "true" || dadoCelula == "True" || dadoCelula == "TRUE") {
                        dadoCelula = '<i class="fa fa-check"></i>';
                        isCentered = "class=\"text-center\"";
                    };
                    if (dadoCelula == false || dadoCelula == "false" || dadoCelula == "False" || dadoCelula == "FALSE") {
                        dadoCelula = '<i class="fa fa-times"></i>';
                        isCentered = "class=\"text-center\"";
                    };
                }
                if (controls[i2].controlType == "DROPDOWN" || controls[i2].controlType == "DROPDOWNDSG") {
                    dadoCelula = controls[i2].textList[controls[i2].valueList.indexOf(dadoCelula)]
                }
                if (controls[i2].controlType == "AUTOCOMPLETE") {
                    dadoCelula = (controls[i2].text[i]) ? controls[i2].text[i] : controls[i2].newValue[i];
                }
                lines += "<td " +
                    "id='" + controls[i2].controlID + "_" + valueID + "' " +
                    "data-controlid='" + controls[i2].controlID + "' " +
                    "data-field='" + controls[i2].field + "' " +
                    "data-table='" + controls[i2].table + "' " +
                    "data-nativeDataType='" + controls[i2].nativeDataType + "' " +
                    "data-derivedFrom='" + controls[i2].derivedFrom + "' " +
                    "data-newValue='" + dadoCelula + "'" + "' " +
                    "data-oldValue='" + dadoCelula + "'" + "' " +
                    "data-registerID='" + valueID + "'" +
                    "data-layoutID='" + layoutID + "'" +
                    isVisible + " " +
                    isCentered + ">" +
                     "<span class=\"cellData\" data-spanid='" + controls[i2].controlID + "_" + valueID + "_span'" + "onClick='showMessage()'" + ">" + dadoCelula + "<span>" +
                    "</td>";

                    dadoCelula = "<div " +
                    "id='" + controls[i2].controlID + "_" + valueID + "' " +
                    "data-controlid='" + controls[i2].controlID + "' " +
                    "data-field='" + controls[i2].field + "' " +
                    "data-table='" + controls[i2].table + "' " +
                    "data-nativeDataType='" + controls[i2].nativeDataType + "' " +
                    "data-derivedFrom='" + controls[i2].derivedFrom + "' " +
                    "data-newValue='" + dadoCelula + "'" + "' " +
                    "data-oldValue='" + dadoCelula + "'" + "' " +
                    "data-registerID='" + valueID + "'" +
                    "data-layoutID='" + layoutID + "'" +
                    isVisible + " " +
                    isCentered + ">" +
                     "<span class=\"cellData\" data-spanid='" + controls[i2].controlID + "_" + valueID + "_span'" + "onClick='showMessage()'" + ">" + dadoCelula + "<span>" +
                    "</div>";

                if (controls[i2].controlID) {
                    row[controls[i2].controlID] = dadoCelula;
                }

            }



            var acao = "";

            if (containerID.split("_")[0] == "b63c19ea-dba3-411f-a5c0-fed30483abac") {
                lines += "<td><a class=\"btn btn-primary btn-outline popup-modal-ajax\" href=\"http://" + window.location.host + "/boletos.aspx?id=" + valueID + "\">Vizualizar Boleto</a></td>";
                lines += "</tr>";

                acao += "<a class=\"btn btn-primary btn-outline popup-modal-ajax\" href=\"http://" + window.location.host + "/boletos.aspx?id=" + valueID + "\">Vizualizar Boleto</a>";

            }



            if (containerID.split("_")[0] == "9ce79fa0-fd8a-4cd1-b1be-3878e455409b") {
                lines += "<td>" + "<a class=\"btn btn-primary btn-outline\"onClick=\"f_aba('cotacoes','5029331a-57ac-43d9-8f7a-65735eff6740','Cotações','true', '" + returnCookie("EnterpriseID") + "')\">Gerar Cotação</a>" +
                                   "</td>";
                lines += "</tr>";

                acao += "<a class=\"btn btn-primary btn-outline\"onClick=\"f_aba('cotacoes','5029331a-57ac-43d9-8f7a-65735eff6740','Cotações','true', '" + returnCookie("EnterpriseID") + "')\">Gerar Cotação</a>"
            }

            //Atendimento de Requisicao de Material
            if (containerID.split("_")[0] == "c8e5e8e2-0875-40fe-99c2-77dda9efaadd") {
                lines += "<td>" + "<a style='font-size: 80%' class=\"btn btn-primary btn-outline\"onClick=\"openModalRejeicao('" + valueID + "')\"><i class='fa fa-ban'></i></a></td>";
                lines += "</tr>";

                acao += "<a style='font-size: 80%' class=\"btn btn-primary btn-outline\"onClick=\"openModalRejeicao('" + valueID + "')\"><i class='fa fa-ban'></i></a>";

            }

            //Container CoListaCompra (Controle de Compras)
            if (containerID.split("_")[0] == "87cc1ae4-a188-498b-83a6-ae137b91c76b") {
                //Verifica em qual status está e qual o próximo step.
                var proximoStatus = verificaStatus(status.newValue[i], "compra");
                var htmlBotaoExcluir = "";

                htmlBotaoExcluir += "<a class='btn btn-primary btn-outline btn-icon btn-danger' href='#'";
                htmlBotaoExcluir += "onclick= ExcluirPedidoCompra('" + valueID + "',this) >";
                htmlBotaoExcluir += "<i class='fa fa-trash-o'></i>";
                htmlBotaoExcluir += "</a>";

                if (proximoStatus == "Pedido") {
                    lines += "<td style=\"width:auto!important\">";
                    lines += htmlBotaoExcluir;
                    lines += "</td>";
                    lines += "</tr>";

                    acao += htmlBotaoExcluir;
                }
                else if (proximoStatus == "Compra Iniciada") {
                    lines += "<td style=\"width:auto!important\">";
                    lines += htmlBotaoExcluir;
                    lines += "</td>";
                    lines += "</tr>";
                    acao += htmlBotaoExcluir;
                }
                else if (proximoStatus == "Compra Aprovada") {
                    lines += "<td style=\"width:auto!important\">";
                    lines += htmlBotaoExcluir;
                    lines += "</td>";
                    lines += "</tr>";
                    acao += htmlBotaoExcluir;
                }
                else if (proximoStatus == "Recebido XML de Compra") {
                    lines += "<td style=\"width:auto!important\">";
                    //function f_aba(systemName, layoutID, titleMenu, loadData, enterpriseID)
                    lines += "<a class=\"btn btn-primary btn-outline\" id=\"btnXML\" onClick=\"f_aba('lyImportarXML','c6bd6c44-6546-4700-954d-e22c61a20979','Importação XML','false', '" + returnCookie("EnterpriseID") + "','" + valueID + "')\">Importação XML</a>";
                    lines += htmlBotaoExcluir;
                    lines += "</td>";
                    lines += "</tr>";
                    acao += htmlBotaoExcluir;
                }
                else if (proximoStatus == "Aguardando Recebimento") {
                    lines += "<td style=\"width:auto!important\">";
                    lines += htmlBotaoExcluir;
                    lines += "<td>" + "</td>";
                    lines += "</tr>";
                    acao += htmlBotaoExcluir;
                }
                else if (proximoStatus == "Pedido Recebido") {
                    lines += "<td style=\"width:auto!important\">";
                    lines += htmlBotaoExcluir;
                    lines += "<td>" + "</td>";
                    lines += "</tr>";
                    acao += htmlBotaoExcluir;
                }

            }

            if (status) {
                if (status.newValue) {
                    if (status.newValue[i] == "Entregue") { //venda
                        lines += "<td style=\"width:auto!important\">";
                        //lines +=  "<a class='btn btn-primary btn-outline' onclick=\"javascrpt:CreateAba('" + nameLayout + "','" + layoutID + "','" + titleMenu + "','" + dados + "'," + false + ",'" + containerType + "','" + forcingTemplate + "')\">Liberar Crédito</a>";
                        var htmlBotao = "";
                        htmlBotao += "<a class='btn btn-primary btn-outline btn-icon btn-danger' href='#'";
                        htmlBotao += "onclick= DevolucaoPedidoVenda('" + valueID + "',this) >";
                        htmlBotao += "<i class='fa fa-ban'></i>";
                        htmlBotao += "</a>";
                        lines += htmlBotao;
                        lines += "</td>";
                        lines += "</tr>";

                        acao += htmlBotao;
                    } else if (status.newValue[i] == "Pedido Recebido") { //compra
                        lines += "<td style=\"width:auto!important\">";
                        var htmlBotao = "";
                        htmlBotao += "<a class='btn btn-primary btn-outline btn-icon btn-danger' href='#'";
                        htmlBotao += "onclick= DevolucaoPedidoCompra('" + valueID + "',this) >";
                        htmlBotao += "<i class='fa fa-ban'></i>";
                        htmlBotao += "</a>";
                        lines += htmlBotao;
                        lines += "</td>";
                        lines += "</tr>";

                        acao += htmlBotao;
                    }
                }
            }

            if (containerID.split("_")[0] == "2d03e5da-ef21-4f65-9dee-de305246c737") {
                lines += "<td>" + "<a class=\"btn btn-primary btn-outline\" id=\"btnDevolucao\" onClick=\"f_aba('devolucao_compra','c0ae32a8-ece8-4f99-8bb5-776ff1592956','Devolução de Compras','false', '" + returnCookie("EnterpriseID") + "','" + valueID + "')\">Devolução</a>" +
                "</td>";
                lines += "</tr>";

                acao += "<a class=\"btn btn-primary btn-outline\" id=\"btnDevolucao\" onClick=\"f_aba('devolucao_compra','c0ae32a8-ece8-4f99-8bb5-776ff1592956','Devolução de Compras','false', '" + returnCookie("EnterpriseID") + "','" + valueID + "')\">Devolução</a>";

            }

            //Container CoListaVendas (Controle de Vendas)
            if (containerID.split("_")[0] == "2e9ecdc9-9d91-4750-958f-d8f530e77e13") {
                //Verifica em qual status está e qual o próximo step.
                var proximoStatus = verificaStatus(status.newValue[i], "venda");
                var htmlBotaoExcluir = "";

                htmlBotaoExcluir += "<a class='btn btn-primary btn-outline btn-icon btn-danger' href='#'";
                htmlBotaoExcluir += "onclick= ExcluirPedidoVenda('" + valueID + "',this) >";
                htmlBotaoExcluir += "<i class='fa fa-trash-o'></i>";
                htmlBotaoExcluir += "</a>";

                if (proximoStatus == "Pedido") {
                    lines += "<td style='width:auto!important'>";
                    lines += "<a id=\"btnEntrega\" onClick=\"OrcamentoGeraVenda('" + valueID + "');\" class=\"btn btn-primary btn-outline\" href=\"#\">Gerar Venda</a>";
                    lines += "</td>";
                    lines += "</tr>";

                    acao += "<a id=\"btnEntrega\" onClick=\"OrcamentoGeraVenda('" + valueID + "');\" class=\"btn btn-primary btn-outline\" href=\"#\">Gerar Venda</a>";

                }
                else if (status.newValue[i] == "Aguardando Liberação") {


                    lines += "<td style=\"width:auto!important\">" +
                       "<a class=\"btn btn-primary btn-outline\" href=\"" + valueID + "\"  onClick=\"LiberaDescontoVenda('" + valueID +

"');\" >Liberar Desconto</a>";

                    lines += htmlBotaoExcluir;

                    lines += "</td>";
                    lines += "</tr>";

                    acao += "<a class=\"btn btn-primary btn-outline\" href=\"" + valueID + "\"  onClick=\"LiberaDescontoVenda('" + valueID

+ "');\" >Liberar Desconto</a>";

                    acao += htmlBotaoExcluir;
                }
                else if (status.newValue[i] == "Aguardando Liberação ") {
                    var id = "bb698842-7062-86ad-f560-53ae3dbc229f_CoCabecalhoVenda_ddltabelaoperacoes";
                    var typeOpeningLayout = "bb698842-7062-86ad-f560-53ae3dbc229f_CoCabecalhoVenda_ddltabelaoperacoes";
                    var nameLayout = "lyAprovacaoLimiteCredito";
                    var layoutID = "123e92e3-0681-4ca3-b029-e1ac1989f31a";
                    var titleMenu = "Aprovação de Limite de Crédito";
                    var forcingTemplate = "VERTICAL";
                    var enterpriseID = "f1495bcf-9258-4245-8edf-d0fac225412d";
                    var containerType = "MODAL";
                    var dados = "&paramReferenceID=8862f239-5eb7-45dd-8f7e-0ad90fc1e9ea&filtro=" + valueID;
                    dados += "&enterpriseID=" + enterpriseID;
                    lines += "<td style=\"width:auto!important\">" + "<a class='btn btn-primary btn-outline' onclick=\"javascrpt:CreateAba('" + nameLayout + "','" + layoutID + "','" + titleMenu + "','" +

                    dados + "'," + false + ",'" + containerType + "','" + forcingTemplate + "')\">Liberar Crédito</a>";
                    lines += htmlBotaoExcluir;
                    lines += "</td>";
                    lines += "</tr>";

                    acao += "<a class='btn btn-primary btn-outline' onclick=\"javascrpt:CreateAba('" + nameLayout + "','" + layoutID + "','" + titleMenu + "','" + dados + "'," + false + ",'" + containerType + "','" + forcingTemplate + "')\">Liberar Crédito</a>";
                    acao += htmlBotaoExcluir;

                }
                else if (proximoStatus == "Picking") {

                    lines += "<td style=\"width:auto!important\">" +
                       "<a class=\"btn btn-primary btn-outline\" href=\"" + valueID + "\" onClick=\"onClickPicking('" + valueID + "')\">Fazer Picking</a>";
                    //"<a class=\"btn btn-primary btn-outline\" href=\"" + valueID + "\" onClick=\"f_aba('romaneio','358188ae-0b11-438f-8a4a-9bebb7943d44','Picking','false', '" + returnCookie("EnterpriseID") + "')\">Fazer Picking</a>";

                    lines += htmlBotaoExcluir;

                    lines += "</td>";
                    lines += "</tr>";

                    //acao += "<a class=\"btn btn-primary btn-outline\" href=\"" + valueID + "\" onClick=\"f_aba('romaneio','358188ae-0b11-438f-8a4a-9bebb7943d44','Picking','false', '" + returnCookie("EnterpriseID") + "')\">Fazer Picking</a>";
                    acao += "<a class=\"btn btn-primary btn-outline\" href=\"" + valueID + "\" onClick=\"onClickPicking('" + valueID + "')\">Fazer Picking</a>";
                    acao += htmlBotaoExcluir;
                }
                else if (proximoStatus == "Expedição") {

                    lines += "<td style=\"width:auto!important\">" +
                       "<a class=\"btn btn-primary btn-outline\" href=\"" + valueID + "\" onClick=\"f_aba('ly_Expedicao','e02eea99-7c78-4bd7-aed4-47d401d3e13b','Expedição','false', '" + returnCookie("EnterpriseID") + "&paramReferenceID=8862f239-5eb7-45dd-8f7e-0ad90fc1e9ea&Filtro=" + valueID + "')\">Expedição</a>";

                    lines += htmlBotaoExcluir;

                    lines += "</td>";
                    lines += "</tr>";

                    acao += "<a class=\"btn btn-primary btn-outline\" href=\"" + valueID + "\" onClick=\"f_aba('ly_Expedicao','e02eea99-7c78-4bd7-aed4-47d401d3e13b','Expedição','false', '" + returnCookie("EnterpriseID") + "&paramReferenceID=8862f239-5eb7-45dd-8f7e-0ad90fc1e9ea&Filtro=" + valueID + "')\">Expedição</a>";

                    acao += htmlBotaoExcluir;


                }
                else if (proximoStatus == "Faturado") {

                    lines += "<td style=\"width:auto!important\">" +
                      "<a id=\"btnEntrega\" onClick=\"Faturar('" + valueID + "');\" class=\"btn btn-primary btn-outline\" href=\"#\">Gerar Nota</a>";
                    lines += htmlBotaoExcluir;

                    lines += "</td>";
                    lines += "</tr>";

                    acao += "<a id=\"btnEntrega\" onClick=\"Faturar('" + valueID + "');\" class=\"btn btn-primary btn-outline\" href=\"#\">Gerar Nota</a>";
                    acao += htmlBotaoExcluir;

                }
                else if (proximoStatus == "Em Entrega") {

                    lines += "<td style=\"width:auto!important\">" +
                       "<a class=\"btn btn-primary btn-outline\" onClick=\"f_aba('expedicao','dfd85e30-8f8e-4038-bed4-2449551f5fa8','Expedição','true', '" +

                    returnCookie("EnterpriseID") + "')\">Expedição</a>";

                    lines += htmlBotaoExcluir;


                    lines += "</td>";
                    lines += "</tr>";

                    acao += "<a class=\"btn btn-primary btn-outline\" onClick=\"f_aba('expedicao','dfd85e30-8f8e-4038-bed4-2449551f5fa8','Expedição','true', '" + returnCookie("EnterpriseID") + "')\">Expedição</a>";

                    acao += htmlBotaoExcluir;

                }
                else if (proximoStatus == "Separado para entrega") {

                    lines += "<td style=\"width:auto!important\">" +
                        "<a id=\"btnEntrega\" onClick=\"ConfirmaEntrega('" + valueID + "');\" class=\"btn btn-primary btn-outline\" href=\"#\">Confirmar Entrega</a>";
                    lines += htmlBotaoExcluir;

                    lines += "</td>";
                    lines += "</tr>";

                    acao += "<a id=\"btnEntrega\" onClick=\"ConfirmaEntrega('" + valueID + "');\" class=\"btn btn-primary btn-outline\" href=\"#\">Confirmar Entrega</a>";
                    acao += htmlBotaoExcluir;
                }
                else if (proximoStatus == "Parcialmente entregue") {
                    lines += "<td style=\"width:auto!important\">" +
                      "<a id=\"btnEntrega\" onClick=\"ConfirmaEnvioEntrega('" + valueID + "');\" class=\"btn btn-primary btn-outline\" href=\"#\">Enviar para Entrega</a>";

                    lines += htmlBotaoExcluir;

                    lines += "</td>";

                    lines += "</tr>";

                    acao += "<a id=\"btnEntrega\" onClick=\"ConfirmaEnvioEntrega('" + valueID + "');\" class=\"btn btn-primary btn-outline\" href=\"#\">Enviar para Entrega</a>";

                    acao += htmlBotaoExcluir;
                }
                else if (proximoStatus == "Venda Iniciada") {
                    lines += "<td style=\"width:auto!important\">";
                    lines += htmlBotaoExcluir;
                    lines += "</td>";
                    lines += "</tr>";

                    acao += htmlBotaoExcluir;
                }
                else {
                    lines += "<td style=\"width:auto!important\">" + "</td>";
                    lines += "</tr>";
                }



            }

            //$("#" + containerID + "_table table tbody").append(lines);
            //lines = "";
            if (grid == true) {
                row["acao"] = acao;

                if (row) {
                    data.push(row);
                }
                lines = "";
            }
        }


    }



    var url = window.location.search.replace("?", "");
    var items = url.split("&");


    //remove a classe selecionada da linha
    var selected = $("#" + containerID + "_table table tbody").find("tr.selected")
    if (selected.length) {
        selected.replaceWith(lines);
    }
    else {
        if (grid == true) {
            $("#" + containerID + "_table table").bootstrapTable('destroy');
            if (data) {
                if (data.length > 0) {
                    var tableGrid = $("#" + containerID + "_table table th");


                    $("#" + containerID + "_table table").bootstrapTable('destroy').bootstrapTable({
                        data: data
                    });

                    for (var i = 0; i < tableGrid.length; i++) {
                        //var x = document.getElementById(tableGrid[i].id).attributes;
                        var x = tableGrid[i].attributes;

                        if (x) {
                            if (x.length > 0) {
                                for (var j = 0; j < x.length; j++) {
                                    //document.getElementById("demo").innerHTML += "  -  " + x[i].value;
                                    //if (x[j].name != "id") {
                                    //document.getElementById(tableGrid[i].id).setAttribute(x[0].attributes[j].name, x[0].attributes[j].value);
                                    $("[data-field='" + $(tableGrid[i]).attr("data-field") + "']").attr(x[j].name, x[j].value);
                                    //}
                                }
                            }
                        }

                    }
                }
            }
        } else {
            $("#" + containerID + "_table table tbody").append(lines);
        }

        var contador = 0;
        var teste = $("#" + containerID + "_table table tbody input.icheck-grey");
        $("#" + containerID + "_table table tbody input.icheck-grey").each(function () {
            var idcheckbox = this.id;
            var cor = $("#" + idcheckbox).attr("data-color");
            contador = contador + 1;
            $("#" + idcheckbox).iCheck({checkboxClass: 'icheckbox_flat-' + cor, radioClass: 'iradio_flat-blue', increaseArea: '20%' });
            //carregaIcheckCheckBoxColor(idcheckbox, cor);
            var eventClick = $("#" + idcheckbox).attr("onclick");
            //var namespaces = eventClick.split("(");
            var funcName = eventClick; //namespaces[0].replace("(", "");

            $("#" + idcheckbox).on('ifClicked', function () {
                var args = this;
                if (funcName != "" && funcName != undefined && funcName != null) {

                    executeFunctionByName(funcName, window, args);
                    //funcName = funcName + "(line)";
                    //window[funcName](args);
                    //executeFunctionByName(onClickName + ".");
                }
            });
        });

    }
    //sharpGridPager(containerID)
    //if (clearFormIgnore == true) {

    //} else {
        //ClearForm(containerID, false);
    //}

    if (containerID.split("_")[0] == "474181e6-f8d3-4a8e-9bdb-a12528941aff" || containerID.split("_")[0] == "2e9ecdc9-9d91-4750-958f-d8f530e77e13" || containerID.split("_")[0] == "b63c19ea-dba3-411f-a5c0-fed30483abac" || containerID.split("_")[0] == "87cc1ae4-a188-498b-83a6-ae137b91c76b" || containerID.split("_")[0] == "9ce79fa0-fd8a-4cd1-b1be-3878e455409b" || containerID.split("_")[0] == "2d03e5da-ef21-4f65-9dee-de305246c737") {
        (function (document, window, $) {
            'use strict';

            $('.popup-modal-ajax').magnificPopup({
                type: 'ajax',
                alignTop: true,
                overflowY: 'scroll',
                closeOnContentClick: false,
                closeBtnInside: false,
                modal: true
            });

            $(document).on('click', '.popup-modal-ajax-close', function (e) {
                e.preventDefault();
                $.magnificPopup.close();
            });
        })(document, window, jQuery);
    }

    $vl_qt_itens.val(($('[data-field="vl_qt_itens"]').length));
    mudaTotalGrid(containerID);
    //reinicalizaContadores(containerID);

    $(".dropdown-toggle").dropdown();
}



function mudaTotalGrid(containerID, parameters) {
    var element = $("#" + containerID + "_table");
    var dataRows = element.find('tbody tr');
    var footer = element.find('tfoot th');

    var valorunitario = 0;
    var valordesconto = 0;
    var valortotal = 0;

    if (containerID.indexOf("828810bd-5e6f-4dd9-a66c-b7e9be94fdd8") != -1) //compra
    {
        for (var j = 0; j < (dataRows.length) ; j++) {
            for (var k = 0; k < (dataRows[j].children.length) ; k++) {
                if (dataRows[j].children[k].getAttribute("data-controlid") == "ae387a75-5177-49ab-9ab1-97fb9139d912") {
                    valorunitario = valorunitario + parseFloat(dataRows[j].children[k].innerText.replace(".", "").replace(",", "."));
                }
                if (dataRows[j].children[k].getAttribute("data-controlid") == "0d04e614-776d-45a4-886e-a329bb824fe8") {
                    valordesconto = valordesconto + parseFloat(dataRows[j].children[k].innerText.replace(".", "").replace(",", "."));
                }

                if (dataRows[j].children[k].getAttribute("data-controlid") == "6dc640ac-3f36-45da-85b3-6401ed6ae54a") {
                    valortotal = valortotal + parseFloat(dataRows[j].children[k].innerText.replace(".", "").replace(",", "."));
                }
            }
        }

        footer[4].innerText = valorunitario.toFixed(2);
        footer[5].innerText = valordesconto.toFixed(2);
        footer[6].innerText = valortotal.toFixed(2);

    } else if (containerID.indexOf("857a1f6d-887b-4a08-b5b3-646ea4457c04") != -1) //venda
    {


        for (var j = 0; j < (dataRows.length) ; j++) {
            for (var k = 0; k < (dataRows[j].children.length) ; k++) {
                if (dataRows[j].children[k].getAttribute("data-controlid") == "99ed2216-1c35-4f9d-a4a6-b4ea9ecf8de6") {
                    valorunitario = valorunitario + parseFloat(dataRows[j].children[k].innerText.replace(".", "").replace(",", "."));
                }
                if (dataRows[j].children[k].getAttribute("data-controlid") == "72dec1e4-0381-44ca-ae24-9e766b2ac9c3") {
                    valordesconto = valordesconto + parseFloat(dataRows[j].children[k].innerText.replace(".", "").replace(",", "."));
                }

                if (dataRows[j].children[k].getAttribute("data-controlid") == "3df9831f-ccc7-4c03-be17-50018436ee8e") {
                    valortotal = valortotal + parseFloat(dataRows[j].children[k].innerText.replace(".", "").replace(",", "."));
                }
            }
        }

        footer[4].innerText = valorunitario.toFixed(2);
        footer[5].innerText = valordesconto.toFixed(2);
        footer[7].innerText = valortotal.toFixed(2);
    }
    else
        return;

};

function fillgrid(containerID, id, layoutID){
    
    $.ajax({
        url: returnCookie("urlPlataform") + "/api/containergrid/" + containerID + "/" + id, 
        async: false,
        success: function(result){
        if (result) {
            fillScreen(result, "MASTERDETAIL", layoutID);
        }
        
    }});
}

function deleteRowGrid(button, containerID ,valueID, layoutID){
    var formID = containerID;

    if (containerID) {
        var arrayFormID = containerID.split("_");
        containerID = arrayFormID[0];
    }

    var url = getGlobalParameters("urlPlataform") + "/api/DeleteData";
      
    loaderImage(formID, true);
   
    confirm("Deseja deletar este item?",function(){
    if (valueID) {
        var id = valueID;

        $.ajax({
            contentType: "application/json",
            accepts: "application/json",
            url: url + "/" + containerID + "/" + id + "/", 
            type: "GET",
            success: function(result){                    
                if (result.status) {
                    if (result.status == "success") {
                        notification({
                            messageText: "Deletado com sucesso", messageTitle: "OK", fix: false, type: "ok", icon: "thumbs-up"
                        });

                        ClearForm(formID, true);
                        if (layoutID == undefined || layoutID == "undefined" || layoutID == "") {
                            layoutID = $("#" + formID).attr("layoutid");
                        }
                        var elementID = $($("#" + formID.replace(containerID,layoutID))[0]).find("[name*='_PK']")
                        
                        if (elementID.length == 0) {
                            elementID = $("#" + formID + "_panel").find("[name*='_PK']");
                        }

                        var id = "";

                        if (elementID.length > 0) {
                            id = $(elementID[0]).val()
                            if (!id) {
                                id = "*";
                            }
                            fillgrid(containerID, id, layoutID)
                        }
                        //editGridLine("", metadataContainerID, id)

                    }else{
                        notification({
                            messageText: result.message, messageTitle: "Ops", fix: false, type: "warning", icon: "thumbs-down"
                        });
                    }
                } else{
                    notification({
                        messageText: result.originalError.info.message, messageTitle: "Ops", fix: false, type: "warning", icon: "thumbs-down"
                    });
                }
                loaderImage(formID,false);      
            }
        })
    }
},function(){
    loaderImage(formID,false); 
})

    

}

function gridedit(id, source){
    var tabela = $("#" + id + " th[style!='display:none']");
		if(!$(tabela).hasClass("jsgrid-header-cell")){
            if(tabela){
                if(tabela.length > 0){ 
                    $("#" + id +" tfoot").html("");
                    tabela = $("#" + id + " th[style!='display:none']");

                    for (var i = 0; i < tabela.length; i++) {
                        var fielddata; 
                        if(i == 0){
                            fielddata = { type: "control" };
                        }else{
                            var text = $(tabela[i]).html();
                            fielddata =  { name: text, type: "text", width: 150 };                            
                        }
                        source.push(fielddata)
                    }
                    //source.push({ type: "control" })
                    $("#" + id).jsGrid({
                        width: "100%",
                        height: "300px",                 
                        pageSize: 7,
                        inserting: true,
                        editing: true,
                        sorting: true,
                        paging: true,
                 
                 
                        fields: source
                    });
                }
            }
            
         
           
        }
		
	
    


//    $("#" + id).tabullet({
//		action: function (mode, data) {
//			console.dir(mode);
//			if (mode === 'save') {
//				source.push(data);
//			}
//			if (mode === 'edit') {
//				for (var i = 0; i < source.length; i++) {
//					if (source[i].id == data.id) {
//						source[i] = data;
//					}
//				}
//			}
//			if(mode == 'delete'){
//				for (var i = 0; i < source.length; i++) {
//					if (source[i].id == data) {
//						source.splice(i,1);
//						break;
//					}
//				}
//            }
            
//            gridedit(id, source);
//		}
//	});
}