const express = require('express')
const cors = require('cors')
const session = require('express-session')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
require('dotenv').config()

const authRoutes = require('./routes/auth')
const servicesRoutes = require('./routes/services')
const bookingsRoutes = require('./routes/bookings')
const pool = require('./db')

const app = express()

app.use(cors({ origin: '*' }))
app.use(express.json())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value
    const name = profile.displayName
    let user = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    if (user.rows.length === 0) {
      user = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, email, 'google-oauth', 'customer']
      )
    }
    return done(null, user.rows[0])
  } catch (err) {
    return done(err)
  }
}))

passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser(async (id, done) => {
  const user = await pool.query('SELECT * FROM users WHERE id = $1', [id])
  done(null, user.rows[0])
})

app.get('/', (req, res) => res.json({ message: 'Barbershop API is running!' }))

app.use('/api/auth', authRoutes)
app.use('/api/services', servicesRoutes)
app.use('/api/bookings', bookingsRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))