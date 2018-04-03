var gridButtons = new Object();
var tabGuidABA;

function CreateAba(nameLayout, layoutID, titleMenu, dados, navigation, containerType, forcingTemplate, layoutType, callInstance) {
    var enterpriseID = returnCookie("EnterpriseID");
    //f_aba(nameLayout,layoutID,titleMenu,false, enterpriseID);

    var tabGenID = guid();
    var EnterpriseName = "";
    layoutID = layoutID.toUpperCase();

    switch (containerType) {
        case "MODAL":
            modal = true;

            $("#alertaModal").html("<div layoutid='" + layoutID + "_" + tabGenID + "' id='alertaModal_panel' class='panel' style='margin-bottom: 0px!important;' callInstance='" + callInstance + "'><div class='panel-body'></div></div>");

            $("#mensagem").html("");

            $('#alertaModalShow').modal();

            //função efetua o close do Modal para que os dados de um modal não carregue em outro.
            $('#alertaModalShow').on('hidden.bs.modal', function (e) { $("#alertaModal_panel").remove(); })

            formID = "alertaModal";

            var tab = "<li layoutid='" + layoutID + "_" + tabGenID + "' class='active'><a href='#" + tabGenID + "' data-toggle='tab' title='" + EnterpriseName + "'>" + titleMenu + "&nbsp&nbsp<img src='images/loader.gif' height='15px' /></a></li>";
            $("#" + formID).append(tab);
            $("#" + formID).append("<div class='tab-pane fade in  controls-recipient active' id='" + tabGenID + "'>");

            break;
        default:
            $("#controls-recipient > .active").removeClass("active");
            $("#controls-tabs .active").removeClass("active");
            var tab = "<li layoutid='" + layoutID + "_" + tabGenID + "' class='active'><a href='#" + tabGenID + "' data-toggle='tab' title='" + EnterpriseName + "'>" + titleMenu + "&nbsp&nbsp<img src='images/loader.gif' height='15px' /></a></li>";
            $("#controls-tabs").append(tab);
            $("#controls-recipient").append("<div class='tab-pane fade in  controls-recipient active' id='" + tabGenID + "'>");
            break;
    }

    fillTab(nameLayout,layoutID,titleMenu,false, enterpriseID, tabGenID, function(){
        openData(dados, layoutID, tabGenID);        
        
        if(callInstance){
            callInstance()
        }
        
    })


    
}

function openData(dados, layoutID, tabGenID){
var filtro = "";

    var arraydados=dados.split("&");
    for (let index = 0; index < arraydados.length; index++) {
        var linha = arraydados[index];
        if (linha.indexOf("Filtro") > -1) {
            filtro = linha.replace("Filtro=", "");
            break;
        }
        
    }
    if (filtro) {
        //filleditnavigation("154099BE-C2A6-E35B-1DB2-67ABF0A4C4FB","ee5b8618-b239-49ca-86a9-6975134c8713", "" ,"942bf34b-932a-cbb1-c745-4b23b69934b6_nav" );
        if ($("[data-principaltabgen='" + tabGenID + "'").attr("data-tabgenlayout")) {
            tabGenID = $("[data-principaltabgen='" + tabGenID + "'").attr("data-tabgenlayout");
        }
        
        if (tabGenID) {
            filleditnavigation(filtro, layoutID, "", tabGenID)
        }
        
    }
    
}

function f_aba(nameLayout,layoutID,titleMenu,loadData, enterpriseID){

    if($("[layoutid*='" + layoutID + "']").length > 0){
        return;
    }

    var tabGenID = guid();
    var EnterpriseName = "";
    layoutID = layoutID.toUpperCase();
    $("#controls-recipient > .active").removeClass("active");
    $("#controls-tabs .active").removeClass("active");
    var tab = "<li layoutid='" + layoutID + "_" + tabGenID + "' class='active'><a href='#" + tabGenID + "' data-toggle='tab' title='" + EnterpriseName + "'>" + titleMenu + "&nbsp&nbsp<img src='images/loader.gif' height='15px' /></a></li>";
    $("#controls-tabs").append(tab);
    $("#controls-recipient").append("<div class='tab-pane fade in  controls-recipient active' id='" + tabGenID + "'>");

    tabGenID = fillTab(nameLayout,layoutID,titleMenu,loadData, enterpriseID, tabGenID)

    //if (loadData == "true") {
    //    var dados = "&Filtro=*"
    //    openData(dados, layoutID, tabGenID);
    //}
    
}

function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
  
function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

function fechaAba(id) {
    $("#controls-tabs li a[href='#" + id + "']").closest("li").remove();
    $("#controls-recipient #" + id).remove();
}

function atualizaAba(formID, layoutID, tabGenID, forcingTemplate, layoutType, urlRenderLayout, urlRenderLayoutData, titleMenu) {
    fechaAba(tabGenID);

    var enterpriseID = returnCookie("EnterpriseID");
    f_aba(formID,layoutID,titleMenu,false, enterpriseID)

    //var loadData = "";
    //var enterpriseID = "";
    //fillTab(formID,layoutID,titleMenu,loadData, enterpriseID, tabGenID)
}
function fillTab(nameLayout,layoutID,titleMenu,loadData, enterpriseID, tabGenID, callback){
    
    layoutID = layoutID.toUpperCase();
    $.ajax({async:true, url: returnCookie("urlPlataform") + "/api/layout/" + layoutID, success: function(result){	
        var tabGenID2 = guid();
        tabGuidABA = tabGenID2;
        gridButtons = fillButtonGrid("1df8627a-f0a4-4c50-8a1c-eb6d7d5d04e5_" + tabGenID2 + "_table", tabGenID2);
        result[0].html = replaceAll(result[0].html, result[0].tabgenid, tabGenID2)
       // result[0].html = replaceAll(result[0].html, "undefined", "");
       // result[0].html = replaceAll(result[0].html, "null", "");

        var forcingTemplate = "";
        var layoutType = "";
        var urlRenderLayout = "";
        var urlRenderLayoutData = "";
        //var titleMenu = "";
        var data = result[0].html;
        var formID = layoutID;

        //Tira o load da aba
        $("#controls-tabs li a[href='#" + tabGenID + "'] img").replaceWith(" <span class='tabControls'>&nbsp&nbsp<i class='fa fa-refresh' onClick='atualizaAba(\"" + layoutID + "\",\"" + layoutID + "\",\"" + tabGenID + "\",\"" + forcingTemplate + "\",\"" + layoutType + "\",\"" + urlRenderLayout + "\",\"" + urlRenderLayoutData + "\",\"" + titleMenu + "\");'></i>&nbsp&nbsp<i class='icon wb-close-mini' onClick='fechaAba(\"" + tabGenID + "\");'></i></span>")
        
        $("#" + tabGenID).append(result[0].html);
        panel_change_start(tabGenID + " > form > .panel  > .panel-body > div > .panel-nav ");
        $("[data-tabgenlayout='" + tabGenID2 + "']").attr("data-principaltabgen",tabGenID);
        tabGenID = tabGenID2;
        var wizard = $("[data-guidwizard='" + tabGenID + "']");
        $("textarea").val("");
        $("[value='undefined']").val("");
        $("[value='null']").val("");
        //gridButtons = fillButtonGrid("194536c8-48b0-43de-b464-cb9b5da4683e_" + tabGenID + "_table", tabGenID);
        
        for (var i = 0; i < wizard.length; i++) {
            if ($("#" + wizard[i].id).attr("data-guidwizard")) {
                if ($("#" + wizard[i].id).html().indexOf("<form") < 0) {
                    var htmlobj = $.parseHTML(data)
                    var idform = $(wizard[i]).attr("data-containeridwizard") + "_" + $(wizard[i]).attr("data-guidwizard");
                    var htmldiv = $(wizard[i]).html();

                    $(wizard[i]).html("<form id='" + idform + "' >" + htmldiv + "</form>");
                    //document.getElementById(wizard[i].id).innerHTML = "<form id='" + idform + "' >" + htmldiv + "</form>";
                    //sharpGrid(idform);
                }
            }

            if ($(wizard[i]).attr("containeronload")) {
                eval($(wizard[i]).attr("containeronload"));
            }
        }

        var inputs = $("#" + tabGenID + " input");
        for (var i = 0; i < inputs.length; i++) {
            var input = inputs[i];
            if ($(input).val() == null || $(input).val() == "null") {
                $(input).val("");
                $(input).attr("");
            }

            //Mascara
            var marcara = $(input).attr("data-mask");
            if (marcara) {
                var typecontrol = $(input).attr("typecontrol");
                var reverse = true;

                if (typecontrol) {
                    switch (typecontrol) {
                        case "text":
                            reverse = false;
                            break;
                        default:
                            break;
                    }
                }        

                $(input).mask(marcara, {
                    reverse: reverse,
                    translation: {
                        '#': {
                            pattern: /-|\d/,
                            recursive: true
                        }
                    },
                    onChange: function (value, e) {
                        var target = e.target,
                            position = target.selectionStart; // Capture initial position

                        //target.value = value.replace(/(?!^)-/g, '').replace(/^,/, '').replace(/^-,/, '-').replace(/^(\.-)|^(-\.)/, '-');

                        //target.selectionEnd = position; // Set the cursor back to the initial position.
                    }
                });
            }

            //chave da empresa
            var fieldName = $(input).attr("data-field");
            if (fieldName == "id_empresa") {
                $(input).val(returnCookie("EnterpriseID"));
            }
        }

        getDropdownHTML(layoutID, tabGenID);

        $(".panel-body").css("height","100%")

        //Tira o load da aba
        $("#controls-tabs li a[href='#" + tabGenID + "'] img").replaceWith(" <span class='tabControls'>&nbsp&nbsp<i class='fa fa-refresh' onClick='atualizaAba(\"" + formID + "\",\"" + layoutID + "\",\"" + tabGenID + "\",\"" + forcingTemplate + "\",\"" + layoutType + "\",\"" + urlRenderLayout + "\",\"" + urlRenderLayoutData + "\",\"" + titleMenu + "\");'></i>&nbsp&nbsp<i class='icon wb-close-mini' onClick='fechaAba(\"" + tabGenID + "\");'></i></span>")
        //$(".form-control").mask($(".form-control").attr("data-mask"));

        //Binda o plugin de data
        $("[data-nativedatatype='Data']").datetimepicker({
            lang: "pt",
            timepicker: false,
            format: 'd/m/Y',
            formatDate: 'Y/m/d',
        });

        $("[data-nativedatatype='DataHora']").datetimepicker({
            lang: "pt",
            timepicker: false,
            format: 'd/m/Y',
            formatDate: 'Y/m/d',
        });

        //Binda o checkbox
        $(".icheckbox_flat-blue").css("display", "-webkit-inline-box");
        $(".icheckbox_flat-blue").removeClass("icheckbox_flat-blue");
        $(".icheck-grey").iCheck({
            checkboxClass: 'icheckbox_flat-blue',
            radioClass: 'iradio_flat-blue',
            increaseArea: '20%' // optional
        });

        

        //Binda o Wizard

        if ($("[tabgenid=" + tabGenID + "]").length > 1) {
            var defaults = $.components.getDefaults("wizard");
            var options = $.extend(true, {}, defaults, {
                onBeforeShow: function () {

                    var layout = $(".profile-tab .active");
                    var layoutid = "";
                    if (layout) {
                        if (layout.length > 0) {
                            layoutid = $(layout[0]).attr("layoutid");
                        }
                    }

                    var formObject;
                    var containerObject;
                    if (layoutid) {
                        formObject = $("#" + layoutid).find(".current");

                        if (formObject.length == 0) {
                            formObject = $("#" + layoutid).find(".done");
                        }

                        if (formObject.length > 0) {
                            var formid = $(formObject[0]).attr("tabgenid");
                            var containerid = $(formObject[0]).attr("containerid");

                            /* Não salva ao mudar de página do Wizard */
                            if (containerid == '9c64ffa0-2156-4dd9-8104-b5be352b4b5e' || containerid == '72cabf04-07b8-4706-aa17-0d2ea8f5e8d8' || containerid == 'c93dad75-a0b9-4c60-aedd-d6e27bf9a616')
                                return;

                            containerObject = $("#" + containerid + "_" + formid);
                        }
                    }
                    //var formObject = $(".wizard-pane .active").find("form");
                    if (containerObject) {
                        if (containerObject.data('original_serialized_form') !== containerObject.serialize()) {
                            if (containerObject.length > 0) {
                                containerObject = containerObject[0];
                            }
                            //$(containerObject).find("#Gravar").click();
                        }
                    }
                    

                    //$("html, body").animate({
                    //    scrollTop: 0
                    //}, 600);

                },
                onBeforeHide: function () {
                    //$("html, body").animate({ scrollTop: 0 }, 600);
                    //onSave(targetID, id, containerID, metadataContainerID, layoutID, false, form.onAfterSavingName);
                },
                onBack: function () {
                    //$("html, body").animate({ scrollTop: 0 }, 600);
                },
                onFinish: function () {
                    var layout = $(".profile-tab .active");
                    var layoutid = "";
                    if (layout) {
                        if (layout.length > 0) {
                            layoutid = $(layout[0]).attr("layoutid");
                        }
                    }

                    var formObject;
                    var containerObject;
                    if (layoutid) {
                        formObject = $("#" + layoutid).find(".current");

                        if (formObject) {
                            if (formObject.length == 0) {
                                var arraylayoutid = layoutid.split("_");
                                if (arraylayoutid) {
                                    if (arraylayoutid.length > 1) {
                                        formObject = $("#" + arraylayoutid[1]).find(".current");
                                    }
                                }
                            }
                        }

                        
                        if (formObject.length > 0) {
                            var formid = $(formObject[0]).attr("tabgenid");
                            var containerid = $(formObject[0]).attr("containerid");
                            containerObject = $("#" + containerid + "_" + formid);

                        }
                    }
                    //var formObject = $(".wizard-pane .active").find("form");
                    if (containerObject.data('original_serialized_form') !== containerObject.serialize() && layoutid.includes("07ca6db2-a587-4a59-aa82-95f1795bdf68") == false) {
                        if (containerObject.length > 0) {
                            containerObject = containerObject[0];
                        }
                        //$(containerObject).find("#Gravar").click();
                    }

                    //if ($(".steps.steps-xs.row").find("span.step-title")[0].innerHTML == "Vendas") {
                    layoutid = layoutid.toLowerCase();

                    if (layoutid.includes("ee5b8618-b239-49ca-86a9-6975134c8713")) {
                        bt_gerarVenda();
                    }
                        //else if ($(".steps.steps-xs.row").find("span.step-title")[0].innerHTML == "Compras") {
                    else if (layoutid.includes("cacd9a15-c86d-4014-9a38-8ed7579905bb")) {
                        finalizarCompraJS();
                    }
                        //else if ($(".steps.steps-xs.row").find("span.step-title")[0].innerHTML == "Itens") {
                    else if (layoutid.includes("e02eea99-7c78-4bd7-aed4-47d401d3e13b")) {
                        AlterStatusRomaneioJS();
                        f_aba('romaneio', '358188AE-0B11-438F-8A4A-9BEBB7943D44', 'Picking', 'false', returnCookie("EnterpriseID"));
                    }
                        //else if ($(".steps.steps-xs.row").find("span.step-title")[0].innerHTML == "Nota Fiscal") {
                        //else if (layoutid.includes("07ca6db2-a587-4a59-aa82-95f1795bdf68")) {
                        //LancaEstoqueNota();
                        //f_aba('layNFe', '7df84e2b-376c-4af9-8d16-42ad021b7542', 'Controle de NF-e', 'true', returnCookie("EnterpriseID"));
                        //}
                        //else if ($(".steps.steps-xs.row").find("span.step-title")[0].innerHTML == "Picking") {
                    else if (layoutid.includes("358188ae-0b11-438f-8a4a-9bebb7943d44")) {
                        AlterStatusRomaneioJS();
                    }
                        //else if ($(".steps.steps-xs.row").find("span.step-title")[0].innerHTML == "Entrada Simples de Material") {
                    else if (layoutid.includes("a47ab0f5-98e4-4cde-9bf6-6e7f93ea4390")) {
                        finalizarEntradaSimplesJS();
                    }
                        //else if ($(".steps.steps-xs.row").find("span.step-title")[0].innerHTML == "Ordem de Produção") {
                    else if (layoutid.includes("01b095a1-dd9b-45b5-ab68-8b1f5c4dbffc")) {
                        finalizarOrdemProducaoJS();
                    }
                    else {
                        //OpenFormSearch(recipient);
                        $("#" + layoutid + " .panel-nav").find("#Filtrar").click();
                        //toogleColapseContainer($(formObject).find("#Gravar").parents(".innerTab"), true)
                    }

                    var onfinish = $("#" + layoutid);
                    if (onfinish) {
                        if (onfinish.length > 0) {
                            for (var i = 0; i < onfinish.length; i++) {
                                var onloadName = $(onfinish[i]).attr("data-finish");
                                eval(onloadName);
                            }
                        }
                    }
                }
            });

            $("#" +tabGenID + ">.panel .wizard-buttons").html("");
            
                        //var wizard = $("#" + layoutID + "_" + tabGenID + ">.panel").wizard(options).data('wizard');
            var wizard = $("#" +tabGenID + ">.panel").wizard(options).data('wizard');
            

        }


        $("form").formValidation({
            framework: 'bootstrap'

        })
        .on('success.form.fv', function (e) {
            // Reset the message element when the form is valid
            $('.summary-errors').html('');
            $('.summary-errors').hide();
        })
        .on('err.field.fv', function (e, data) {
            // data.fv     --> The FormValidation instance
            // data.field  --> The field name
            // data.element --> The field element
            $('#' + data.fv.$form[0].id + ' > .summary-errors').show();

            // Get the messages of field
            var messages = data.fv.getMessages(data.element);

            // Remove the field messages if they're already available
            $('#' + data.fv.$form[0].id + ' > .summary-errors').find('li[data-field="' + data.field + '"]').remove();
            if ($('#' + data.fv.$form[0].id + ' > .summary-errors').find('ul').length == 0) {

                var message = getObjMessageJS("7");
                var mess = "";

                if (message) {
                    if (message.title) {
                        if (message.title.length > 0) {
                            mess = message.title[0].text;
                        }
                    }
                }

                $('#' + data.fv.$form[0].id + ' > .summary-errors').append('<p>' + mess + '</p>');
                $('#' + data.fv.$form[0].id + ' > .summary-errors').append('<ul/>');
            }

            // Loop over the messages
            for (var i in messages) {
                // Create new 'li' element to show the message

                var label = $(data.element.parents('div')[1]).find('label').html();
                if (label == undefined) {
                    label = $(data.element.parents('div')[2]).find('label').html();
                }
                if (label == undefined) {
                    label = $(data.element.parents('div')[3]).find('label').html();
                }

                $('<li/>')
                  .attr('data-field', data.field)
                  .wrapInner(
                    $('<a/>')
                    .attr('href', 'javascript: void(0);')
                    // .addClass('alert alert-danger alert-dismissible')

                    .html(messages[i] + " no campo " + label)
                    .on('click', function (e) {
                        // Focus on the invalid field
                        data.element.focus();
                    })
                  ).appendTo('#' + data.fv.$form[0].id + ' > .summary-errors > ul');
            }

            // Hide the default message
            // $field.data('fv.messages') returns the default element containing the messages
            data.element
              .data('fv.messages')
              .find('.help-block[data-fv-for="' + data.field + '"]')
              .hide();
        })
        .on('success.field.fv', function (e, data) {
            // Remove the field messages
            $('#' + data.fv.$form[0].id + ' > .summary-errors > ul').find('li[data-field="' + data.field + '"]').remove();
            var formfv = $(".wizard-pane.active").find("form");

            if (formfv.length == 0) {
                formfv = $(".panel > .panel-body > .tab-content.tab-border > .tab-pane.active > form");
            }

            var fvv = formfv.data('formValidation');

            if (fvv != undefined && fvv != "undefined") {
                if (fvv.isValid()) {
                    $('#' + data.fv.$form[0].id + ' > .summary-errors').hide();
                }
            }

        }); 
        
        if(callback){
            callback();
        }
        
        if (loadData == "true") {
            var dados = "&Filtro=*"
            openData(dados, layoutID, tabGenID);
        }

    }});
    return tabGenID;
}



function sharpGrid(containerID) {
    //define a tabela
    var table = $("#" + containerID + "_table table");
    //marcação nas linhas para que a paginação contabilize todas as linhas inicialmente
    $("#" + containerID + "_table table tbody tr").addClass("filtered");
    //funcao que atribui o mecanismo de search nos campos da tabela
    sharpGridSearch(containerID);
    sharpGridPager(containerID);
    //atribuição de evento onde, ao incluir ou excluir itens da tabela, sejam novamente chamadas as funcoes de paginacao e edicao
    if (table) {
        table.bind('DOMNodeInserted DOMNodeRemoved',
            function (event, item) {
                sharpGridPager(containerID);                
            });
    }
}

function sharpGridSearch(containerID) {

    var table = $("#" + containerID + "_table table");
    var classSharpGrid;
    var idSharpGrid;
    var divSharpGrid;
    var inputSearch;

    classSharpGrid = "sharpGrid";
    idSharpGrid = containerID + "_sharpGrid";
    idSearchBox = containerID + "_searchBox";

    if (!$("#" + idSharpGrid).length) {
        divSharpGrid = "<div class=\"fixed-table-body " + classSharpGrid + "\" id=\"" + idSharpGrid + "\" ></div>";

        inputSearch = "<div class=\"searchBox\">"
        inputSearch += "<div class='form-group' style=\"height:35px;\">"
        inputSearch += "<div class='control-group col-md-3' style=\"padding: 0; position: absolute; right: 10px;\">"

        inputSearch += "<input data-serializable='false' placeholder=\"Buscar...\" id=\"" + idSearchBox + "\" type=\"text\" class='form-control'/>"

        inputSearch += "</div>"
        inputSearch += "<label class='col-md' style=\"position:absolute;right: 15px; z-index: 1; top: 1%;\"><i class='fa fa-search'></i></label>"
        inputSearch += "</div>"
        inputSearch += "</div>"




        table.wrap(divSharpGrid);
        $("#" + idSharpGrid).prepend(inputSearch)
        jQuery.expr[':'].contains = function (a, i, m) {
            return jQuery(a).text().toUpperCase()
                .indexOf(m[3].toUpperCase()) >= 0;
        };
        $("#" + idSearchBox).on("keyup", function () {
            var term = $(this).val()
            var listCell = table.find("td:contains(\'" + term + "\')").not(".no-search");
            var ind = [];
            listCell.each(function (i) {
                ind.push($(this).parent("tr"));
            })
            $("#" + containerID + "_table table tbody" + " tr").hide();
            if (ind.length) {
                $("#" + containerID + "_table table tbody" + " tr").removeClass("filtered");
                for (var i = 0; i < ind.length; i++) {
                    $(ind[i]).addClass("filtered");
                }
            }
            else {
                if (term.length > 0) {
                    $("#" + containerID + "_table table tbody" + " tr").removeClass("filtered");

                }
                else {
                    $("#" + containerID + "_table table tbody" + " tr").addClass("filtered");
                }
            }
            $("#" + containerID + "_table table tbody" + " tr.filtered").show();
            sharpGridPager(containerID);
        });
        sharpGridPager(containerID);
    }
}

function sharpGridPager(containerID) {
    var pageactive = $("[activepage='" + containerID + "_true']").html();
    var activeobject = $("[activepage='" + containerID + "_true']");

    $("#" + containerID + "_table").find(".pager").remove();

    var table = $("#" + containerID + "_table table")

    var currentPage = 0;

    if (pageactive) {
        currentPage = parseInt(pageactive)
        currentPage = currentPage - 1;
    }
    var numPerPage = 10;
    var numPage = $("#" + containerID + "_table").attr("data-numberpage");
    if (numPage) {
        numPerPage = numPage;
    }

    var $table = table;

    $table.bind('repaginate', function () {
        $table.find('tbody tr.filtered').hide().slice(currentPage * numPerPage, (currentPage + 1) * numPerPage).show();


    });

    $table.trigger('repaginate');
    var numRows = $table.find('tbody tr.filtered').length;
    var numPages = Math.ceil(numRows / numPerPage);
    var $pager = $('<div class="pager"></div>');

    for (var page = 0; page < numPages; page++) {
        $('<span class="page-number btn btn-default"></span>').text(page + 1).bind('click', {
            newPage: page
        }, function (event) {
            currentPage = event.data['newPage'];
            $table.trigger('repaginate');
            $(this).siblings().attr("activepage", containerID + "_false");
            $(this).siblings().attr("numberpage", currentPage);
            $(this).addClass('active')
                .switchClass("btn-default", "btn-primary", 1000, "easeInOutQuad")
                .siblings()
                .removeClass('active')
                .switchClass("btn-primary", "btn-default", 1000, "easeInOutQuad");

            $(this).attr("activepage", containerID + "_true");
            $(this).attr("numberpage", currentPage);
        }).appendTo($pager).addClass('clickable');
    }

    if (numPages > 0) {
        //$pager.insertAfter($table).find('span.page-number:first').addClass('active')
        //            .switchClass("btn-default", "btn-primary", 1000, "easeInOutQuad");

        $pager.insertAfter($table).find('span.page-number')
                          .switchClass("btn-default", "btn-default", 1000, "easeInOutQuad");

        if ($pager) {
            if ($pager.length > 0) {
                if ($pager[0].children) {
                    if ($pager[0].children.length > 0) {
                        var classList = $pager[0].children;
                        for (i = 0; i < classList.length; i++) {
                            if ($(classList[i]).html() == (currentPage + 1).toString()) {
                                $(classList[i]).attr("activepage", containerID + "_true");
                                $(classList[i]).addClass("active");
                                $(classList[i]).addClass("btn-primary")
                            }
                        }
                    }
                }
            }
        }
    }

    var btnnovodisabled = $("#" + containerID + "_btnnovo").hasClass("disabled");
    if (btnnovodisabled) {
        $("." + containerID.replace("_nav", "").replace("table_", "") + "_edit").addClass("disabled");
    } else {
        $("." + containerID.replace("_nav", "").replace("table_", "") + "_edit").removeClass("disabled");
    }
}


function sharpGridEditor(containerID) {
    var container = $("#" + containerID)
    var table = $("#" + containerID + "_table table tbody")
    var cells = table.find("td:not(.buttons)");
    cells.off();
    for (var i = 0; i < cells.length; i++) {
        $(cells[i]).on("click", function (e) {
            $(document).one('click', function () {
                sharpGridEditorClearCells(table)
            });
            if (!$(this).hasClass("editing")) {
                sharpGridEditorClearCells(table);
                $(this).addClass("editing")
                var cell = $(this)
                var cellData = $(this).find(".cellData")[0];
                controlID = cell.attr("data-controlid");
                var registerid = cell.attr("data-registerid");
                controle = container.find(
                    "input[data-controlid='" + controlID + "']," +
                    "select[data-controlid='" + controlID + "']," +
                    "textarea[data-controlid='" + controlID + "']" +
                    "span[data-controlid='" + controlID + "']"
                    ).not(".inlineEditor");


                if (controle.length) {
                    var newID = controle[0].id + "_inlineEditor";
                    var cellForm = $("<form  class=\"input-group sharpGridEditor\"></form>")
                    var cellFormID = controle[0].id + gerarGUID();
                    var buttonSave = $("<span id= " + controle[0].id + "_button  class=\"input-group-btn\"><a id='" + controlID + "_btngrid' href=\"#\" onclick=\"javascript:sharpGridEditorSave(this);\" class=\"btn btn-primary\"><i class=\"fa fa-save\"></i></a></span>");
                    cellForm.attr("id", cellFormID).addClass("inlineEditor");
                    cell.prepend(cellForm);
                    cellForm = $("#" + cellFormID);
                    switch (controle[0].type) {
                        case "text":
                            var control = controle;
                            controle = $(controle[0]).clone(true);


                            if (controle.length > 0) {
                                controle[0].id = newID;
                                var classe = controle[0].className;
                                controle[0].className = classe.replace("hidden", "");
                                $(controle[0]).attr("data-registerid", registerid);
                                value = $(cellData).text();
                                controle.val(value)
                                controle.keyup();
                                $(cellData).hide()


                                if ($(control[0]).attr("data-controlinputtype") == "TEXTCURRENCY") {
                                    var buttonCurrency = $(control[0]).parent().find("span").clone(true);
                                    if (buttonCurrency) {
                                        if (buttonCurrency.length > 0) {
                                            cellForm.prepend(buttonCurrency[0]);
                                            var panelCurrency = $("#" + $(control[0]).attr("id") + "_panel").clone(true);
                                            if (panelCurrency) {
                                                if (panelCurrency.length > 0) {
                                                    //var div = "<div id='" + $(control[0]).attr("id") + "_div'></div>";
                                                    var div = "<div class='' id='" + $(control[0]).attr("id") + "_div' style='position:absolute;z-index:100000; padding: 8px;'></div>";
                                                    cellForm.prepend(div);
                                                    $("#" + $(control[0]).attr("id") + "_div").prepend(panelCurrency[0]);

                                                }
                                            }
                                        }
                                    }
                                }


                                cellForm.prepend(controle);
                                cellForm.attr("control-type", "text")
                            }


                            break;
                        case "email":
                        case "password":
                            controle = $(controle[0]).clone(true);
                            if (controle.length > 0) {
                                controle[0].id = newID;
                                var classe = controle[0].className;
                                controle[0].className = classe.replace("hidden", "");
                                $(controle[0]).attr("data-registerid", registerid);
                                value = $(cellData).text();
                                controle.val(value)
                                controle.keyup();
                                $(cellData).hide()

                                cellForm.prepend(controle);
                                cellForm.attr("control-type", "text")
                            }

                            break;
                        case "checkbox":
                            controle = $(controle[0]).clone(true);
                            controle[0].id = newID;
                            $(controle[0]).removeClass()
                            controle[0].removeAttribute("style");
                            value = $(cellData).html();
                            value = (value == '<i class="fa fa-check"></i><span></span>') ? true : false;
                            $(cellData).hide()
                            var cellFormBackup = cellForm[0].outerHTML;
                            $(controle).className = "form-control";
                            $(controle).removeClass("hidden");
                            $(controle[0]).attr("data-registerid", registerid);
                            cellForm.prepend("<div></div>").prepend(controle);
                            carregaIcheckCheckBox(newID)

                            if (value) {
                                $("#" + newID).iCheck('check');
                            }
                            $("#" + newID).parent("div").wrap(cellFormBackup);

                            cellForm.attr("control-type", "checkbox")
                            break;
                        case "select-one":
                            controle = $(controle[0]).clone(true);
                            controle[0].id = newID;
                            value = $(cellData).text();
                            controle.find("option").filter(function () {
                                return $(this).text() === value;
                            }).attr("selected", "selected");
                            $(cellData).hide()
                            $(controle).className = "form-control";
                            $(controle).removeClass("hidden");
                            $(controle[0]).attr("data-registerid", registerid);
                            cellForm.prepend(controle);
                            cellForm.attr("control-type", "select")
                            break;
                        default:

                    }
                    $("#" + cellFormID).append(buttonSave);
                }
            }
            else {
                e.stopPropagation();
                return false;
            }
            e.stopPropagation();
            return false;
        })
    }
}


function openLayout(button, tabGenID) {
          
    
        var formID = $(button).attr("data-tabgenlayout");
        ClearForm(formID, true);
        var $tabNav = $(button).parents("form .panel.panel-nav");
        toogleColapseContainer($tabNav, true)
        $($tabNav).hide()
        $("#" + formID).show();
    
        var form = $(button).attr("data-formid");
    
        //ClearForm(form, true);
    
        var formTelaIDNavigation = $(button);
    
        if (formTelaIDNavigation) {
            if (formTelaIDNavigation.length > 0) {
                formID = $(formTelaIDNavigation[0]).attr("data-tabgenlayout");
                
                var onload = $("[tabgenid='" + formID + "']");
                if (onload) {
                    if (onload.length > 0) {
                        for (var i = 0; i < onload.length; i++) {
                            var onloadName = $(onload[i]).attr("containeronload");
                            eval(onloadName);
                        }
                    }
                }
            }
        }

        //$("[data-field='id_empresa']").val(returnCookie("EnterpriseID"));
       

        
   
}


    function clickSearch(tabGenID, layoutName, layoutID, load, listartodos){
        $.ajax({url: returnCookie("urlPlataform") + "/api/listall/" + layoutID, success: function(result){	
            var id = "table_" + tabGenID + "_table";
            var linehtml = "";
            if (result.recordsets) {
                if (result.recordsets.length > 0) {
                    if (result.recordsets[0].length > 0) {  
                        
                        var htm = "";                 
                        var data = [];
                       
                        
                        result.recordsets[0].forEach(function(element) {

                            if (element.sn_pessoafisica == true) {
                                element.sn_pessoafisica = '<i class="fa fa-check"></i>';
                            }else{
                                element.sn_pessoafisica = '<i class="fa fa-times"></i>';
                            }
                            
                               
                            var row = {};

                            for (var key in element) { 
                                var arraykey = key.split('.');
                                var keyfield = ""
                                if (arraykey.length > 1) {
                                    keyfield = arraykey[1];
                                }
                                if (keyfield) {
                                    if(key.indexOf("dt_") >= 0){
                                        var date = new Date(element[key]);
                                        var dia = (date.getDate() + 1);
                                        var mes = (date.getMonth() + 1);
                                        var ano =  date.getFullYear();

                                        if(dia.toString().length == 1){
                                            dia = "0" + dia;
                                        }

                                        if(mes.toString().length == 1){
                                            mes = "0" + mes;
                                        }

                                        element[key] = dia + '/' + mes + '/' + ano;
                                        //element[key] = element[key].substr(0,element[key].indexOf('T'))
                                    }

                                    if(keyfield.toLowerCase() == "id"){
                                        if (!element.Id) {
                                            element.Id = element[key].replace(" ","");
                                            row = {
                                                "0":"<a type='button' title='editar' id='Edit' name='Edit' class='btn btn-primary btn btn-xs btn-warning 6420a34d-9c8b-fcc5-b8f3-930d33ee8ea7_edit' onclick='filleditnavigation(\"" + element.Id + "\",\"" + layoutID + "\", \"\" ,\"" + tabGenID + "\" )' data-tabgenlayout='6420a34d-9c8b-fcc5-b8f3-930d33ee8ea7_nav'><i class='fa fa-pencil'></i></a>"
                                            } 
                                        }                                        
                                    }else{
                                        row[keyfield] = element[key];
                                    }
                                }
                               
                            }  

                            

                            
                         //   var row = {
                         //       "0":"<a type='button' title='editar' id='Edit' name='Edit' class='btn btn-primary btn btn-xs btn-warning 6420a34d-9c8b-fcc5-b8f3-930d33ee8ea7_edit' onclick='filleditnavigation(\"" + element.Id + "\",\"" + layoutID + "\", \"\" ,\"" + tabGenID + "\" )' data-tabgenlayout='6420a34d-9c8b-fcc5-b8f3-930d33ee8ea7_nav'><i class='fa fa-pencil'></i></a>",
                         //       "nm_razaosocial":element.nm_razaosocial,
                         //       "nr_codigo":element.nr_codigo,
                         //       "dt_cadastro":element.dt_cadastro,
                         //       "nm_nomefantasia":element.nm_nomefantasia,
                         //       "sn_pessoafisica":element.sn_pessoafisica,
                         //       "nm_cpf":element.nm_cpf,
                         //       "nm_cnpj":element.nm_cnpj
                         //   }

                            data.push(row);

                        }, this);

                        
                        $(".pull-right.search").html("");
                        $("#" + id + " table").bootstrapTable('destroy').bootstrapTable({
                            data: data
                        });

                        //var idfiltergen = $("#table_" + tabGenID + "_btnnovo").attr("data-tabgenlayout")
                        //var buttonNew = $("[data-tabgenlayout='" + idfiltergen + "']").clone();                        
                        //$(".pull-right.search").prepend(buttonNew);
                        //$("[data-tabgenlayout='" + idfiltergen + "']").hide()
                        //buttonNew.show();
                        
                        $(".panel-heading").remove();
                        $(".pull-right.search").css("display", "flex")
                        loaderImage(tabGenID + "_sharpGrid",false)

                    }
                }
            }
        }});
    }


    
function filleditnavigation(filtro, LayoutID, Fill1PropertyID, tabGenID, fillgrid, containerID) {

    $.ajax({url: returnCookie("urlPlataform") + "/api/findid2/" + filtro + "/" + LayoutID, success: function(result){
        var EnterpriseID = returnCookie("EnterpriseID");

        var formTelaIDNavigation = $("#table_" + tabGenID + "_btnnovo");

        if (formTelaIDNavigation) {
            if (formTelaIDNavigation.length == 0) {
                formTelaIDNavigation = $("[data-tabgenlayout='" + tabGenID + "']")
            }


            if (formTelaIDNavigation.length > 0) {
                FormID = $(formTelaIDNavigation[0]).attr("data-formid");
                tabGenID = $(formTelaIDNavigation[0]).attr("data-tabgenlayout");

                fillScreen(result, "", LayoutID, fillgrid);

                var formID = $(formTelaIDNavigation[0]).attr("data-tabgenlayout");
                var $tabNav = $(formTelaIDNavigation[0]).parents("form .panel.panel-nav");
                toogleColapseContainer($tabNav, true)
                $($tabNav).hide();
                $("#" + formID).show();

                var fillFK = true;
                if(containerID){
                    if(containerID != FormID){
                        fillFK = false;
                    }
                }

                if(fillFK){
                    if ($("#" + tabGenID).find("form")) {
                        if ($("#" + tabGenID).find("form").length > 0) {
                            var principaldt = $($("#" + tabGenID).find("form")[0]).attr("principaldatatypeid");
    
                            if (principaldt) {
                                var arrayFK = $( "input[name*='FK_" + principaldt + "']" )
    
                                if (arrayFK) {
                                   for (let index = 0; index < arrayFK.length; index++) {
                                       const element = arrayFK[index];
                                       $(element).val(filtro)
                                   } 
                                }
                            }
                        }
                    }
                }
                
                
                var wizard = $("[data-guidwizard='" + tabGenID + "']");
        
                for (var i = 0; i < wizard.length; i++) {  
                    if ($(wizard[i]).attr("containeronload")) {
                        eval($(wizard[i]).attr("containeronload"));
                    }
                }


                //        var onload = $("[tabgenid='" + formID + "']");
                //        if (onload) {
                //            if (onload.length > 0) {
                //                for (var i = 0; i < onload.length; i++) {
                //                    var onloadName = $(onload[i]).attr("containeronload");
                //                    eval(onloadName);
                //                }
                //            }
                //        }

            }
        }
    }})
}


function fillScreen(data, template, layoutID, fillgrid){
    var arraytable = [];
    var arraydatagrid = [[]];
    var arraydataJSON = [[]];
    var datagrid = [];
    var tablegrid;
    var arraytablegrid = [];
    var row = null;
    var beforeTable = "";
    var rownull = true;
    var idGrid = "";
    var containerID = "";
    var p=data;

    if (data.recordsets) {
        if (data.recordsets.length > 0) {
            p = data.recordsets[0];
        }
    }

    for (var i = 0; i < p.length; i++) {        
        for (var key in p[i]) {
            var keyfield = key.split('.')
            var table = keyfield[0];
            var field = keyfield[1];

            tablegrid = $("[data-table='" + table + "'][data-fielddata='" + field + "']").closest('table');
            var idfield = $("[data-table='" + table + "'][data-fielddata='" + field + "']").attr("data-field");        

            if (field.toLowerCase() === "id") {
                idGrid = p[i][key];                
            }                    

            if (containerID === "") {
                if ($(tablegrid[0]).parents(".sharpGrid")) {
                    var div = $(tablegrid[0]).parents(".sharpGrid");
                    if (div.length > 0) {
                        containerID = div[0].id;
    
                        if (containerID) {
                            containerID = containerID.replace("_sharpGrid", "")
                        }
                    }
                }
            }
            
            if (layoutID == "" || layoutID == "undefined" || layoutID == undefined) {
                layoutID = $("#" + containerID).attr("layoutid"); 
            }
             
            var th = $("[data-table='" + table + "'][data-fielddata='" + field + "']");

            if(fillgrid == false){
                th = [];
            }

            if(th.length > 0){              
               
                if(arraytable.indexOf(table) < 0){
                    arraytablegrid.push(tablegrid[0]);                    

                    if (row != null) {
                        var index = arraytable.indexOf(beforeTable);
                        if (index < 0) {
                            index = 0;
                        }  
                        containerID = containerID.replace(" ", "")   
                                           
                        if (rownull == false) {   
                            row["configuracao"] = "<div  style='white-space: nowrap;'><a type='button' title='editar' id='Edit' name='Edit' class='btn btn-primary btn btn-xs btn-warning ' onclick=editGridLine(this,'" + containerID + "','" + idGrid + "')><i class='fa fa-pencil'></i>  </a>  <a type='button' title='excluir' id='Delete' name='Delete' class='btn btn-primary btn btn-xs btn-danger ' onclick=deleteRowGrid(this,'" + containerID + "','" + idGrid + "','" + layoutID + "')><i class='fa fa-trash-o'></i>  </a></div>";
                            idGrid = "";
                            containerID = "";
                            if(arraydataJSON[index].indexOf(JSON.stringify(row)) < 0){
                                arraydatagrid[index].push(row);
                                arraydataJSON[index].push(JSON.stringify(row));
                            }                            
                        } 
                    }   
                    
                    rownull = true;
                    if (p[i][key]) {
                        rownull = false;
                    }
                                  
                    row = {};
                    arraytable.push(table)
                    row[idfield] = p[i][key]; 

                    arraydatagrid.push([]);
                    arraydataJSON.push([]);
                    beforeTable = table;
                }else{                   

                    if (p[i][key]) {
                        rownull = false;
                    }

                    if(row == null){
                        row = {}
                    }
                    row[idfield] = p[i][key]; 
                }     
            }else if(template != "MASTERDETAIL" && template != "GRID"){
                var value = p[i][key];
                if (value != undefined && value != "undefined") {
                    if($("[data-table='" + table + "'][data-field='" + field + "']").length > 0){
                        if($("[data-table='" + table + "'][data-field='" + field + "']")[0].type === "select-one"){
                            value = value.toLowerCase();
                        }

                        var autocomplete = $("input[data-table='" + table + "'][data-field='" + field + "']").attr("localautocomplete");

                        if(autocomplete){
                            var valueAutocomplete = p[i][key + "_FK"];
                            var idAutocomplete = $("input[data-table='" + table + "'][data-field='" + field + "']").attr("id");
                            if (!valueAutocomplete) {
                                valueAutocomplete = "";
                            }
                            
                            $("#" + idAutocomplete + "_autocomplete").val(valueAutocomplete);
                        }

                        var attribute = $("input[data-table='" + table + "'][data-field='" + field + "']").attr("data-nativedatatype");


                        switch (attribute) {
                            case "Data":
                                var arrayvalue = value.split("T");
                                if (arrayvalue.length > 0) {
                                    value = arrayvalue[0];
                                    value = formatDate(value);
                                }
                                break;
                            case "DataHora":
                                var arrayvalue = value.split("T");
                                if (arrayvalue.length > 0) {
                                    value = arrayvalue[0];
                                    value = formatDate(value);
                                }
                                break;
                            case "SimNao":
                                if (value == true) {
                                    $("[data-table='" + table + "'][data-field='" + field + "']").iCheck('check');
                                }else{
                                    $("[data-table='" + table + "'][data-field='" + field + "']").iCheck('uncheck');
                                }
                                break;
                            default:
                                break;
                        }
                    } 
                }     
                
                //if (field == "id_empresa") {
                //    value = returnCookie("EnterpriseID");
                //}
                
                $("[data-table='" + table + "'][data-field='" + field + "'][data-fielddata!='" + field + "']").val(value)
                $("[data-table='" + table + "'][data-field='" + field + "'][data-fielddata!='" + field + "']").attr("data-oldvalue", value)            
                
            }             
        }

        if (row != null) {
            var index = arraytable.indexOf(beforeTable);
            if (index < 0) {
                index = 0;
            }
            
            if (rownull == false) {               
                containerID = containerID.toLowerCase();
                row["configuracao"] = "<div  style='white-space: nowrap;'><a type='button' title='editar' id='Edit' name='Edit' class='btn btn-primary btn btn-xs btn-warning ' onclick=editGridLine(this,'" + containerID + "','" + idGrid + "','" + layoutID + "')><i class='fa fa-pencil'></i>  </a>  <a type='button' title='excluir' id='Delete' name='Delete' class='btn btn-primary btn btn-xs btn-danger ' onclick=deleteRowGrid(this,'" + containerID + "','" + idGrid + "','" + layoutID + "')><i class='fa fa-trash-o'></i>  </a></div>";
                idGrid = "";
                containerID = "";
                if(arraydataJSON[index].indexOf(JSON.stringify(row)) < 0){
                    arraydatagrid[index].push(row);
                    arraydataJSON[index].push(JSON.stringify(row));
                }
                
            }       
            row = null; 
        }
        
        //arraytable = [];
    }


    var arrayT = [];

    for (var k = 0; k < arraytablegrid.length; k++) {
        arrayT.push($(arraytablegrid[k]).find("th"));
        $(arraytablegrid[k]).bootstrapTable('destroy');
    }


    for (var k = 0; k < arraytablegrid.length; k++) {
        var tableGrid = arrayT[k];

        if (arraydatagrid[k]) {
            if (arraydatagrid[k].length > 0) {
                $(arraytablegrid[k]).bootstrapTable('destroy').bootstrapTable({
                    data: arraydatagrid[k]
                });
        
                for (var i = 0; i < tableGrid.length; i++) {
                    var x = tableGrid[i].attributes;
            
                    if (x) {
                        if (x.length > 0) {
                            for (var j = 0; j < x.length; j++) {
                                $("[data-field='" + $(tableGrid[i]).attr("data-field") + "']").attr(x[j].name, x[j].value);
                            }
                        }
                    }
                }
            }
        }
    }    
}


function fillScreenOLD(data, template, layoutID){
    var arraytable = [];
    var arraydatagrid = [[]];
    var arraydataJSON = [[]];
    var datagrid = [];
    var tablegrid;
    var arraytablegrid = [];
    var row = null;
    var beforeTable = "";
    var rownull = true;
    var idGrid = "";
    var containerID = "";
    var p = data;

    

    for (var i = 0; i < p.length; i++) {        
        for (var key in p[i]) {
            var keyfield = key.split('.')
            var table = keyfield[0];
            var field = keyfield[1];

            tablegrid = $("[data-table='" + table + "'][data-fielddata='" + field + "']").closest('table');
            var idfield = $("[data-table='" + table + "'][data-fielddata='" + field + "']").attr("data-field");        

            if (field.toLowerCase() === "id") {
                idGrid = p[i][key];                
            }                    

            if (containerID === "") {
                if ($(tablegrid[0]).parents(".sharpGrid")) {
                    var div = $(tablegrid[0]).parents(".sharpGrid");
                    if (div.length > 0) {
                        containerID = div[0].id;
    
                        if (containerID) {
                            containerID = containerID.replace("_sharpGrid", "")
                        }
                    }
                }
            }
            
            if (layoutID == "" || layoutID == "undefined" || layoutID == undefined) {
                layoutID = $("#" + containerID).attr("layoutid"); 
            }
             
            var th = $("[data-table='" + table + "'][data-fielddata='" + field + "']");

            if(th.length > 0){              
               
                if(arraytable.indexOf(table) < 0){
                    arraytablegrid.push(tablegrid[0]);                    

                    if (row != null) {
                        var index = arraytable.indexOf(beforeTable);
                        if (index < 0) {
                            index = 0;
                        }  
                        containerID = containerID.replace(" ", "")   
                                           
                        if (rownull == false) {   
                            row["configuracao"] = "<div  style='white-space: nowrap;'><a type='button' title='editar' id='Edit' name='Edit' class='btn btn-primary btn btn-xs btn-warning ' onclick=editGridLine(this,'" + containerID + "','" + idGrid + "')><i class='fa fa-pencil'></i>  </a>  <a type='button' title='excluir' id='Delete' name='Delete' class='btn btn-primary btn btn-xs btn-danger ' onclick=deleteRowGrid(this,'" + containerID + "','" + idGrid + "','" + layoutID + "')><i class='fa fa-trash-o'></i>  </a></div>";
                            idGrid = "";
                            containerID = "";
                            if(arraydataJSON[index].indexOf(JSON.stringify(row)) < 0){
                                arraydatagrid[index].push(row);
                                arraydataJSON[index].push(JSON.stringify(row));
                            }                            
                        } 
                    }   
                    
                    rownull = true;
                    if (p[i][key]) {
                        rownull = false;
                    }
                                  
                    row = {};
                    arraytable.push(table)
                    row[idfield] = p[i][key]; 

                    arraydatagrid.push([]);
                    arraydataJSON.push([]);
                    beforeTable = table;
                }else{                   

                    if (p[i][key]) {
                        rownull = false;
                    }
                    row[idfield] = p[i][key]; 
                }     
            }else if(template != "MASTERDETAIL" && template != "GRID"){
                var value = p[i][key];
                if (value != undefined && value != "undefined") {
                    if($("[data-table='" + table + "'][data-field='" + field + "']").length > 0){
                        if($("[data-table='" + table + "'][data-field='" + field + "']")[0].type === "select-one"){
                            value = value.toLowerCase();
                        }

                        var attribute = $("input[data-table='" + table + "'][data-field='" + field + "']").attr("data-nativedatatype");

                        switch (attribute) {
                            case "Data":
                                var arrayvalue = value.split("T");
                                if (arrayvalue.length > 0) {
                                    value = arrayvalue[0];
                                    value = formatDate(value);
                                }
                                break;
                            case "SimNao":
                                if (value == true) {
                                    $("[data-table='" + table + "'][data-field='" + field + "']").iCheck('check');
                                }else{
                                    $("[data-table='" + table + "'][data-field='" + field + "']").iCheck('uncheck');
                                }
                                break;
                            default:
                                break;
                        }
                    } 
                }     
                
                //if (field == "id_empresa") {
                //    value = returnCookie("EnterpriseID");
                //}
                
                $("[data-table='" + table + "'][data-field='" + field + "'][data-fielddata!='" + field + "']").val(value)
                $("[data-table='" + table + "'][data-field='" + field + "'][data-fielddata!='" + field + "']").attr("data-oldvalue", value)            
                
            }             
        }

        if (row != null) {
            var index = arraytable.indexOf(beforeTable);
            if (index < 0) {
                index = 0;
            }
            
            if (rownull == false) {               

                row["configuracao"] = "<div  style='white-space: nowrap;'><a type='button' title='editar' id='Edit' name='Edit' class='btn btn-primary btn btn-xs btn-warning ' onclick=editGridLine(this,'" + containerID + "','" + idGrid + "','" + layoutID + "')><i class='fa fa-pencil'></i>  </a>  <a type='button' title='excluir' id='Delete' name='Delete' class='btn btn-primary btn btn-xs btn-danger ' onclick=deleteRowGrid(this,'" + containerID + "','" + idGrid + "','" + layoutID + "')><i class='fa fa-trash-o'></i>  </a></div>";
                idGrid = "";
                containerID = "";
                if(arraydataJSON[index].indexOf(JSON.stringify(row)) < 0){
                    arraydatagrid[index].push(row);
                    arraydataJSON[index].push(JSON.stringify(row));
                }
                
            }       
            row = null; 
        }
        
        arraytable = [];
    }


    var arrayT = [];

    for (var k = 0; k < arraytablegrid.length; k++) {
        arrayT.push($(arraytablegrid[k]).find("th"));
        $(arraytablegrid[k]).bootstrapTable('destroy');
    }


    for (var k = 0; k < arraytablegrid.length; k++) {
        var tableGrid = arrayT[k];

        if (arraydatagrid[k]) {
            if (arraydatagrid[k].length > 0) {
                $(arraytablegrid[k]).bootstrapTable('destroy').bootstrapTable({
                    data: arraydatagrid[k]
                });
        
                for (var i = 0; i < tableGrid.length; i++) {
                    var x = tableGrid[i].attributes;
            
                    if (x) {
                        if (x.length > 0) {
                            for (var j = 0; j < x.length; j++) {
                                $("[data-field='" + $(tableGrid[i]).attr("data-field") + "']").attr(x[j].name, x[j].value);
                            }
                        }
                    }
                }
            }
        }
    }    
}




function fillContainer(data){
    var arraytable = [];
    var arraydatagrid = [[]];
    var arraydataJSON = [[]];
    var datagrid = [];
    var tablegrid;
    var arraytablegrid = [];
    var row = null;
    var beforeTable = "";
    var rownull = true;

    var p = data.recordsets[0];
    for (var i = 0; i < p.length; i++) {        
        for (var key in p[i]) {
            var keyfield = key.split('.')
            var table = keyfield[0];
            var field = keyfield[1];
            var value = p[i][key];

            if (value != undefined && value != "undefined") {
                if($("[data-table='" + table + "'][data-field='" + field + "']").length > 0){
                    if($("[data-table='" + table + "'][data-field='" + field + "']")[0].type === "select-one"){
                        value = value.toLowerCase();
                    }
                    
                    var autocomplete = $("input[data-table='" + table + "'][data-field='" + field + "']").attr("localautocomplete");

                    if(autocomplete){
                        var valueAutocomplete = p[i][key + "_FK"];
                        var idAutocomplete = $("input[data-table='" + table + "'][data-field='" + field + "']").attr("id");
                        if (!valueAutocomplete) {
                            valueAutocomplete = "";
                        }
                        
                        $("#" + idAutocomplete + "_autocomplete").val(valueAutocomplete);
                    }

                    var attribute = $("input[data-table='" + table + "'][data-field='" + field + "']").attr("data-nativedatatype");
                    
                    switch (attribute) {
                        case "Data":
                            var arrayvalue = value.split("T");
                            if (arrayvalue.length > 0) {
                                value = arrayvalue[0];
                                value = formatDate(value);
                            }
                            break;
                        case "SimNao":
                            if (value == true) {
                                $("[data-table='" + table + "'][data-field='" + field + "']").iCheck('check');
                            }else{
                                $("[data-table='" + table + "'][data-field='" + field + "']").iCheck('uncheck');
                            }
                            break;
                        case "Moeda":
                            var arrayvalue = value.toString().split(".")
                            if (arrayvalue.length > 1) {
                                if(arrayvalue[arrayvalue.length - 1].length == 2){
                                    value = value.toString().replace(",","").toString().replace(".",",");
                                }
                                
                            }
                            break;
                        default:
                            break;
                    }

                    //$("[data-table='entidade'][data-field='sn_pessoafisica']").iCheck('check');
                }

            }
            
            $("[data-table='" + table + "'][data-field='" + field + "'][data-fielddata!='" + field + "']").val(value)
            $("[data-table='" + table + "'][data-field='" + field + "'][data-fielddata!='" + field + "']").attr("data-oldvalue", value)            
        }  
    }     
}



function editGridLine(button, containerID, ID) {
    var arrayContainerID = [];
    arrayContainerID = containerID.split('_')
    var form = containerID;
    if (arrayContainerID) {
        if (arrayContainerID.length > 0) {
            containerID = arrayContainerID[0];
        }
    }
    loaderImage(form, true);
    $.ajax({url: returnCookie("urlPlataform") + "/api/editGridLine/" + containerID + "/" + ID, success: function(result){
        fillContainer(result);
        loaderImage(form, false);
    }})
}


  
function atualizaAba2(formID, layoutID, tabGenID, forcingTemplate, layoutType, urlRenderLayout, urlRenderLayoutData, titleMenu) {
    $("#controls-tabs li a[href='#" + tabGenID + "'] .tabControls").replaceWith("<img src='images/loader.gif' height='15px' />");
    if (urlRenderLayout) {
        getAjaxParameter(urlRenderLayout, urlRenderLayoutData, function () {
            //getAjaxParameter(getGlobalParameters("urlInterface") + "/renderform", nameLayout + Dados, function () {
            fillTab(resultadoParametroExterno, formID, layoutID, tabGenID, false, layoutType, urlRenderLayout, urlRenderLayoutData, titleMenu)
            }, function () {
            //    //replaceTabControls(formID, layoutID, tabGenID, forcingTemplate, layoutType, urlRenderLayout, urlRenderLayoutData)
                replaceTabControls(formID, layoutID, tabGenID, false, layoutType, urlRenderLayout, urlRenderLayoutData, titleMenu) 
            });
    }
}



function OpenFormSearch(tabGenID) {

    $(".columns.columns-right.btn-group.pull-right").hide();
    //$("#" + id + "_alertaModalFormSearchShow").modal('show');
    var target = $("#" + tabGenID).parent().find(".panel-nav");
    
    if (target) {
        if ($(target).find("#Filtrar")) {
            if ($(target).find("#Filtrar").length > 0) {
                var idfiltergen = $("[data-tabgenlayout='" + tabGenID + "']").attr("id")
                idfiltergen = idfiltergen.replace("table_", "").replace("_nav_btnnovo", "_nav_sharpGrid");
                loaderImage(idfiltergen,true)
                $(target).find("#Filtrar").click();
                //loaderImage(idfiltergen,false)
                $(".panel-body").css('height', '');
            }
        }
    }
    $(target).show()
    $('html, body').animate({ scrollTop: target.offset().top }, 1000);
    toogleColapseContainer(target, false)
    return false;
}


function toogleColapseContainer(selectorContainer,close) {
    var $elements = $(selectorContainer).children(".panel-body");
    var $button = $(selectorContainer).find(".panel-heading .panel-control li a.minus");
    if (close != true && close != false) {
        close = $button.hasClass('active')
    } 

    if (close == true) {
        $elements.slideUp(200);
        $elements.parent().addClass("minimized");
        //$button.children('i').removeClass('fa-minus');
        //$button.children('i').addClass('fa-square-o');
        $button.addClass('active');
    } else if (close == false) {
        $elements.slideDown(200);
        $elements.parent().removeClass("minimized");
        //$button.children('i').removeClass('fa-square-o');
        //$button.children('i').addClass('fa-minus');
        $button.removeClass('active');
    }
}

function getDropdownHTML(LayoutID, tabGenID){

    
        var parameters = "?LayoutID=" + LayoutID + "&EnterpriseID=" + returnCookie("EnterpriseID") + "&UserID=" + returnCookie("UserID") + "&tabGenID=" + tabGenID;

        $.ajax({
            url: getGlobalParameters("urlPlataforma") + "/api/publish/getDropdownHTML" + parameters,
            type: "GET",
            async: true,
            success: function (data) {

                for (var key in data) {
                    var value = data[key];
                    //$("#" + tabGenID + "_" + key).html(value);
                    document.getElementById(tabGenID + "_" + key).innerHTML = value;
                    var id = document.getElementById(tabGenID + "_" + key).id;
                    var controlid = $("#" + id).attr("data-controlid");
                    var propertyid = $("#" + id).attr("data-propertyid");
                    EventHideModal(id, controlid, propertyid);
                }

            },
            error: function (xhr) {
                //alert(xhr);
            }
        });
    
        
}

function EventHideModal(id, controlID, propertyID, parameters) {
    $('#alertaModalShow').on('hide.bs.modal', function () {
        var ok = $('#' + id).attr('EventHide');
        if (ok == 'true') {
            RefreshDropDown(id, controlID, propertyID, parameters);
            $('#' + id).attr('EventHide', 'false');
        }
    })  
}

function fillButtonGrid(id, tabgen){
    var retorno = new Object();
    $.ajax({url: returnCookie("urlPlataform") + "/api/buttongrid/" + tabgen , 
    async: false,
    success: function(result){
        for (let index = 0; index < result.length; index++) {
            result[index]["scriptEvents"] =  replaceAll(result[index]["scriptEvents"],"f8af21d6-e280-060a-1d92-0e7948ad107f" , tabgen)
            id =  replaceAll(result[index]["FormID"],"f8af21d6-e280-060a-1d92-0e7948ad107f" , tabgen)
            retorno[id + "_table"] = []
            retorno[id + "_table"].push(result[index]);
        }
        
        
    }})

    return retorno;
}


function RefreshDropDown(id, controlID, propertyID, parameters) {
    var dados = "controlID=" + controlID + "&propertyID=" + propertyID + "&enterpriseID=" + returnCookie("EnterpriseID");
    var url = getGlobalParameters("urlPlataforma") + "/api/render/RefreshDropDown";

    $.ajax({
        type: "get",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'text/plain'
        },
        url: url + "?" + dados,
        dataType: "json",
        cors: true,
        async: true,
        crossDomain: true,
        //data: {
        //    Dados: dados
        //},
        success: function (result) {

            if (result.property) {
                if (result.property.value.length > 0) {
                    var select = document.getElementById(id);

                    var opcoes = [select.options.length];
                    for (var i = 0; i < select.options.length; i++) {
                        opcoes[i] = select.options[i].text;
                    }

                    for (i = 0; i < select.length; i) {
                        select.remove(i);
                        if (select.length == 0) {
                            break;
                        }
                    }

                    for (var i = 0; i < result.property.value.length; i++) {
                        var x = document.getElementById(id);
                        var option = document.createElement("option");
                        option.value = result.property.value[i];
                        option.text = result.property.text[i];
                        x.add(option);
                    }

                    select = document.getElementById(id);

                    for (var i = 0; i < select.options.length; i++) {
                        var text = select.options[i].text;
                        var temTexto = false;
                        for (var y = 0; y < opcoes.length; y++) {
                            if (text == opcoes[y]) {
                                temTexto = true;
                            }
                        }
                        if (temTexto == false) {
                            select.selectedIndex = i;
                            break;
                        }
                    }


                }
            }
            
        },
        error: function (result) {

        }

    });
}

function FormOpeningDSG(id, typeOpeningLayout, nameLayout, layoutID, titleMenu, forcingTemplate, enterpriseID) {
    $('#' + id).attr('EventHide', 'true');
    //FormOpening(TypeOpeningLayout, nameLayout, LayoutID, TitleMenu, ForcingTemplate);
    containerType = "MODAL";
    var dados = "&enterpriseID=" + enterpriseID;
    //CreateAba(nameLayout, layoutID, titleMenu, dados, false, containerType, forcingTemplate)
    var tabGenID = guid();
    var EnterpriseName = "";
    layoutID = layoutID.toUpperCase();
    
    CreateAba(nameLayout, layoutID, titleMenu, dados, false, containerType, forcingTemplate, "VERTICAL", function(){
        //var objgrid = $("[id*='_" + tabGenID + "_table']");
        var objgrid = $("[id*='" + tabGuidABA + "_table'][data-template='MASTERDETAIL']")
        for (let index = 0; index < objgrid.length; index++) {
            const element = objgrid[index];
            $(element).html("");
        }

        $("[layoutid*='" + layoutID + "_" + "']").html("");

    });

}





function OpenAbaDSG(nameLayout, layoutID, titleMenu, enterpriseID) {
    var title = titleMenu.replace("%20", " ");
    title = title.replace("%20", " ");
    title = title.replace("%20", " ");
    title = title.replace("%20", " ");
    title = title.replace("%20", " ");
    title = title.replace("%20", " ");


    f_aba(nameLayout,layoutID,title,'true', enterpriseID)

    

}

 