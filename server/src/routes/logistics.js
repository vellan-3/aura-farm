import express from 'express'
import prisma from '../lib/prisma.js'
import { authenticateToken } from '../middleware/authenticate.js'
import { requireRole } from '../middleware/requireRole.js'

const router = express.Router()

// Utility function to calculate Haversine distance
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// PUBLIC POST /api/logistics/calculate-fee
router.post('/calculate-fee', async (req, res) => {
  try {
    const { farmerId, consumerLat, consumerLng, cartTotal } = req.body

    const farmer = await prisma.farmer.findUnique({
      where: { id: farmerId },
      include: { deliveryZones: { where: { isActive: true } } }
    })

    if (!farmer || !farmer.latitude || !farmer.longitude) {
      return res.status(400).json({ error: 'Farm location not configured' })
    }

    const distance = getDistance(farmer.latitude, farmer.longitude, consumerLat, consumerLng)

    // Find applicable zone
    const applicableZone = farmer.deliveryZones.find(z => distance <= z.maxRadiusKm)

    if (!applicableZone) {
      return res.status(400).json({ error: 'Delivery not available for this distance' })
    }

    if (cartTotal < applicableZone.minOrderVal) {
      return res.status(400).json({ error: `Minimum order value for this zone is ₦${applicableZone.minOrderVal}` })
    }

    const deliveryFee = applicableZone.baseFee + (distance * applicableZone.feePerKm)
    res.json({ deliveryFee: Math.round(deliveryFee), distanceKm: distance.toFixed(2), zone: applicableZone.name })

  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate fee' })
  }
})

// Protected routes for Farmer
router.use(authenticateToken)
router.use(requireRole('FARMER'))

router.get('/zones', async (req, res) => {
  try {
    const farmer = await prisma.farmer.findUnique({ where: { userId: req.user.id } })
    const zones = await prisma.deliveryZone.findMany({ where: { farmerId: farmer.id } })
    res.json(zones)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch zones' })
  }
})

router.post('/zones', async (req, res) => {
  try {
    const farmer = await prisma.farmer.findUnique({ where: { userId: req.user.id } })
    const payload = {
      ...req.body,
      maxRadiusKm: parseFloat(req.body.maxRadiusKm),
      baseFee: parseFloat(req.body.baseFee),
      feePerKm: parseFloat(req.body.feePerKm),
      minOrderVal: parseFloat(req.body.minOrderVal)
    }

    const zone = await prisma.deliveryZone.create({
      data: { ...payload, farmerId: farmer.id }
    })
    res.status(201).json(zone)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create zone' })
  }
})

router.delete('/zones/:id', async (req, res) => {
  try {
    const farmer = await prisma.farmer.findUnique({ where: { userId: req.user.id } })
    await prisma.deliveryZone.deleteMany({
      where: { id: req.params.id, farmerId: farmer.id }
    })
    res.json({ message: 'Zone deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete zone' })
  }
})

export default router
