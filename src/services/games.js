import mongodb from '../clients/mongodb.js'
import * as random from '../utils/random.js'

const getAll = async function () {
  return mongodb
    .collection('games')
    .find({ isLive: true, isPublic: true })
    .toArray()
}

const getByKey = async function (key) {
  return mongodb
    .collection('games')
    .findOne({ key: key })
}

const createGame = async function (leader, isPublic) {
  const gameKey = random.str(6, true)

  let mineCount = 4
  let prizeCount = 2
  let stoneCount = 2
  let doorCount = 2

  let mines = []
  while (mineCount > 0) {
    let position = random.between(2, 29)

    if (mines.includes(position)) {
      continue
    }

    mines.push(position)
    mineCount--
  }

  let prizes = []
  while (prizeCount > 0) {
    let position = random.between(2, 29)

    if (prizes.includes(position) || mines.includes(position)) {
      continue
    }

    prizes.push(position)
    prizeCount--
  }

  let doors = []
  while (doorCount > 0) {
    let position = random.between(2, 28)
    let destinition = random.between(position + 1, 29)

    if (mines.includes(position) || prizes.includes(position)) {
      continue
    }

    if (doors.filter(door => door.position === position).length > 0) {
      continue
    }

    doors.push({ position: position, destinition: destinition })
    doorCount--
  }

  let stones = []
  while (stoneCount > 0) {
    let position = random.between(2, 29)

    if (stones.includes(position) || mines.includes(position) || prizes.includes(position)) {
      continue
    }

    if (doors.filter(door => door.position === position).length > 0) {
      continue
    }

    stones.push(position)
    stoneCount--
  }

  await mongodb
    .collection('games')
    .insertOne({
      key: gameKey,
      isPublic: isPublic,
      isLive: true,
      isStarted: false,
      winner: null,
      createdAt: Date.now(),
      turn: 0,
      board: {
        mines: mines,
        prizes: prizes,
        doors: doors,
        stones: stones
      },
      players: [
        {
          username: leader.username,
          color: 'red',
          isLeader: true,
          position: 0,
        }
      ]
    })

  return gameKey
}

const addPlayerToGame = async function (gameKey, playerUsername, playerColor) {
  const playerObject = {
    username: playerUsername,
    color: playerColor,
    isLeader: false,
    position: 0
  }

  mongodb
    .collection('games')
    .updateOne(
      { key: gameKey },
      { $push: { players: playerObject } }
    )
}

const startGame = async function (gameKey) {
  mongodb
    .collection('games')
    .updateOne(
      { key: gameKey },
      { $set: { isStarted: true } }
    )
}

const handleShake = async function (game, diceNumber) {
  let nextTurn = game.turn
  const playerPosition = game.players[game.turn].position

  nextTurn = game.turn == game.players.length - 1 ? 0 : game.turn + 1
  if (diceNumber === 6) {
    nextTurn = game.turn
  }

  let newPosition = 0
  if (playerPosition === 0 && diceNumber === 6) {
    newPosition = 1
  } else if (playerPosition !== 0) {
    newPosition += diceNumber
  }

  if (newPosition === 30) {
    return mongodb
      .collection('games')
      .updateOne(
        { key: game.key },
        {
          $set: {
            winner: game.players[game.turn].username,
            isLive: false,
            [`players.${game.turn}.position`]: 30
          }
        }
      )
  }

  if (newPosition > 30) {
    newPosition = playerPosition
  }

  if (game.board.stones.includes(newPosition)) {
    newPosition = playerPosition
  }

  if (game.board.doors.some(door => door.position === newPosition)) {
    let door = game.board.doors.filter(door => door.position === newPosition)[0]
    newPosition = door.destinition
  }

  let newMines = game.board.mines
  if (game.board.mines.includes(newPosition)) {
    newMines = newMines.filter(position => position !== newPosition)
    newPosition = 0
  }

  let newPrizes = game.board.prizes
  if (game.board.prizes.includes(newPosition)) {
    newPrizes = newPrizes.filter(position => position !== newPosition)
    nextTurn = game.turn
  }

  mongodb
    .collection('games')
    .updateOne(
      { key: game.key },
      {
        $set: {
          turn: nextTurn,
          'board.mines': newMines,
          'board.prizes': newPrizes,
          [`players.${game.turn}.position`]: newPosition
        }
      }
    )
}

export { getAll, getByKey, createGame, addPlayerToGame, startGame, handleShake }
