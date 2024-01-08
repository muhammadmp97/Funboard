import mongodb from '../clients/mongodb.js'
import crypto from 'crypto'
import * as random from '../utils/random.js'

const loginOrRegister = async function (username, password) {
  const user = await mongodb
    .collection('players')
    .findOne({ username: username })

  const token = random.str(64)

  const hashedPassword = crypto
    .createHash('sha256')
    .update(password)
    .digest('hex')

  // Registration
  if (!user) {
    await mongodb
      .collection('players')
      .insertOne({
        username: username,
        password: hashedPassword,
        token: token
      })

    return token
  }

  // Login
  if (user.password !== hashedPassword) {
    return false;
  }

  await mongodb
    .collection('players')
    .updateOne(
      { username: username },
      { $set: { token: token } }
    )

  return token
}

const getByToken = async function (token) {
  return mongodb
    .collection('players')
    .findOne({ token: token })
}

export { loginOrRegister, getByToken }
