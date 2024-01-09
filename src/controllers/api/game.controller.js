import express from 'express'
import * as gamesService from '../../services/games.js'
import * as authService from '../../services/authentication.js'

const router = express.Router()

router.get('/', async function (req, res) {
  const liveGames = await gamesService.getAll()

  res.json({
    data: liveGames
  })
})

router.post('/', async (req, res) => {
  const leader = await authService.getByToken(req.header('Authorization'))
  const gameKey = await gamesService.createGame(leader, req.body.isPublic == 'true')

  return res.json({
    data: {
      key: gameKey
    }
  })
})

router.get('/:key', async function (req, res) {
  const game = await gamesService.getByKey(req.params.key)

  if (!game) {
    return res
      .json({ message: 'Game not found.' })
      .status(404)
  }

  return res.json({ data: game })
})

export default router
