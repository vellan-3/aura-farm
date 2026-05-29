import express from 'express'
import prisma from '../lib/prisma.js'
import { authenticateToken } from '../middleware/authenticate.js'
import { requireRole } from '../middleware/requireRole.js'

const router = express.Router()

router.use(authenticateToken)
router.use(requireRole('FARMER'))

// GET /api/farmer/profile
router.get('/profile', async (req, res) => {
  try {
    const farmer = await prisma.farmer.findUnique({
      where: { userId: req.user.id }
    })
    
    if (!farmer) return res.status(404).json({ error: 'Farmer profile not found' })
    
    res.json(farmer)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

// PUT /api/farmer/profile
router.put('/profile', async (req, res) => {
  try {
    const { farmName, farmAddress, bio, latitude, longitude } = req.body
    
    const farmer = await prisma.farmer.upsert({
      where: { userId: req.user.id },
      update: { farmName, farmAddress, bio, latitude, longitude },
      create: {
        userId: req.user.id,
        farmName,
        farmAddress,
        bio,
        latitude,
        longitude
      }
    })
    
    res.json(farmer)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// GET /api/farmer/products
router.get('/products', async (req, res) => {
  try {
    const farmer = await prisma.farmer.findUnique({ where: { userId: req.user.id } })
    if (!farmer) return res.status(404).json({ error: 'Farmer not found' })

    const products = await prisma.product.findMany({
      where: { farmerId: farmer.id },
      orderBy: { createdAt: 'desc' }
    })
    res.json(products)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// POST /api/farmer/products
router.post('/products', async (req, res) => {
  try {
    const farmer = await prisma.farmer.findUnique({ where: { userId: req.user.id } })
    if (!farmer) return res.status(404).json({ error: 'Farmer profile not found' })

    const product = await prisma.product.create({
      data: {
        ...req.body,
        farmerId: farmer.id
      }
    })
    res.status(201).json(product)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' })
  }
})

// GET /api/farmer/products/:id
router.get('/products/:id', async (req, res) => {
  try {
    const farmer = await prisma.farmer.findUnique({ where: { userId: req.user.id } })
    const product = await prisma.product.findFirst({
      where: { id: req.params.id, farmerId: farmer?.id }
    })
    if (!product) return res.status(404).json({ error: 'Product not found' })
    res.json(product)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

// PUT /api/farmer/products/:id
router.put('/products/:id', async (req, res) => {
  try {
    const farmer = await prisma.farmer.findUnique({ where: { userId: req.user.id } })
    
    const product = await prisma.product.updateMany({
      where: { id: req.params.id, farmerId: farmer?.id },
      data: req.body
    })
    
    if (product.count === 0) return res.status(404).json({ error: 'Product not found or unauthorized' })
    res.json({ message: 'Product updated' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' })
  }
})

// DELETE /api/farmer/products/:id
router.delete('/products/:id', async (req, res) => {
  try {
    const farmer = await prisma.farmer.findUnique({ where: { userId: req.user.id } })
    
    const product = await prisma.product.deleteMany({
      where: { id: req.params.id, farmerId: farmer?.id }
    })
    
    if (product.count === 0) return res.status(404).json({ error: 'Product not found or unauthorized' })
    res.json({ message: 'Product deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

// PATCH /api/farmer/products/:id/toggle
router.patch('/products/:id/toggle', async (req, res) => {
  try {
    const farmer = await prisma.farmer.findUnique({ where: { userId: req.user.id } })
    
    const currentProduct = await prisma.product.findFirst({
      where: { id: req.params.id, farmerId: farmer?.id }
    })
    
    if (!currentProduct) return res.status(404).json({ error: 'Product not found' })

    const updatedProduct = await prisma.product.update({
      where: { id: req.params.id },
      data: { isAvailable: !currentProduct.isAvailable }
    })
    
    res.json(updatedProduct)
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle product status' })
  }
})

export default router
