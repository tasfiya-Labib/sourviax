require('dotenv').config()

const crypto = require('crypto')
const express = require('express')
const path = require('path')

const app = express()
const port = process.env.PORT || 3001
const adminUsername = process.env.ADMIN_USERNAME
const adminPassword = process.env.ADMIN_PASSWORD
const sessionSecret = process.env.SESSION_SECRET
const sessionDuration = 8 * 60 * 60 * 1000
const secureCookie = process.env.NODE_ENV === 'production' ? '; Secure' : ''

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

function safeCompare(left, right) {
  const leftBuffer = Buffer.from(left || '')
  const rightBuffer = Buffer.from(right || '')

  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer)
}

function createSessionToken(username) {
  const expiresAt = Date.now() + sessionDuration
  const payload = Buffer.from(JSON.stringify({ username, expiresAt })).toString('base64url')
  const signature = crypto.createHmac('sha256', sessionSecret).update(payload).digest('base64url')

  return `${payload}.${signature}`
}

function hasValidSession(req) {
  const token = req.headers.cookie?.match(/(?:^|; )sourviax_session=([^;]+)/)?.[1]

  if (!token || !sessionSecret) {
    return false
  }

  const [payload, signature] = token.split('.')
  const expectedSignature = crypto.createHmac('sha256', sessionSecret).update(payload || '').digest('base64url')

  if (!payload || !signature || !safeCompare(signature, expectedSignature)) {
    return false
  }

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return session.username === adminUsername && session.expiresAt > Date.now()
  } catch {
    return false
  }
}

function requireAdmin(req, res, next) {
  if (hasValidSession(req)) {
    return next()
  }

  res.redirect('/admin/login')
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.use(express.static(path.join(__dirname, 'public')))

app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin-login.html'))
})

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body

  if (!adminUsername || !adminPassword || !sessionSecret) {
    return res.status(503).send('Admin authentication is not configured.')
  }

  if (!safeCompare(username, adminUsername) || !safeCompare(password, adminPassword)) {
    return res.status(401).send('Invalid username or password.')
  }

  res.setHeader('Set-Cookie', `sourviax_session=${createSessionToken(adminUsername)}; Max-Age=28800; HttpOnly; SameSite=Lax; Path=/${secureCookie}`)
  res.redirect('/admin')
})

app.post('/admin/logout', (req, res) => {
  res.setHeader('Set-Cookie', `sourviax_session=; Max-Age=0; HttpOnly; SameSite=Lax; Path=/${secureCookie}`)
  res.redirect('/admin/login')
})

app.get('/admin', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'))
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Sourviax' })
})

app.use((req, res) => {
  res.status(404).send('Page not found')
})

app.listen(port, '0.0.0.0', () => {
  console.log(`Sourviax is running at http://localhost:${port}`)
})
