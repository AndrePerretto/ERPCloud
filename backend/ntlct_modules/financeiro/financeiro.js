const prefixoModulo = "Financeiro_";

function truncateDecimal(value,precision){
    var step = Math.pow(10, precision);
    var tmp = Math.trunc(step * value);
    return(tmp / step);
} 


/*------------------------------------------------------------------------------
Criar parcelas conforme o tipo de parcelamento.
As parcelas geradas são enviadas para uma "callback".

Retorno:
    tipo: objeto
    propriedades:   status (mumérico):
                        < 0 -> erro durante o processo de geração
                        = 0 -> parâmetros inválidos
                        > 0 -> parcelas geradas com sucesso                        
                    mensagem (array): mensagens referentes ao status do processo
                    parcelas (array): objetos parcela:
                        parcela {
                            numero
                            valor
                            saldo
                            data de emissão
                            data de vencimento
                        }
--------------------------------------------------------------------------------
*/
exports.gerarparcelas = function(config,idEmpresa,idParcelamento,valor,dataInicial,callbackf){
    var sql = require("mssql");
    var parcelas = [];
    var query = "";
    var prefixoFuncao = prefixoModulo + "geraparcelas: "
    var hoje = null
    var resposta = null;
    var conexao = null;
    var i = 0;
    var saldo = 0;
    var entrada = 0;
    var nrParcela = 0;
    var valorCheio = 0;
    var valorSobra = 0;
    var numParcelas = 0;
    var percEntrada = 0;
    var dias1aParcela = 0;
    
    
    try{
        if(valor != 0){
            query += "select id,nr_numeroparcelas,nr_diavencimento,nm_carencia,nr_intervaloparcelas,vl_percentualentrada,id_mantervencimento,sn_messeguinte,sn_valorfixo from parcelamento";
            query += " where id_empresa = @idempresa and id = @idparcelamento";

            conexao = new sql.ConnectionPool(config,function (err) {
                if (err){
                    resposta = {
                        status: -2,
                        prefixo: prefixoFuncao,
                        mensagem: ["" + err],
                        parcelas: []
                    }
                    conexao.close();
                    callbackf(resposta);
                }
                else{
                    var request = conexao.request();
                    request.input("idempresa",idEmpresa);
                    request.input("idparcelamento",idParcelamento);
                    request.query(query, function (err, recordset) {
                        if (err){
                            resposta = {
                                status: -3,
                                prefixo: prefixoFuncao,
                                mensagem: ["" + err],
                                parcelas: []
                            }
                            conexao.close();
                            callbackf(resposta);
                        }
                        else{
                            try{
                                if(recordset.recordsets.length > 0){
                                    var element = recordset.recordsets[0][0];

                                    hoje = new Date();

                                    numParcelas = (element.nr_numeroparcelas == null || element.nr_numeroparcelas == 0) ? 1 : element.nr_numeroparcelas;

                                    if(dataInicial == null)
                                        dataInicial = new Date();
                                
                                    if (element.nr_diavencimento != null && element.nr_diavencimento != 0){
                                        dataInicial.setDate(element.nr_diavencimento);
                                        if (element.nr_diavencimento > hoje.getDate())
                                            dataInicial.setMonth(dataInicial.getMonth() + 1);
                                        else
                                            dataInicial = element.sn_messeguinte != null || !element.sn_messeguinte ? dataInicial : dataInicial.setMonth(dataInicial.getMonth() + 1);
                                    }
                                    else{
                                        dias1aParcela = parseInt(element.nm_carencia)
                                        if (dias1aParcela > 0)
                                            dataInicial.setDate(dataInicial.getDate() + dias1aParcela);
                                        else
                                            dataInicial.setDate(dataInicial.getDate() + element.nr_intervaloparcelas);
                                    }

                                    percEntrada = parseFloat(element.vl_percentualentrada);
                                
                                    if (percEntrada >= 100){
                                        entrada = valor;
                                        saldo = 0;
                                        numParcelas = 1;
                                        valorCheio = 0;
                                        valorSobra = 0;
                                    }
                                    else{
                                        entrada = Math.round(valor * (element.vl_percentualentrada / 100), 2);
                                        if (entrada > 0)
                                            numParcelas--;
                                        saldo = valor - entrada;
                                        if(element.sn_valorfixo != null && element.sn_valorfixo == 1){
                                            valorCheio = saldo;
                                            valorSobra = 0;
                                        }
                                        else{
                                            valorCheio = truncateDecimal(saldo / numParcelas, 2);
                                            valorSobra = saldo - (valorCheio * numParcelas);
                                        }
                                    }
                                
                                    if (entrada > 0){
                                        nrParcela = 1;
                                        parcela = {
                                            parcela: 1,
                                            valor: entrada,
                                            saldo: entrada,
                                            emissao: new Date(),
                                            vencimento: new Date(dataInicial)
                                        }
                                        parcelas.push(parcela);

                                        if (element.nr_diavencimento != null && element.nr_diavencimento != 0)
                                            dataInicial.setMonth(dataInicial.getMonth() + 1);
                                        else
                                            dataInicial.setDate(dataInicial.getDate() + element.nr_intervaloparcelas)
                                    }
                                
                                    for (i = 0; i < numParcelas; i++){
                                        if (i == numParcelas - 1)
                                            valorCheio += valorSobra;

                                        nrParcela++;
                                        parcelas.push({
                                            parcela: nrParcela,
                                            valor: valorCheio,
                                            saldo: valorCheio,
                                            emissao: new Date(),
                                            vencimento: new Date(dataInicial)
                                        });
                                        
                                        if (element.nr_diavencimento != null && element.nr_diavencimento != 0)
                                            dataInicial.setMonth(dataInicial.getMonth() + 1);
                                        else
                                            dataInicial.setDate(dataInicial.getDate() + element.nr_intervaloparcelas)
                                    }
                                    resposta = {
                                        status: 1,
                                        prefixo: prefixoFuncao,
                                        mensagem: ["ok"],
                                        parcelas: parcelas
                                    }
                                    conexao.close();
                                    callbackf(resposta);
                                }
                                else{
                                    resposta = {
                                        status: 0,
                                        prefixo: prefixoFuncao,
                                        mensagem: ["Não foram encontradas os dados referentes ao parcelamento."],
                                        parcelas: [],
                                    }
                                    conexao.close();
                                    callbackf(resposta);
                                    
                                }
                            }
                            catch(err){
                                resposta = {
                                    status: -4,
                                    prefixo: prefixoFuncao,
                                    mensagem: ["" + err],
                                    parcelas: [],
                                }
                                conexao.close();
                                callbackf(resposta);
                            }
                        }
                    })
                }
            })
        }
        else{
            resposta = {
                status: 0,
                prefixo: prefixoFuncao,
                mensagem: ["valor inválido."],
                parcelas: []
            }
            callbackf(resposta);
        }
    }
    catch(erro){
        resposta = {
            status: -1,
            prefixo: prefixoFuncao,
            mensagem: ["" + erro],
            parcelas: [],
        }
        conexao.close();
        callbackf(resposta);
    }
}
