import express from 'express'
import prisma from '../lib/prisma.js'
import { authenticateToken } from '../middleware/authenticate.js'
import { requireRole } from '../middleware/requireRole.js'

const router = express.Router()

router.use(authenticateToken)
router.use(requireRole('ADMIN'))

// GET /api/admin/metrics
router.get('/metrics', async (req, res) => {
  try {
    const totalUsers = await prisma.user.count()
    const totalOrders = await prisma.order.count()
    const totalRevenueResult = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { in: ['DELIVERED', 'DISPATCHED', 'CONFIRMED'] } }
    })
    
    const unverifiedFarmers = await prisma.farmer.count({
      where: { kycStatus: 'SUBMITTED' }
    })

    res.json({
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenueResult._sum.totalAmount || 0,
      unverifiedFarmers
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metrics' })
  }
})

// GET /api/admin/kyc-applications
router.get('/kyc-applications', async (req, res) => {
  try {
    const farmers = await prisma.farmer.findMany({
      where: { kycStatus: { in: ['SUBMITTED', 'PENDING'] } },
      include: { user: { select: { phone: true, email: true } } },
      orderBy: { createdAt: 'asc' }
    })
    res.json(farmers)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch KYC applications' })
  }
})

// PATCH /api/admin/kyc/:farmerId
router.patch('/kyc/:farmerId', async (req, res) => {
  try {
    const { status } = req.body // 'VERIFIED' or 'REJECTED'
    
    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const farmer = await prisma.farmer.update({
      where: { id: req.params.farmerId },
      data: { kycStatus: status }
    })
    
    res.json({ message: `Farmer KYC updated to ${status}`, farmer })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update KYC status' })
  }
})

export default router
