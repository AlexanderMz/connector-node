const fs = require('fs');
var multer = require('multer')
const formidable = require('formidable')
const pdfjsLib = require('pdfjs-dist/es5/build/pdf')

const pdfFile = require('../models/pdffile')

const apiResponse = (res, status = 200) =>
    (data, success = true, errorMsg = null, error = null) =>
        res.status(status).json({
            data,
            success,
            errorMsg,
            error,
        })

const apiError = (res, status = 500) =>
    (errorMsg = null, error = null) =>
        apiResponse(res, status)(null, false, errorMsg, error)


const gettext = (pdfUrl) => {
    var pdf = pdfjsLib.getDocument(pdfUrl).promise;
    return pdf.then(function (pdf) { // get all pages text
        var maxPages = pdf.numPages;
        var countPromises = []; // collecting all page promises
        for (var j = 1; j <= maxPages; j++) {
            var page = pdf.getPage(j);

            var txt = "";
            countPromises.push(page.then(function (page) { // add page promise
                var textContent = page.getTextContent();
                return textContent.then(function (text) { // return content promise
                    return text.items.map(function (s) { return s.str; }).join(''); // value page text 
                });
            }));
        }
        // Wait for all pages and join text
        return Promise.all(countPromises).then(function (texts) {
            return texts.join('');
        });
    });
}
const controller = {
    list: (req, res) => {
        const sfpath = req.query.path || 'pdfs';

        fs.readdir(sfpath, { withFileTypes: true }, (err, files) => {
            if (err) {
                return apiError(res)('Cannot read that folder', err);
            }

            const items = (files || []).filter(x => x.isDirectory()).map((f) => {
                const fpath = `${sfpath}/${f.name}`;
                let type = 'file';
                let size = 0;
                let createdAt = null;
                let updatedAt = null;
                try {
                    const stat = fs.statSync(fpath);
                    type = stat.isDirectory() ? 'dir' : type;
                    size = stat.size || size;
                    createdAt = stat.birthtimeMs;
                    updatedAt = stat.mtimeMs;
                } catch (e) {
                    return null;
                }
                return {
                    label: f.name,
                    path: fpath,
                    lazy: true,
                    children: []
                };
            })//.filter(Boolean);

            return apiResponse(res)(items);
        });
    },
    files: (req, res) => {
        const sfpath = req.query.path || 'pdfs';
        pdfFile.find({ 'path': sfpath }, 'name path fullpath size')
            .exec((err, result) => {
                if (err) {
                    return res.status(400).json({
                        err
                    })
                }
                return apiResponse(res)(result);
            })
    },

    dirCreate: (req, res) => {
        const fullPath = `${req.body.path}/${req.body.directory}`;

        if (fs.existsSync(fullPath)) {
            return apiError(res)('El directorio o carpeta ya existe');
        }
        try {
            const result = fs.mkdirSync(fullPath);
            console.log('Nuevo directorio creado en: ', fullPath)
            return apiResponse(res)(result);
        } catch (err) {
            console.log('Error al intentar crear:', fullPath)
            return apiError(res)('Error al crear el directorio, evite usar caracteres especiales', err);
        }
    },

    dirDelete: (req, res) => {
        const fullPath = `${req.body.path}`;

        if (fs.existsSync(fullPath)) {
            try {
                const result = fs.rmdirSync(fullPath, { recursive: true });
                console.log('Este directorio ha sido borrado: ', fullPath)
                return apiResponse(res)(result);
            } catch (err) {
                return apiError(res)('Unknown error deleting folder', err);
            }
        }

    },

    fileContent: (req, res) =>
        res.sendFile(path.resolve(req.query.path)),

    itemsCopy: (req, res) => {
        const {
            path,
            filenames,
            destination,
        } = req.body;

        const promises = (filenames || []).map(f =>
            new Promise((resolve, reject) => {
                const oldPath = `${path}/${f}`;
                const newPath = `${destination}/${f}`;
                fs.copyFile(oldPath, newPath, (err) => {
                    const response = {
                        success: !err,
                        error: err,
                        oldPath,
                        newPath,
                        filename: f,
                    };
                    return err ? reject(response) : resolve(response);
                });
            }));

        Promise.all(promises)
            .then(values => apiResponse(res)(values))
            .catch(err => apiError(res)('An error ocurred copying files', err));
    },

    itemsMove: (req, res) => {
        const {
            path,
            filenames,
            destination,
        } = req.body;

        const promises = (filenames || []).map(f =>
            new Promise((resolve, reject) => {
                const oldPath = `${path}/${f}`;
                const newPath = `${destination}/${f}`;
                fs.rename(oldPath, newPath, (err) => {
                    const response = {
                        success: !err,
                        error: err,
                        oldPath,
                        newPath,
                        filename: f,
                    };
                    return err ? reject(response) : resolve(response);
                });
            }));

        Promise.all(promises)
            .then(values => apiResponse(res)(values))
            .catch(err => apiError(res)('An error ocurred moving files', err));
    },

    itemMove: (req, res) => {
        const {
            path,
            destination,
        } = req.body;

        const promise = new Promise((resolve, reject) =>
            fs.rename(path, destination, (err) => {
                const response = {
                    success: !err,
                    error: err,
                    path,
                    destination,
                };
                return err ? reject(response) : resolve(response);
            }));

        promise
            .then(values => apiResponse(res)(values))
            .catch(err => apiError(res)('An error ocurred renaming file', err));
    },

    itemsUpload2: (req, res) => {
        const pdfFilter = function (req, file, cb) {
            // Accept images only
            if (!file.originalname.match(/\.(pdf|PDF)$/)) {
                req.fileValidationError = 'Only pdf files are allowed!';
                return cb(new Error('Only pdf files are allowed!'), false);
            }
            cb(null, true);
        };
        const upload = multer({
            storage: multer.diskStorage({
                destination: req.headers.path, //(req, file, cb) => cb(null, req.headers.path),
                filename: (req, file, cb) => cb(null, file.originalname),
            }),
            fileFilter: pdfFilter,
        }).array('file[]');

        upload((req, res, err) => {
            if (err) {
                return apiError(res)('An error occurred uploading files', err);
            }
            if (!req.files.length) {
                return apiError(res)('Cannot find any file to upload');
            }
            return apiResponse(res)(true);
        });
    },

    itemsUpload: async (req, res) => {
        try {
            const form = new formidable.IncomingForm({ multiple: true, keepExtensions: true, uploadDir: req.headers.path })
            // form.multiples = true
            // form.uploadDir
            form.on('file', function (field, file) {
                fs.rename(file.path, form.uploadDir + "/" + file.name, function () { })
            })
            form.on('error', function (err) {
                console.log("an error has occured with form upload");
                console.log(err);
                req.resume();
            })

            form.on('aborted', function (err) {
                console.log("user aborted upload");
            })

            form.on('end', function (field, files) {
                console.log('-> upload done');
            })

            form.parse(req, (_, fields, files) => {
                console.log('Nuevo(s) archivo(s) recibido:', Object.keys(files))
                console.log('Destino: ', form.uploadDir)
                console.log()
                //Save db
                try {

                    Object.keys(files).map(file => {

                        gettext(form.uploadDir + "/" + file).then(txt => {
                            const stat = fs.statSync(form.uploadDir + "/" + file);
                            let pdffile = new pdfFile({
                                name: file,
                                path: form.uploadDir,
                                fullpath: form.uploadDir + "/" + file,
                                data: txt,
                                type: stat.type,
                                size: stat.size,
                                createdAt: new Date(stat.birthtimeMs),
                                updatedAt: new Date(stat.mtimeMs),
                            })

                            pdffile.save((err, pdffileDB) => {
                                if (err) {
                                    console.error(err)
                                }
                            })
                        })

                    })
                } catch (error) {
                    console.log(error)
                }
                res.end()
                //res.send({ fields, files })
            })
        } catch (err) {
            res.status(500).send(err);
        }
    },

    upload: async (req, res) => {
        try {
            const criteria = req.query.criteria
            const form = new formidable.IncomingForm({ multiple: true, keepExtensions: true, uploadDir: req.headers.path })
            // form.multiples = true
            // form.uploadDir
            form.on('file', function (field, file) {
                fs.rename(file.path, form.uploadDir + "/" + file.name, function () { })
            })
            form.on('error', function (err) {
                console.log("an error has occured with form upload");
                console.log(err);
                req.resume();
            })

            form.on('aborted', function (err) {
                console.log("user aborted upload");
            })

            form.on('end', function (field, files) {
                console.log('-> upload done');
            })

            form.parse(req, (_, fields, files) => {
                console.log('Nuevo(s) archivo(s) recibido:', Object.keys(files))
                console.log('Destino: ', form.uploadDir)
                console.log()
                //Save db
                try {

                    Object.keys(files).map(file => {

                        gettext(form.uploadDir + "/" + file).then(txt => {
                            res.send({ match: txt.RegExp(criteria) })
                        })

                    })
                } catch (error) {
                    console.log(error)
                }
                res.end()
                //res.send({ fields, files })
            })
        } catch (err) {
            res.status(500).send(err);
        }
    },

    find: (req, res) => {
        let criteria = req.query.criteria
        pdfFile.find({ 'data': new RegExp(criteria, 'i') }, 'name path fullpath')
            .exec((err, result) => {
                if (err) {
                    return res.status(400).json({
                        err
                    })
                }
                res.json({
                    ok: true,
                    resultado: result
                })
            })
    },

    itemRemove: (req, res) => {
        const { id } = req.body
        pdfFile.findByIdAndDelete(id, (err, pdfborrado) => {
            if (err) {
                return res.status(400).json({
                    err
                })
            }
            if (!pdfborrado) {
                return res.status(400).json({
                    err: 'No existe'
                })
            }

            fs.unlink(pdfborrado.fullpath, (err) => {
                if (err) {
                    return apiError(res)('An error ocurred deleting file', err)
                }
                console.log('Se ha borrado el archivo: ', pdfborrado.fullpath)
                return apiResponse(res)([]);
            });
        })
    },

    itemsRemove: (req, res) => {
        const {
            path,
            filenames,
        } = req.body;
        const promises = (filenames || []).map((f) => {
            const fullPath = `${path}/${f}`;
            return new Promise((resolve, reject) => {
                fs.unlink(fullPath, (err) => {
                    const response = {
                        success: !err,
                        error: err,
                        path,
                        filename: f,
                        fullPath,
                    };
                    return err ? reject(response) : resolve(response);
                });
            });
        });

        Promise.all(promises)
            .then(values => apiResponse(res)(values))
            .catch(err => apiError(res)('An error ocurred deleting file', err));
    }
}

module.exports = controller