const prefixoModulo = "Financeiro_";

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
    var vencimentoReal = null;
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

                                    if (element.id_mantervencimento == "96C915A3-0BBD-424D-8759-5C07FCE2531B")           //dia útil anterior ao vencimento
                                        vencimentoReal = diaUtil(dataInicial,true);
                                    else{
                                        if (element.id_mantervencimento == "E4AB5D8B-7589-4AF5-BBD9-2959BED09762")          //dia útil posterior
                                            vencimentoReal = diaUtil(dataInicial,false);
                                        else                                            
                                            vencimentoReal = dataInicial;
                                    }

                                    if (entrada > 0){
                                        nrParcela = 1;
                                        parcela = {
                                            parcela: 1,
                                            valor: entrada,
                                            saldo: entrada,
                                            emissao: new Date(),
                                            vencimento: new Date(dataInicial),
                                            vencimentoReal: new Date(vencimentoReal)
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
                                     
                                        if (element.id_mantervencimento == "96C915A3-0BBD-424D-8759-5C07FCE2531B")           //dia útil anterior ao vencimento
                                           vencimentoReal = diaUtil(dataInicial,true);
                                        else{
                                            if (element.id_mantervencimento == "E4AB5D8B-7589-4AF5-BBD9-2959BED09762")          //dia útil posterior
                                                vencimentoReal = diaUtil(dataInicial,false);
                                            else                                            
                                                vencimentoReal = dataInicial;
                                        }

                                        parcelas.push({
                                            parcela: nrParcela,
                                            valor: valorCheio,
                                            saldo: valorCheio,
                                            emissao: new Date(),
                                            vencimento: new Date(dataInicial),
                                            vencimentoReal: new Date(vencimentoReal)
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


/*------------------------------------------------------------------------------
Procura pelo próximo dia útil referente a data inicial. O dia útil poderá ser 
a própria data inicial ou posterior ou anterior à ela, conforme o parâmetro 
"diaAnterior".

Sábados e domingos e feriados não são considerados dias úteis.

Consulta a tabela de feriados - "feriado" - para verificar os dias que são
feriados.

Parâmetros:
    dataInicial - objeto tipo data
    diaAnterior - se "true" busca por dia útil anterior à data inicial
Retorno:
    diaUtil: data no formato yyyy-mm-dd
--------------------------------------------------------------------------------
*/
function diaUtil(dataInicial,diaAnterior){
    var prefixoFuncao = prefixoModulo + "diautil: "
    var diaUtil = null;
    var diaValido = false;
    var resposta = null;

    try{
        diaUtil = new Date(dataInicial);
        while(!diaValido){ 
            //Se sábado ou domingo, passa para a segunda-feira seguinte.
            if (diaUtil.getDay() == 0)      //domingo
            {
                if(diaAnterior)
                    diaUtil.setDate(diaUtil.getDate() - 2);
                else
                    diaUtil.setDate(diaUtil.getDate() + 1);
                diaValido = true;
            }
            else{
                if (diaUtil.getDay() == 6)      //sábado
                {
                    if(diaAnterior)
                        diaUtil.setDate(diaUtil.getDate() - 1);
                    else
                        diaUtil.setDate(diaUtil.getDate() + 2);
                    
                    diaValido = true;
                }
                else
                    diaValido = true;
            }
        }
    }
    catch(erro){
        resposta = {
            status: -1,
            prefixo: prefixoFuncao,
            mensagem: ["" + erro],
            parcelas: [],
        }
        diaUtil = null;
    }
    return(diaUtil);
}

/*------------------------------------------------------------------------------
--------------------------------------------------------------------------------
*/
function truncateDecimal(value,precision){
    var step = Math.pow(10, precision);
    var tmp = Math.trunc(step * value);
    return(tmp / step);
}





exports.moedaPorExternso = function(valor){
    var milhares = null;
    var centenas = null;
    var dezenas = null;
    var unidades = null;
    var resposta = null;
    var moeda = null;
    var milhar = "";
    var extenso = "";
    var strValor = "";
    var strInteira = "";
    var strDecimal = "";
    var juncao = "";
    var tamanhoValor = 0;
    var valorMilhar = 0;
    var posMilhar = 0;
    var nrGrupos = 0;
    var centena = 0;
    var decimal = 0;
    var unidade = 0;
    var posDec = 0;
    var grupo = 0;

    moeda = {
        nomeSingular: "real",
        nomePlural: "reais",
        fracaoSingular: "centavo",
        fracaoPlural: "centavos"
    }

    try{
        milhares = [
            {"singular":"trilhão","plural":"trilhões","juncao":"de "},
            {"singular":"bilhão","plural":"bilhões","juncao":"de "},
            {"singular":"milhão","plural":"milhões","juncao":"de "},
            {"singular":"mil","plural":"mil","juncao":""},
            {"singular":"","plural":"","juncao":""}
        ];

        centenas = [
            {"singular":"","plural":""},
            {"singular":"cem","plural":"cento"},
            {"singular":"duzentos","plural":"duzentos"},
            {"singular":"trezentos","plural":"trezentos"},
            {"singular":"quatrocentos","plural":"quatrocentos"},
            {"singular":"quinhentos","plural":"quinhentos"},
            {"singular":"seiscentos","plural":"seiscentos"},
            {"singular":"setecentos","plural":"setecentos"},
            {"singular":"oitocentos","plural":"oitocentos"},
            {"singular":"novecentos","plural":"novecentos"},
        ];

        dezenas = ["","dez","vinte","trinta","quarenta","cinquenta","sessenta","setenta","oitenta","noventa"];

        unidades = ["","um","dois","três","quatro","cinco","seis","sete","oito","nove","dez","onze","doze","treze","quatorze","quinze","dezesseis","dezessete","dezoito","dezenove"]

        strValor = valor.toString();

        posDec = strValor.indexOf(".");

        if(posDec < 0){
            strInteira = strValor;
        }
        else{
            strInteira = strValor.substring(0,posDec);
            strDecimal = strValor.substring(posDec + 1,posDec + 3).trim();
        }

        nrGrupos = milhares.length;
        tamanhoValor = nrGrupos * 3;

        if(strInteira.length > tamanhoValor){
            resposta = {
                status: 0,
                mensagem: "Valor excede o limite previsto de " + milhares[0].plural
            }
        }
        else{
            if(strInteira.length < tamanhoValor){
                strInteira = ("0").repeat(tamanhoValor - strInteira.length) + strInteira;
            }
            if(strDecimal.length == 1)
                strDecimal += "0";

            for(grupo = 0; grupo < nrGrupos; grupo++){
                posMilhar = 3 * grupo;
                milhar = strInteira.substring(posMilhar,posMilhar + 3);
                valorMilhar = parseInt(milhar);
                if(valorMilhar > 0){
                    juncao = milhares[grupo].juncao;
                    if(extenso != "")
                        extenso+= ", ";
                    centena = parseInt(milhar.substring(0,1));
                    dezena = parseInt(milhar.substring(1,3));

                    if(centena > 0){
                        if(dezena == 0)
                            extenso += centenas[centena].singular;
                        else
                            extenso += centenas[centena].plural + " e ";
                    }
                    
                    if(dezena > 0){
                        if(dezena < 20){
                            extenso += unidades[dezena];
                        }
                        else{
                            unidade = dezena % 10;
                            dezena = Math.trunc(dezena / 10);
                            if(unidade > 0){
                                extenso += dezenas[dezena] + " e ";
                                extenso += unidades[unidade];
                            }
                            else{
                                extenso += dezenas[dezena];
                            }
                        }
                    }
                    if(valorMilhar == 1)
                        extenso += " " + milhares[grupo].singular;
                    else
                        extenso += " " + milhares[grupo].plural;
                }
            }

            if(extenso != ""){
                if(parseInt(strInteira) > 1)
                    extenso += " " + juncao + moeda.nomePlural;
                else
                    extenso += " " + juncao + moeda.nomeSingular;
            }

            decimal = parseInt(strDecimal);
            if(decimal > 0){
                if(extenso != "")
                    extenso += " e ";
                if(decimal < 20){
                    extenso += unidades[decimal];
                }
                else{
                    unidade = decimal % 10;
                    dezena = Math.trunc(decimal / 10);
                    if(unidade > 0){
                        extenso += dezenas[dezena] + " e ";
                        extenso += unidades[unidade];
                    }
                    else{
                        extenso += dezenas[dezena];
                    }

                }

                if(decimal == 1)
                    extenso += " " + moeda.fracaoSingular;
                else
                    extenso += " " + moeda.fracaoPlural;
            }


            resposta = {
                status: 1,
                mensagem: extenso
            }            
        }
    }
    catch(erro){
        resposta = {
            status: -1,
            mensagem: "" + erro
        }
    }

    console.log(resposta);

    return(resposta);
}