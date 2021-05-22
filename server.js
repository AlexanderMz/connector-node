const compression = require('compression')
const app = require('./app')
app.use(compression());
app.listen(process.env.PORT, () => {
    console.log('INFO', `Server corriendo : ${process.env.PORT}`)
})
