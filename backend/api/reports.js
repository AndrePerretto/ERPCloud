const restful = require('node-restful')
const mongoose = restful.mongoose

const reportsLista = new mongoose.Schema ({
    id: { type: Number, required: true },
    nome: { type: String, required: true },
    select: { type: String, required: true },
    html: { type: String, required: true },
})

module.exports = restful.model('reports', reportsLista)