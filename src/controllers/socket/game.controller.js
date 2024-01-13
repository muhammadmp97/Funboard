import { getByToken as getPlayerByToken } from "../../services/authentication.js"
import * as gamesService from "../../services/games.js"
import * as random from "../../utils/random.js"

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
  const playerColor = ['red', 'blue', 'green', 'black'].filter(color => !usedColors.includes(color))
  await gamesService.addPlayerToGame(gameKey, player.username, random.fromArray(playerColor).value)

  return player
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

const shake = async function (playerToken, gameKey) {
  const player = await getPlayerByToken(playerToken)
  const game = await gamesService.getByKey(gameKey)

  if (!player || !game) {
    return false
  }

  if (!game.isStarted) {
    return false
  }

  if (game.players[game.turn].username !== player.username) {
    return false
  }

  const diceNumber = random.between(1, 6)
  await gamesService.handleShake(game, diceNumber)

  return {
    player: player,
    diceNumber: diceNumber
  }
}

export { joinGame, startGame, shake }
