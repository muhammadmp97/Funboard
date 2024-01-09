import { getByToken as getPlayerByToken } from "../../services/authentication.js"
import { getByKey as getGameByKey, addPlayerToGame } from "../../services/games.js"

const joinGame = async function (playerToken, gameKey) {
  const player = await getPlayerByToken(playerToken)
  const game = await getGameByKey(gameKey)

  if (!player || !game) {
    return false
  }

  if (game.players.some(gamePlayer => gamePlayer.username === player.username)) {
    return false
  }

  if (game.players.length >= 4) {
    return false
  }

  const usedColors = game.players.map(player => player.color)
  const playerColor = ['red', 'blue', 'green', 'black'].filter(color => !usedColors.includes(color))[0]
  await addPlayerToGame(gameKey, player.username, playerColor)

  return true
}

export { joinGame }
