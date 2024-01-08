import mongodb from '../clients/mongodb.js'
import * as random from '../utils/random.js'

const getAll = async function () {
  return mongodb
    .collection('games')
    .find({ isLive: true })
    .toArray()
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
      winner: false,
      createdAt: Date.now(),
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
          position: 0
        }
      ]
    })

  return gameKey
}

export { getAll, createGame }
