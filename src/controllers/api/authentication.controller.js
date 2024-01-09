import express from 'express'
import * as authService from '../../services/authentication.js'

const router = express.Router()

router.post('/', async (req, res) => {
  const token = await authService.loginOrRegister(req.body.username, req.body.password)

  if (!token) {
    return res
      .send({ "message": "Authentication failed." })
      .status(401)
  }

  return res.json({ token: token })
})

export default router
