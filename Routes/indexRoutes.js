const express =require('express')
const { firtspage } = require('../controller/chessController')
const router = express.Router()
router.get('/', firtspage)
module.exports =router