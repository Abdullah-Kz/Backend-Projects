require('dotenv').config();
const express = require('express')
const app = express()
const port = 4000
app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.get('/Abdullah', (req, res) => {
    res.send('Hello Abdullah!')
})
app.get('/login', (req, res) => {
  res.send('Please login first')
})
app.get('/signup', (req, res) => {
  res.send('Please signup first')
})
app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${port}`)
})