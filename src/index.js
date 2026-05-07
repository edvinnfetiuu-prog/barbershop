const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const servicesRoutes = require('./routes/services')
const bookingsRoutes = require('./routes/bookings')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Barbershop API is running!' })
})

app.use('/api/auth', authRoutes)
app.use('/api/services', servicesRoutes)
app.use('/api/bookings', bookingsRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})