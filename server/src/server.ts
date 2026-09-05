import { buildApp } from './app'
import { env } from './config/env'
import { prisma } from './db'

async function start() {
  const app = await buildApp()

  try {
    await prisma.$connect()
    app.log.info('📦 Connected to PostgreSQL database via Prisma')

    const address = await app.listen({ port: env.PORT, host: '0.0.0.0' })
    app.log.info(`🚀 Server listening at ${address}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
