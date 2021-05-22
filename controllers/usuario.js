const bcrypt = require('bcrypt');
const _ = require('underscore');

const Usuario = require('../models/usuario');

const controller = {
    getUsuarios: (req, res) => {
        let desde = req.query.desde || 0;
        desde = Number(desde);
        let limite = req.query.limite || 5;
        limite = Number(limite);

        Usuario.find({ estado: true }, 'nombre email role estado createfolder deletefolder deletefiles')
            .exec((err, usuarios) => {
                if (err) return res.status(400).json({ ok: false, err });
                res.json({ ok: true, usuarios, });
            });
    },
    postUsuario: (req, res) => {
        const body = req.body;
        const usuario = new Usuario({
            nombre: body.nombre,
            email: body.email,
            password: bcrypt.hashSync(body.password, 10),
            createfolder: body.createfolder,
            deletefolder: body.deletefolder,
            deletefiles: body.deletefiles
        });
        usuario.save((err, usuarioDB) => {
            if (err) return res.status(400).json({ ok: false, err });
            res.json({ ok: true, usuario: usuarioDB });
        });
    },
    putUsuario: (req, res) => {
        const id = req.params.id;
        const body = _.pick(req.body, ['nombre', 'createfolder', 'deletefolder', 'deletefiles']);
        Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: false, useFindAndModify: true }, (err, usuarioDB) => {
            if (err) return res.status(400).json({ ok: false, err });
            res.json({ ok: true });
        })
    },
    deleteUsuario: (req, res) => {
        const id = req.params.id;
        const cambiaEstado = { estado: false }
        Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true, useFindAndModify: true }, (err, usuarioBorrado) => {
            if (err) return res.status(400).json({ ok: false, err });
            if (!usuarioBorrado) return res.status(400).json({ ok: false, err: { message: 'Usuario no encontrado' } });
            res.json({ ok: true, usuario: usuarioBorrado });
        });
    }
}

module.exports = controller