const express = require('express')
const router = express.Router()
const filemanagerController = require('../controllers/filemanager')

router.get('/filemanager/list', filemanagerController.list);

router.get('/filemanager/files', filemanagerController.files);

router.post('/filemanager/dir/create', filemanagerController.dirCreate);

router.post('/filemanager/dir/delete', filemanagerController.dirDelete);

router.get('/filemanager/file/content', filemanagerController.fileContent)

router.post('/filemanager/items/copy', filemanagerController.itemsCopy);

router.post('/filemanager/items/move', filemanagerController.itemsMove);

router.post('/filemanager/item/move', filemanagerController.itemMove);

router.post('/filemanager/items/upload2', filemanagerController.itemsUpload2);

router.post('/filemanager/items/upload', filemanagerController.itemsUpload)

router.post('/upload', filemanagerController.upload)

router.get('/filemanager/find', filemanagerController.find)

router.post('/filemanager/item/remove/', filemanagerController.itemRemove);

router.post('/filemanager/items/remove', filemanagerController.itemsRemove);

module.exports = router