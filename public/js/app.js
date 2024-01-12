if (localStorage.getItem('funboardToken')) {
  $('.login-form').hide()
  $('.user-welcome')
    .html(`Hello, ${localStorage.getItem('funboardUsername')}`)
    .show()
}

$.get('/api/games')
  .then(res => {
    res.data.forEach(game => {
      const leader = game.players.filter(player => player.isLeader)[0]
      $('#live-games').append(`<li><a href="/g/${game.key}">${game.key} by ${leader.username} (${game.players.length} player${game.players.length > 1 ? 's' : ''})</a></li>`)
    })
  })

$('.login-form__submit').click(() => {
  const username = $('.login-form__username').val()
  const password = $('.login-form__password').val()

  $.post("/api/login", { username: username, password: password })
    .done((res) => {
      localStorage.setItem('funboardUsername', username)
      localStorage.setItem('funboardToken', res.token)
      location.href = '/'
    })
    .fail(() => {
      alert('Something went wrong!')
    })
})

$('#create-game button').click(() => {
  const isPublic = $('#create-game select').val() == 'public'
  
  $.ajax({
    url: '/api/games',
    type: 'post',
    data: { isPublic: isPublic },
    headers: { Authorization: localStorage.getItem('funboardToken') },
    success: (res) => location.href = `/g/${res.data.key}`
  })
})
