import request from 'supertest'
import app from '../src/app.js'

describe('Backend Smoke Test', () => {
  it('responds with 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown-route-123')
    expect(res.statusCode).toBe(404)
  })

  it('exposes the products categories API', async () => {
    const res = await request(app).get('/api/products/categories')
    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body).toContain('VEGETABLES')
  })
})
