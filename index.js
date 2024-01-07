import express from 'express'
import mongodb from './src/clients/mongodb.js'
import * as gamesService from './src/services/games.js'

const app = express()
const port = 3000

app.get('/api/games', async (req, res) => {
  const liveGames = await gamesService.getAll()

  res.json({
    data: liveGames
  })
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})

app.on('close', () => {
  mongodb.close()
})
