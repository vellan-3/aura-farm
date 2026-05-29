import express from 'express'
import { authenticateToken } from '../middleware/authenticate.js'

const router = express.Router()

router.use(authenticateToken)

// POST /api/payments/initiate
router.post('/initiate', async (req, res) => {
  const { orderId, amount } = req.body
  
  // Mock Paystack initiate logic
  const mockPaymentUrl = `https://checkout.paystack.com/mock_${orderId}`
  const mockReference = `ref_${Date.now()}`

  res.json({
    paymentUrl: mockPaymentUrl,
    reference: mockReference,
    message: 'Redirect consumer to paymentUrl'
  })
})

// GET /api/payments/verify/:ref
router.get('/verify/:ref', async (req, res) => {
  // Mock verification
  res.json({ status: 'success', message: 'Payment verified and escrow held.' })
})

export default router
