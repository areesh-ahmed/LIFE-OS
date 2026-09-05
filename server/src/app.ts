import Fastify from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import jwt from '@fastify/jwt'
import oauthPlugin from '@fastify/oauth2'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { env } from './config/env'
import { authRoutes } from './modules/auth/auth.routes'
import { taskRoutes } from './modules/tasks/tasks.routes'
import { habitRoutes } from './modules/habits/habits.routes'
import { weeklyRoutes } from './modules/weekly/weekly.routes'
import { activityRoutes } from './modules/activity/activity.routes'
import { sleepRoutes } from './modules/sleep/sleep.routes'
import { focusRoutes } from './modules/focus/focus.routes'
import { systemRoutes } from './modules/system/system.routes'
import { todayRoutes } from './routes/today.routes'

export async function buildApp() {
  const app = Fastify({
    logger: env.NODE_ENV === 'development'
      ? {
          transport: {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        }
      : true,
  })

  // Register CORS
  await app.register(cors, {
    origin: env.FRONTEND_URL,
    credentials: true,
  })

  // Register Cookie
  await app.register(cookie, {
    secret: env.SESSION_SECRET,
    hook: 'onRequest',
  })

  // Register JWT
  await app.register(jwt, {
    secret: env.SESSION_SECRET,
    cookie: {
      cookieName: 'lifeos_session',
      signed: false, // We'll just use HttpOnly
    },
  })

  // Register Swagger
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'LIFE OS API',
        description: 'Backend API for LIFE OS personal operating system',
        version: '1.0.0',
      },
      servers: [{ url: 'http://localhost:4000' }],
    }
  })
  
  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false
    }
  })

  // Register Google OAuth2
  await app.register(oauthPlugin, {
    name: 'googleOAuth2',
    scope: ['profile', 'email'],
    credentials: {
      client: {
        id: env.GOOGLE_CLIENT_ID,
        secret: env.GOOGLE_CLIENT_SECRET,
      },
      auth: oauthPlugin.GOOGLE_CONFIGURATION,
    },
    startRedirectPath: '/api/auth/google',
    callbackUri: env.GOOGLE_CALLBACK_URL,
  })

  // Register Routes
  await app.register(authRoutes, { prefix: '/api/auth' })
  await app.register(taskRoutes, { prefix: '/api/tasks' })
  await app.register(habitRoutes, { prefix: '/api/habits' })
  await app.register(weeklyRoutes, { prefix: '/api/weekly' })
  await app.register(activityRoutes, { prefix: '/api/log' })
  await app.register(sleepRoutes, { prefix: '/api/sleep' })
  await app.register(focusRoutes, { prefix: '/api/focus' })
  await app.register(systemRoutes, { prefix: '/api/system' })
  await app.register(todayRoutes, { prefix: '/api/today' })

  // Health check route
  app.get('/health', async () => {
    return { status: 'ok', service: 'life-os-server' }
  })

  return app
}
