import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma.js'
import { authenticateToken } from '../middleware/authenticate.js'

const router = express.Router()

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { phone, email, password, role } = req.body

    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password are required' })
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone },
          { email: email || undefined }
        ]
      }
    })

    if (existingUser) {
      return res.status(400).json({ error: 'User with this phone or email already exists' })
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const userRole = role === 'FARMER' ? 'FARMER' : 'CONSUMER'

    const user = await prisma.user.create({
      data: {
        phone,
        email,
        passwordHash,
        role: userRole
      }
    })

    // If role is FARMER, we might need to create the Farmer record in phase 2,
    // but the plan says "Create user, hash password, assign role" here.
    // For now we just create the User record.

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    res.status(201).json({ token, user: { id: user.id, role: user.role, phone: user.phone } })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: 'Failed to register user' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { phone, email, password } = req.body

    if (!password || (!phone && !email)) {
      return res.status(400).json({ error: 'Phone/email and password are required' })
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: phone || undefined },
          { email: email || undefined }
        ]
      }
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    res.json({ token, user: { id: user.id, role: user.role, phone: user.phone } })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Failed to login' })
  }
})

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, phone: true, email: true, role: true, isVerified: true }
    })
    
    if (!user) return res.status(404).json({ error: 'User not found' })

    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  // JWT is stateless, so we just tell the client to clear it.
  res.json({ message: 'Logged out successfully' })
})

export default router
