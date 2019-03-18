const express = require('express')
const pageRouter = express.Router()

pageRouter
  .get('/', async (req, res) => {
    res.send('hello world!')
  })

module.exports = pageRouter