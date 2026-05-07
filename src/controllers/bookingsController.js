const pool = require('../db')

const createBooking = async (req, res) => {
  try {
    const { service_id, booking_date, booking_time } = req.body
    const user_id = req.user.id

    const newBooking = await pool.query(
      'INSERT INTO bookings (user_id, service_id, booking_date, booking_time) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, service_id, booking_date, booking_time]
    )

    res.status(201).json({ message: 'Booking created!', booking: newBooking.rows[0] })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
}

const getMyBookings = async (req, res) => {
  try {
    const user_id = req.user.id
    const bookings = await pool.query(
      `SELECT b.id, s.name as service, s.price, b.booking_date, b.booking_time, b.status 
       FROM bookings b 
       JOIN services s ON b.service_id = s.id 
       WHERE b.user_id = $1 
       ORDER BY b.booking_date, b.booking_time`,
      [user_id]
    )
    res.json(bookings.rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
}

const getAllBookings = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' })
    }
    const bookings = await pool.query(
      `SELECT b.id, u.name as customer, u.email, s.name as service, s.price, b.booking_date, b.booking_time, b.status 
       FROM bookings b 
       JOIN users u ON b.user_id = u.id 
       JOIN services s ON b.service_id = s.id 
       ORDER BY b.booking_date, b.booking_time`
    )
    res.json(bookings.rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
}

const updateBookingStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' })
    }
    const { id } = req.params
    const { status } = req.body

    const updated = await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    )
    res.json({ message: 'Booking updated!', booking: updated.rows[0] })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
}

module.exports = { createBooking, getMyBookings, getAllBookings, updateBookingStatus }