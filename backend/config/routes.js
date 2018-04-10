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
    
}