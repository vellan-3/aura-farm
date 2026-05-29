import express from 'express'
import prisma from '../lib/prisma.js'
import { authenticateToken } from '../middleware/authenticate.js'

const router = express.Router()

router.use(authenticateToken)

// POST /api/orders - Consumer creates order
router.post('/', async (req, res) => {
  try {
    const { farmerId, items, fulfillmentType, deliveryAddress, notes, totalAmount } = req.body

    const consumer = await prisma.consumer.upsert({
      where: { userId: req.user.id },
      update: {},
      create: { userId: req.user.id }
    })

    const order = await prisma.order.create({
      data: {
        consumerId: consumer.id,
        farmerId,
        fulfillmentType,
        deliveryAddress,
        notes,
        totalAmount,
        status: 'PENDING',
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.pricePerUnit,
            unit: item.unit,
            subtotal: item.pricePerUnit * item.quantity
          }))
        },
        statusHistory: {
          create: { status: 'PENDING', note: 'Order placed' }
        }
      },
      include: { items: true }
    })

    res.status(201).json(order)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' })
  }
})

// GET /api/orders - List orders
router.get('/', async (req, res) => {
  try {
    let whereClause = {}
    
    if (req.user.role === 'FARMER') {
      const farmer = await prisma.farmer.findUnique({ where: { userId: req.user.id } })
      if (!farmer) return res.status(404).json({ error: 'Farmer profile not found' })
      whereClause.farmerId = farmer.id
    } else {
      const consumer = await prisma.consumer.findUnique({ where: { userId: req.user.id } })
      if (!consumer) return res.json([]) // No orders yet
      whereClause.consumerId = consumer.id
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        farmer: { select: { farmName: true } },
        items: { include: { product: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(orders)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// GET /api/orders/:id - Order detail
router.get('/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        farmer: { select: { farmName: true, farmAddress: true } },
        consumer: { include: { user: { select: { phone: true } } } },
        items: { include: { product: { select: { name: true, photos: true } } } },
        statusHistory: { orderBy: { createdAt: 'desc' } }
      }
    })

    if (!order) return res.status(404).json({ error: 'Order not found' })

    res.json(order)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order details' })
  }
})

// PATCH endpoints for status updates
const updateStatus = async (orderId, newStatus, req, res) => {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        statusHistory: {
          create: { status: newStatus }
        }
      }
    })
    res.json(order)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' })
  }
}

router.patch('/:id/confirm', (req, res) => updateStatus(req.params.id, 'CONFIRMED', req, res))
router.patch('/:id/decline', (req, res) => updateStatus(req.params.id, 'CANCELLED', req, res))
router.patch('/:id/pack', (req, res) => updateStatus(req.params.id, 'PACKED', req, res))
router.patch('/:id/dispatch', (req, res) => updateStatus(req.params.id, 'DISPATCHED', req, res))

router.patch('/:id/deliver', async (req, res) => {
  try {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        status: 'DELIVERED',
        escrowStatus: 'RELEASED', // Mocking Paystack Escrow release
        statusHistory: { create: { status: 'DELIVERED' } }
      }
    })
    res.json(order)
  } catch (error) {
    res.status(500).json({ error: 'Failed to confirm delivery' })
  }
})

router.patch('/:id/cancel', (req, res) => updateStatus(req.params.id, 'CANCELLED', req, res))

export default router
