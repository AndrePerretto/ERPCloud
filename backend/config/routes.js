const express = require('express')

module.exports = function(server) {
    
    const router = express.Router()
    server.use('/api', router)

    //Rotas da API
    const ProdutoService = require('../api/layoutservice')
    ProdutoService.register(router, '/layouts')
    const MenuService = require('../api/menuservice')
    MenuService.register(router, '/menu')
    const DataBaseService = require('../api/databaseservice')
    DataBaseService.register(router, '/database')
    const ControlService = require('../api/controlservice')
    ControlService.register(router, '/controls')
    const ReportsService = require('../api/reportsservice')
    ReportsService.register(router, '/reports')
    
    const Faturamento = require('../ntlct_modules/faturamento/configuracao_ncm')
    const ContasReceber = require('../ntlct_modules/financeiro/contasreceber')
    const ContasPagar = require('../ntlct_modules/financeiro/contaspagar')
    const movimentacaoservicos = require('../custom_modules/broker/servicos/movimentacaoservicos')
    const buscacodsequencial = require('../ntlct_modules/produtos/buscacodsequencial')
}
