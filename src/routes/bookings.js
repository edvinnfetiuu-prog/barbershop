const express = require('express')
const router = express.Router()
const authenticateToken = require('../middleware/auth')
const { createBooking, getMyBookings, getAllBookings, updateBookingStatus } = require('../controllers/bookingsController')

router.post('/', authenticateToken, createBooking)
router.get('/my', authenticateToken, getMyBookings)
router.get('/all', authenticateToken, getAllBookings)
router.patch('/:id', authenticateToken, updateBookingStatus)

module.exports = router