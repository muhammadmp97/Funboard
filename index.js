import express from 'express'
import mongodb from './src/clients/mongodb.js'
import path from './src/utils/path.js'
import gameApiController from './src/controllers/api/game.controller.js'
import authApiController from './src/controllers/api/authentication.controller.js'

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path('/public')))

app.get('/', (req, res) => res.sendFile(path('/src/templates/home.html')))
app.get('/g/:key', (req, res) => res.sendFile(path('/src/templates/game.html')))

app.use('/api/login', authApiController);
app.use('/api/games', gameApiController);

app.listen(3000, () => {
  console.log(`Listening on port ${3000}`)
})

app.on('close', () => {
  mongodb.close()
})
