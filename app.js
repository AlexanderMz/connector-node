require('./config')

const express = require('express');
const app = express();
const path = require('path')
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Usuario = require('./models/usuario');

const index = require('./routes/index')

app.use(express.json());

app.use(express.static(path.resolve(__dirname + '/public')))
app.use(express.static(path.resolve(__dirname + '/pdfs')))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,path,token')
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition')
  res.setHeader('Access-Control-Allow-Credentials', true)
  next()
})

app.use(index)

mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }, (err, res) => {
  if (err) throw err;
  console.log('Base de datos ONLINE');
  Usuario.find({ email: 'administrador' }, (err, user) => {
    if (!user.length) {
      new Usuario({
        nombre: 'Manager',
        email: 'administrador',
        password: bcrypt.hashSync('admin123', 10),
        role: 'ADMIN_ROLE',
        createfolder: true,
        deletefolder: true,
        deletefiles: true
      }).save()
    }
  })
})

module.exports = app