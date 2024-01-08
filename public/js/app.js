if (localStorage.getItem('funboardToken')) {
  $('.login-form').hide()
  $('.user-welcome')
    .html(`Hello, ${localStorage.getItem('funboardUsername')}`)
    .show()
}

$('.login-form__submit').click(() => {
  const username = $('.login-form__username').val()
  const password = $('.login-form__password').val()

  $.post("/api/login", { username: username, password: password })
    .done((res) => {
      localStorage.setItem('funboardUsername', username)
      localStorage.setItem('funboardToken', res.token)
    })
    .fail(() => {
      alert('Something went wrong!')
    })
})
