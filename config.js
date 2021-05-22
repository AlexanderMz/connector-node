// ============================
//  Puerto
// ============================
process.env.PORT = process.env.PORT || 8000;


// ============================
//  Entorno
// ============================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';


// ============================
//  Vencimiento del Token
// ============================
// 60 segundos
// 60 minutos
// 24 horas
// 30 días
process.env.CADUCIDAD_TOKEN = "24h";


// ============================
//  SEED de autenticación
// ============================
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';

// ============================
//  Base de datos Mongo
// ============================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    //urlDB = 'mongodb://superAdmin:P4$$w0rd@localhost:27017/filemanager';
    urlDB = 'mongodb://localhost:27017/filemanager';
} else {
    urlDB = process.env.MONGO_URI;
}
process.env.URLDB = urlDB;

// ============================
//  HANA config
// ============================
