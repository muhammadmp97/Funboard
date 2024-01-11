import express from 'express'
import mongodb from './src/clients/mongodb.js'
import { createServer } from 'http'
import { Server } from 'socket.io'
import path from './src/utils/path.js'
import gameApiController from './src/controllers/api/game.controller.js'
import * as gameSocketController from './src/controllers/socket/game.controller.js'
import authApiController from './src/controllers/api/authentication.controller.js'
import { getByKey as getGameByKey } from './src/services/games.js'

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path('/public')))

const httpServer = createServer(app);
const io = new Server(httpServer, { });

app.get('/', (req, res) => res.sendFile(path('/src/templates/home.html')))
app.get('/g/:key', (req, res) => res.sendFile(path('/src/templates/game.html')))

app.use('/api/login', authApiController);
app.use('/api/games', gameApiController);

io.on('connection', (socket) => {
  socket.on('connected', (gameKey) => {
    socket.join(`room-${gameKey}`)
  })

  socket.on('join', async (data) => {
    if (await gameSocketController.joinGame(data.token, data.gameKey)) {
      io.to(`room-${data.gameKey}`).emit('joined', { game: await getGameByKey(data.gameKey) })
    }
  })

  socket.on('start', async (data) => {
    if (await gameSocketController.startGame(data.token, data.gameKey)) {
      io.to(`room-${data.gameKey}`).emit('started', { game: await getGameByKey(data.gameKey) })
    }
  })

  socket.on('shake', async (data) => {
    const result = await gameSocketController.shake(data.token, data.gameKey)
    if (result != false) {
      io.to(`room-${data.gameKey}`).emit('shaked', { diceNumber: result, game: await getGameByKey(data.gameKey) })
    }
  })

  socket.on('disconnect', () => {
    //
  })
})

httpServer.listen(3000, () => {
  console.log(`Listening on port ${3000}`)
})

httpServer.on('close', () => {
  mongodb.close()
})
