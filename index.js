import express from 'express'
import { fileURLToPath } from 'url'
import path from 'path'
import mongodb from './src/clients/mongodb.js'
import * as gamesService from './src/services/games.js'
import * as authService from './src/services/authentication.js'

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use(express.static(__dirname + '/public'))
const port = 3000

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/src/templates/home.html'))
})

app.get('/g/:key', (req, res) => {
  res.sendFile(path.join(__dirname, '/src/templates/game.html'))
})

app.post('/api/login', async (req, res) => {
  const token = await authService.loginOrRegister(req.body.username, req.body.password)

  if (!token) {
    return res
      .send({ "message": "Authentication failed." })
      .status(401)
  }

  return res.json({ token: token })
})

app.get('/api/games', async (req, res) => {
  const liveGames = await gamesService.getAll()

  res.json({
    data: liveGames
  })
})

app.get('/api/games/:key', async (req, res) => {
  const game = await gamesService.getByKey(req.params.key)

  if (!game) {
    return res
      .json({ message: 'Game not found.' })
      .status(404)
  }

  return res.json({ data: game })
})

app.post('/api/games', async (req, res) => {
  const leader = await authService.getByToken(req.header('Authorization'))
  const gameKey = await gamesService.createGame(leader, req.body.isPublic == 'true')

  return res.json({
    data: {
      key: gameKey
    }
  })
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})

app.on('close', () => {
  mongodb.close()
})
