import express from 'express'
import prisma from '../lib/prisma.js'

const router = express.Router()

// GET /api/products - Browse products with filters
router.get('/products', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, inStock, farmerId } = req.query
    
    let whereClause = { isAvailable: true }
    
    if (category) whereClause.category = category
    if (farmerId) whereClause.farmerId = farmerId
    if (inStock === 'true') whereClause.stockQty = { gt: 0 }
    
    if (minPrice || maxPrice) {
      whereClause.pricePerUnit = {}
      if (minPrice) whereClause.pricePerUnit.gte = parseFloat(minPrice)
      if (maxPrice) whereClause.pricePerUnit.lte = parseFloat(maxPrice)
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        farmer: {
          select: { farmName: true, farmAddress: true, kycStatus: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(products)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// GET /api/products/categories
router.get('/products/categories', async (req, res) => {
  // Return the Prisma enum values for Category
  res.json(['VEGETABLES', 'FRUITS', 'GRAINS', 'TUBERS', 'LIVESTOCK', 'DAIRY', 'POULTRY', 'SEAFOOD', 'HERBS', 'OTHER'])
})

// GET /api/products/:id - Single product detail
router.get('/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        farmer: {
          select: { id: true, farmName: true, farmAddress: true, kycStatus: true, bio: true }
        }
      }
    })

    if (!product) return res.status(404).json({ error: 'Product not found' })
    res.json(product)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

// GET /api/farms - List verified farms
router.get('/farms', async (req, res) => {
  try {
    const farms = await prisma.farmer.findMany({
      where: { kycStatus: 'VERIFIED' },
      select: { id: true, farmName: true, farmAddress: true, bio: true, kycStatus: true }
    })
    res.json(farms)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch farms' })
  }
})

// GET /api/farms/:id - Farm profile + active listings
router.get('/farms/:id', async (req, res) => {
  try {
    const farm = await prisma.farmer.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, farmName: true, farmAddress: true, bio: true, kycStatus: true,
        products: {
          where: { isAvailable: true }
        }
      }
    })

    if (!farm) return res.status(404).json({ error: 'Farm not found' })
    res.json(farm)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch farm profile' })
  }
})

export default router
