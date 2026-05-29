import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import farmerRoutes from './routes/farmer.js'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/orders.js'
import paymentRoutes from './routes/payments.js'
import logisticsRoutes from './routes/logistics.js'
import adminRoutes from './routes/admin.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/farmer', farmerRoutes)
app.use('/api', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/logistics', logisticsRoutes)
app.use('/api/admin', adminRoutes)

export default app
