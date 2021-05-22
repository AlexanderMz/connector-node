const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

const estudianteSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    email: { type: String, unique: true, required: [true, 'El correo es necesario'] },
    telefono: { type: String, unique: true, required: [true, 'El telefono es necesario'] },
    direccion: { type: String, unique: true, required: [true, 'La dirección es requerida'] },
    img: { type: String, required: false },
    matricula: { type: String, required: true },
    carrera: { type: String, required: true },
})

estudianteSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' })

module.exports = mongoose.model('Estudiante', estudianteSchema);