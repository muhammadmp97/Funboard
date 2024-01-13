this.socket = io()
this.game = null
const gameKey = /\/g\/(.*)/.exec(location.href)[1]
const token = localStorage.getItem('funboardToken')

const loadGame = function (key) {
  $.get(`/api/games/${key}`)
    .then(res => {
      this.game = res.data
      document.title = `Funboard - ${gameKey}`
      prepareBoard()
      refreshButtons()

      socket.emit('connected', gameKey)
    })
}

const prepareBoard = function () {
  $('.extra').remove()
  $('.player').remove()

  this.game.board.mines.forEach(position => {
    $(`[data-number=${position}]`).append('<div class="extra">💣</div>')
  })

  this.game.board.prizes.forEach(position => {
    $(`[data-number=${position}]`).append('<div class="extra">🎲</div>')
  })

  this.game.board.stones.forEach(position => {
    $(`[data-number=${position}]`).append('<div class="extra">🪨</div>')
  })

  this.game.board.doors.forEach(door => {
    $(`[data-number=${door.position}]`).append('<div class="extra">🚪</div>')
  })

  $('#players').html('')
  this.game.players.forEach(player => {
    let gamePiece = getGamePieceByColor(player.color)
    if (player.position === 0) {
      $('#players').append(`<div class="player" title="${player.username}">${gamePiece}</div>`)
    } else {
      $(`[data-number=${player.position}]`).append(`<div class="player" title="${player.username}">${gamePiece}</div>`)
    }
  })
}

const refreshButtons = function () {
  const userIsPlayer = this.game.players.some(player => player.username === localStorage.getItem('funboardUsername'))
  if (userIsPlayer || this.game.isStarted) {
    $('#joinButton').attr('disabled', 'disabled')
  }

  if (this.game.isStarted || !this.game.players.some(player => player.username === localStorage.getItem('funboardUsername') && player.isLeader)) {
    $('#startButton').addClass('d-none')
  }

  if (!this.game.isStarted || !userIsPlayer || this.game.players[this.game.turn].username !== localStorage.getItem('funboardUsername')) {
    $('#shakeButton').attr('disabled', 'disabled')
  }

  if (this.game.players[this.game.turn].username === localStorage.getItem('funboardUsername')) {
    $('#shakeButton').removeAttr('disabled')
  }
}

const toast = function (title, content) {
  const timestamps = Date.now()
  const element = `<div class="toast" data-id="${timestamps}" style="display:none;"><div class="toast__title">${title}</div><div class="toast__content">${content}</div></div>`
  $('#toast-wrapper').append(element)
  $(`div[data-id=${timestamps}]`).fadeIn()
  setTimeout(() => {
    $(`div[data-id=${timestamps}]`).remove()
  }, 5000)
}

const getGamePieceByColor = function (color) {
  return {
    red: '🔴',
    blue: '🔵',
    green: '🟢',
    black: '⚫️'
  }[color]
}

const getDiceEmojiByNumber = function (number) {
  return {
    1: '⚀',
    2: '⚁',
    3: '⚂',
    4: '⚃',
    5: '⚄',
    6: '⚅'
  }[number]
}

$('#joinButton').click(() => {
  this.socket.emit('join', { token: token, gameKey: gameKey })
})

$('#startButton').click(() => {
  this.socket.emit('start', { token: token, gameKey: gameKey })
})

$('#shakeButton').click(() => {
  this.socket.emit('shake', { token: token, gameKey: gameKey })
})

this.socket.on('joined', (data) => {
  this.game = data.game
  prepareBoard()
  refreshButtons()
  toast(data.playerUsername, 'I wanna play!')
})

this.socket.on('started', (data) => {
  this.game = data.game
  prepareBoard()
  refreshButtons()
  toast('Funboard', 'Game just started!')
})

this.socket.on('shaked', (data) => {
  this.game = data.game
  prepareBoard()
  refreshButtons()
  toast(data.playerUsername, getDiceEmojiByNumber(data.diceNumber))
})

loadGame(gameKey)
