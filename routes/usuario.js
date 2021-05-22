const express = require('express')
const router = express.Router()
const usuarioController = require('../controllers/usuario')
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion')

router.get('/usuario', verificaToken, usuarioController.getUsuarios)

router.post('/usuario', [verificaToken, verificaAdmin_Role], usuarioController.postUsuario)

router.put('/usuario/:id', [verificaToken, verificaAdmin_Role], usuarioController.putUsuario)

router.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], usuarioController.deleteUsuario)



module.exports = router