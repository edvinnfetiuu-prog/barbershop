const pool = require('../db')

const getServices = async (req, res) => {
  try {
    const services = await pool.query('SELECT * FROM services ORDER BY id')
    res.json(services.rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
}

module.exports = { getServices }