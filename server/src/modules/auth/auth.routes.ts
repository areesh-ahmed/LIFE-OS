import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { prisma } from '../../db'
import { env } from '../../config/env'

export const authRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // Google OAuth callback
  app.get('/google/callback', async function (request, reply) {
    try {
      const { token } = await app.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)
      
      // Fetch user profile from Google
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${token.access_token}` },
      })
      const userInfo = await userInfoResponse.json()
      
      if (!userInfo.id || !userInfo.email) {
        return reply.status(400).send({ error: 'Failed to retrieve Google profile' })
      }

      // Find or create user
      const user = await prisma.user.upsert({
        where: { googleId: userInfo.id },
        update: {
          lastLoginAt: new Date(),
          avatarUrl: userInfo.picture,
          name: userInfo.name,
        },
        create: {
          googleId: userInfo.id,
          email: userInfo.email,
          name: userInfo.name || 'User',
          avatarUrl: userInfo.picture,
        },
      })

      // Generate JWT
      const jwtToken = await reply.jwtSign({
        sub: user.id,
        email: user.email,
      })

      // Set HttpOnly cookie
      reply.setCookie('lifeos_session', jwtToken, {
        domain: 'localhost',
        path: '/',
        secure: env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })

      // Redirect to frontend
      reply.redirect(env.FRONTEND_URL)
    } catch (err) {
      app.log.error(err)
      reply.status(500).send({ error: 'Internal Server Error during authentication' })
    }
  })

  // Logout
  app.post('/logout', async (request, reply) => {
    reply.clearCookie('lifeos_session', { path: '/' })
    return { success: true }
  })

  // Get current session user
  app.get('/me', async (request, reply) => {
    try {
      await request.jwtVerify()
      const payload = request.user as { sub: string }
      
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, name: true, email: true, avatarUrl: true },
      })

      if (!user) {
        return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'User not found' } })
      }

      return { user }
    } catch (err) {
      return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } })
    }
  })
}
