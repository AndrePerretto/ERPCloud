const prefixoModulo = "Financeiro_";

/*------------------------------------------------------------------------------
Verifica se os dados para forma de pagamento são válidos, executando a validação
correspondente para cada forma.

Parâmetros
    formaPagamento = {
        idBanco: id do banco onde será realizada a operação
        data: data da operação
        documento: compravante da operação
        idFormaPagamento: id da forma de pagamento
        valor: valor da operação
        idBancoOper: id do banco da operação
        agenciaOper: agência do banco da operação
        contaOper: conta do banco da operação
    }
Retorno:
    resposta = {
        status: 0, dados inválidos; 1, ok; < 0 erro na execução
        mensagem: array com mensagens da validação
    }
--------------------------------------------------------------------------------
*/
exports.validarDados = function(formaPagamento){
    var resposta = null;

    try{
        if(formaPagamento.idFormaPagamento == null || formaPagamento.idFormaPagamento == ""){
            resposta = {
                status: 0,
                mensagem: ["Forma de pagamento não informada."]
            }
        }
        else{
            /* Validação padrão */
            resposta = {
                status: 1,
                mensagem: []
            }

            if(formaPagamento.idBanco == null || formaPagamento.idBanco.indexOf("undefined") >= 0 || formaPagamento.idBanco == ""){
                resposta.status = 0;
                resposta.mensagem.push("Banco inválido ou não informado.");
            }

            if(formaPagamento.data == null || formaPagamento.data.indexOf("undefined") >= 0 || formaPagamento.data == ""){
                resposta.status = 0;
                resposta.mensagem.push("Data inválida para a operação.");
            }

            if(formaPagamento.valor == null || formaPagamento.valor.indexOf("undefined") >= 0 || isNaN(formaPagamento.valor) || parseFloat(formaPagamento.valor) == 0){
                resposta.status = 0;
                resposta.mensagem.push("Valor da operação inválido.");
            }

            switch(formaPagamento.idFormaPagamento){
                case "54D458D5-0A13-4A37-908B-239DBB4A0817":	//Cartão
                    break;
                case "C42F0B45-5C2A-42C3-B8E6-3D52E0CDD958": 	//Boleto
                    break;
                case "E8DF8C20-7828-455D-B5C8-5D4C0CA07CC0":	//Descontada
                    break;
                case "B49C3D3C-9217-4C32-811B-6D2EE4DE214A":	//Cheque
                    validarDadosCheque(formaPagamento,resposta);
                    break;
                case "508658D7-B49A-427E-9343-71A47AB51AEA":	//Dinheiro
                    break;
                case "DD877131-20DD-45D1-ACC9-FA6BC76CAA4E": 	//Transferência
                    validarDadosTransferencia(formaPagamento,resposta);
                    break;
                default:
                    resposta.status = 0;
                    resposta.mensagem.push("Forma de pagamento não reconhecida.");
            }            
        }
    }
    catch(erro){
        resposta = {
            status: -1,
            mensagem: ["" + erro]
        }
    }
    return(resposta);
}


/*------------------------------------------------------------------------------
--------------------------------------------------------------------------------
*/
function validarDadosCheque(formaPagamento,resposta){
    try{
        if(formaPagamento.documento == null  || formaPagamento.documento.indexOf("undefined") >= 0 || formaPagamento.documento == ""){
            resposta.status = 0;
            resposta.mensagem.push("Número de cheque inválido.")
        }

        if(formaPagamento.tipoMovimento == "C"){
            if(formaPagamento.idBancoOper == null  || formaPagamento.idBancoOper.indexOf("undefined") >= 0|| formaPagamento.idBancoOper == ""){
                resposta.status = 0;
                resposta.mensagem.push("Banco do cheque não foi informado.")
            }

            if(formaPagamento.agenciaOper == null || formaPagamento.agenciaOper.indexOf("undefined") >= 0 || formaPagamento.agenciaOper == ""){
                resposta.status = 0;
                resposta.mensagem.push("Agência bancária do cheque não foi informada.")
            }

            if(formaPagamento.contaOper == null  || formaPagamento.contaOper.indexOf("undefined") >= 0|| formaPagamento.contaOper == ""){
                resposta.status = 0;
                resposta.mensagem.push("Conta bancária do cheque não foi informada.")
            }
        }
    }
    catch(erro){
        resposta = {
            status: -1,
            mensagem: ["CHQ: " + erro]
        }
    }
    return;
}



/*------------------------------------------------------------------------------
--------------------------------------------------------------------------------
*/
function validarDadosTransferencia(formaPagamento,resposta){
    try{
        if(formaPagamento.idBancoOper == null || formaPagamento.idBancoOper.indexOf("undefined") >= 0|| formaPagamento.idBancoOper == ""){
            resposta.status = 0;
            resposta.mensagem.push("Banco da transferência não foi informado.")
        }

        if(formaPagamento.agenciaOper == null || formaPagamento.agenciaOper.indexOf("undefined") >= 0 || formaPagamento.agenciaOper == ""){
            resposta.status = 0;
            resposta.mensagem.push("Agência bancária da transferência não foi informada.")
        }

        if(formaPagamento.contaOper == null || formaPagamento.contaOper.indexOf("undefined") >= 0|| formaPagamento.contaOper == ""){
            resposta.status = 0;
            resposta.mensagem.push("Conta bancária da transferência não foi informada.")
        }
    }
    catch(erro){
        resposta = {
            status: -1,
            mensagem: ["TRF: " + erro]
        }
    }
    return;
}