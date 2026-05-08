const express = require('express')
const router = express.Router()
const { register, login } = require('../controllers/authController')
const passport = require('passport')
const jwt = require('jsonwebtoken')

router.post('/register', register)
router.post('/login', login)

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.redirect(`https://testrail.netlify.app?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`)
  }
)

module.exports = router