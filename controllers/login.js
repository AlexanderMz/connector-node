const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Usuario = require('../models/usuario');

const controller = {
    login: (req, res) => {
        let body = req.body;
        Usuario.findOne({ email: body.email, estado: true }, (err, usuarioDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!usuarioDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: '(Usuario) no registrado'
                    }
                });
            }
            if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Error al iniciar la contraseña no es valida'
                    }
                });
            }
            let token = jwt.sign({
                usuario: usuarioDB
            }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

            res.json({
                ok: true,
                usuario: usuarioDB,
                token
            });
        })
    }
}


module.exports = controller