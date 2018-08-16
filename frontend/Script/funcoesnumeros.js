function formataNumero(valorFormatar, casasDecimais, separadorMilhar, separadorDecimal) {
    var retorno = "";
    var numeroFormatar = "";
    var retornoDecimais = "";
    var tamanhoNumero = 0;
    var modulos = 0;
    var contador = 0;
    var posicao = 0;

    try {
        if (isNaN(valorFormatar)) {
            retorno = "NaN";
        }
        else {
            if (typeof (valorFormatar) == "string")
                valor = parseFloat(valorFormatar);
            else
                valor = valorFormatar;

            numeroFormatar = valor.toFixed(casasDecimais);
            tamanhoNumero = numeroFormatar.length;
            retornoDecimais = separadorDecimal + numeroFormatar.substr(tamanhoNumero - casasDecimais);
            numeroFormatar = numeroFormatar.substr(0, tamanhoNumero - casasDecimais - 1)
            tamanhoNumero = numeroFormatar.length;

            modulos = tamanhoNumero % 3;
            if (modulos > 0) {
                numeroFormatar = (" ").repeat(3 - modulos) + numeroFormatar;
            }
            tamanhoNumero = numeroFormatar.length;
            modulos = tamanhoNumero / 3;

            retorno = "";
            posicao = 0;
            for (contador = 0; contador < modulos; contador++) {
                if (contador > 0)
                    retorno += separadorMilhar;
                retorno += numeroFormatar.substr(posicao, 3)
                posicao += 3;
            }

            retorno += retornoDecimais;

            retorno = retorno.trim();
        }
    }
    catch (err) {
        retorno = "eNaN";
        console.log("FormataNumero: " + err.message)
    }
    return (retorno);
}
