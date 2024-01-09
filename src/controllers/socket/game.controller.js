import { getByToken as getPlayerByToken } from "../../services/authentication.js"
import * as gamesService from "../../services/games.js"

const joinGame = async function (playerToken, gameKey) {
  const player = await getPlayerByToken(playerToken)
  const game = await gamesService.getByKey(gameKey)

  if (!player || !game) {
    return false
  }

  if (game.players.some(gamePlayer => gamePlayer.username === player.username)) {
    return false
  }

  if (game.isStarted) {
    return false
  }

  if (game.players.length >= 4) {
    return false
  }

  const usedColors = game.players.map(player => player.color)
  const playerColor = ['red', 'blue', 'green', 'black'].filter(color => !usedColors.includes(color))[0]
  await gamesService.addPlayerToGame(gameKey, player.username, playerColor)

  return true
}

const startGame = async function (playerToken, gameKey) {
  const player = await getPlayerByToken(playerToken)
  const game = await gamesService.getByKey(gameKey)

  if (!player || !game) {
    return false
  }

  if (game.isStarted) {
    return false
  }

  const playerIsLeader = game.players.some(gamePlayer => player.username === gamePlayer.username && gamePlayer.isLeader)
  if (!playerIsLeader) {
    return false
  }

  await gamesService.startGame(gameKey)

  return true
}

export { joinGame, startGame }
