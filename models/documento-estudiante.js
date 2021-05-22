const mongoose = require('mongoose');
const acta = require('./acta');
const anexo = require('./anexo');
const foto = require('./foto');

const Schema = mongoose.Schema;

const documentoEstudianteSchema = new Schema({
    id_estudiante: { type: Schema.Types.ObjectId, ref: 'Estudiante', required: true },
    solicitud_ingreso: { type: String, required: false },
    curriculum_vitae: { type: String, required: false },
    acta_nacimiento: { type: String, required: false },
    actas_hijos_menores: { type: [acta], default: undefined, required: false },
    FRC: { type: String, required: false },
    CRUP: { type: String, required: false },
    comprobate_domicilio: { type: String, required: false },
    titulo_licenciatura: { type: String, required: false },
    cedula_profecional: { type: String, required: false },
    kardex_licenciatura: { type: String, required: false },
    titulo_maestria: { type: String, required: false },
    cedula_maestria: { type: String, required: false },
    kardex_maestria: { type: String, required: false },
    fotos_infantil: { type: [foto], default: undefined, required: false },
    anexos: { type: [anexo], default: undefined, required: false },
    confirmacio_cuenta_nomina: { type: String, required: false }
});



module.exports = mongoose.model('DocumentoEstudiante', documentoEstudianteSchema);