/*------------------------------------------------------------------
 [ Login  Trigger Js]

 Project     :	Fickle Responsive Admin Template
 Version     :	1.0
 Author      : 	AimMateTeam
 URL         :   http://aimmate.com
 Support     :   aimmateteam@gmail.com
 Primary use :   Login Page
 -------------------------------------------------------------------*/

jQuery(document).ready(function($) {
    'use strict';

    bootstrap_switch_trigger_call();
    forgo_password_view();
    login_view_submit();
    email_view_submit();

    // Bind progress buttons and simulate loading progress
    ladda_button_call();

    //document.getElementById('date').valueAsDate = new Date();
});
/*** Switch Call ***/
function bootstrap_switch_trigger_call(){
    $(".switchCheckBox").bootstrapSwitch();

}
/*** Switch Call  End***/
function forgo_password_view(){
    $(".forgot-password, .login-view").click(function () {
        $('.login-form, .forgot-pass-box').slideToggle('slow');
    });
}

$.getScript("script/framework/jquery.empresario.general.js");

function login_view_submit(){
    $('#form-login').submit(function () {
        var data = $('#form-login').serialize()
        /*var setUrl = window.location.origin + '/index.html'
         window.location.assign(setUrl);*/
        var templateModel;
        var lang;
        var login = document.getElementById("iUserName").value;
        var senha = document.getElementById("iPassword").value;
        var empID = document.getElementById("iEnterpriseID").value;

        var empDsc = $('#enterpriseLink').find(":selected")[0].text

        var element = $('#idiom').find(":selected");//document.getElementById("idiom");

        if (element.length > 0) {
            lang = element[0].getAttribute("data-idiom");
        }
        
        var date = new Date(); //document.getElementById("date").value;

        var element2 = $('#templateModel').find(":selected");//document.getElementById("idiom");

        if (element2.length > 0) {
            templateModel = element2[0].value;
        }

        
        $.ajax({
            url: getGlobalParameters("urlPlataforma") + "/api/login/login?" + "login=" + login + "&password=" + senha + "&enterpriseID=" + empID,
            //url:"login.aspx/logar",
            //data:data,
            type: "get",
            async: false,
            crossDomain: true,
            success: function (response) {
                if (trataRetorno(response)) {                    
                    //var setUrl = window.location.origin + '/index.html'
                    var enterpriseID = $("#enterpriseLink").val();
                    createCookie("EnterpriseID", enterpriseID, 99);
                    createCookie("UserID", response.ID, 99);
                    var setUrl = "http://" + window.location.host; //getGlobalParameters("urlInterface") + "/login.aspx?enterpriseID=" + empID + "&userID=" + response.ID + "&language=" + lang + "&date=" + date + "&templateModel=" + templateModel + "&EnterpriseName=" + empDsc;
                    window.location.assign(setUrl);                    
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert(xhr.status);
                alert(thrownError);
            }
        });        

        return false;
    });

    getEnterpriseID();
}


function email_view_submit() {
    $('#form-email').submit(function (e) {
        e.preventDefault();
        var data = $('#form-email').serialize()
        var empID = document.getElementById("iEnterpriseID").value;
        var email = document.getElementById("email").value;
        
        $.ajax({
            url: getGlobalParameters("urlPlataforma") + "/api/login/ForgotPassword?" + "email=" + email + "&enterpriseID=" + empID,
            type: "get",
            async: false,
            crossDomain: true,
            success: function (response) {
                if (response.success == true) {
                    notification({ messageTitle: response.title[0].text, messageText: response.title[0].toolTip, fix: false, type: "ok", icon: "thumbs-up" });

                }else{
                    notification({ messageTitle: response.title[0].text, messageText: response.title[0].toolTip, fix: false, type: "warning", icon: "thumbs-down" });

                }
                
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert(xhr.status);
                alert(thrownError);
            }
        });

        return false;
    });

    getEnterpriseID();
}

function getEnterpriseID() {
    $("#enterpriseLink").change(function () {
        var element = document.getElementById("enterpriseLink");
        var index = element.selectedIndex;

        $("#iEnterpriseID").val(element[index].getAttribute("data-enterpriseID"));
    });
}

function trataRetorno(response) {
    if (response) {
        if (response.success == true) {
            //GerarCookie("empresarioERP", "logado", 1);
            return true;
        } else {
            //alert("Usu�rio inv�lido!!!");
            notification({ messageTitle: response.title[0].text, messageText: response.title[0].toolTip, fix: false, type: "warning", icon: "thumbs-down" });

            
            return false;
        }
    } else {
        alert("Usuário inválido!!!");
        return false;
    }
}

function ladda_button_call(){
    Ladda.bind('button.ladda-button', {
        callback: function (instance) {
            var progress = 0;
            var interval = setInterval(function () {
                progress = Math.min(progress + Math.random() * 0.1, 1);
                instance.setProgress(progress);

                if (progress === 1) {
                    instance.stop();
                    clearInterval(interval);
                    //Checking Login in here


                    //var jacked = humane.create({baseCls: 'humane-jackedup', addnCls: 'humane-jackedup-success'});
                    //jacked.log("<i class='fa fa-smile-o'></i> Successfully logedin ");



                    
                    //setInterval(function () {
                    //    var setUrl = '/index.html';
                    //    window.location.assign(setUrl);
                    //}, 500);
                }
            }, 200);
        }
    });
}