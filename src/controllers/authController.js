const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const pool = require('../db')
require('dotenv').config()

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, role',
      [name, email, hashedPassword]
    )

    res.status(201).json({ message: 'User registered successfully!', user: newUser.rows[0] })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password.' })
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password)
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid email or password.' })
    }

    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({ message: 'Login successful!', token, user: { id: user.rows[0].id, name: user.rows[0].name, email: user.rows[0].email, role: user.rows[0].role } })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
}

module.exports = { register, login }