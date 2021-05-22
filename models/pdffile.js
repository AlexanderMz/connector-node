const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const pdffileSchema = new Schema({
    name: { type: String, },
    path: { type: String, },
    fullpath: { type: String, },
    data: { type: Schema.Types.Mixed },
    type: { type: String, },
    size: { type: Number, },
    createdAt: { type: Schema.Types.Date, },
    updatedAt: { type: Schema.Types.Date, },
    fecha: { type: Schema.Types.Date, default: Date.now },
})

module.exports = mongoose.model('PdfFile', pdffileSchema);