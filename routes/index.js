const express = require('express');
const app = express()

app.use('/', require('./filemanager'))
app.use('/', require('./login'))
app.use('/', require('./usuario'))

/* GET home page. */
app.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

module.exports = app;