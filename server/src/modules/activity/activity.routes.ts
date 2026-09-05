import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../db'
import { requireAuth } from '../../middleware/auth.middleware'

export const activityRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.addHook('preHandler', requireAuth)

  // GET /api/log
  app.get('/', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    
    const querySchema = z.object({
      limit: z.string().optional().default('50').transform(Number),
      type: z.string().optional(),
    })
    
    const parsedQuery = querySchema.safeParse(request.query)
    if (!parsedQuery.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: parsedQuery.error.message } })
    }

    const { limit, type } = parsedQuery.data

    let whereClause: any = { userId }
    if (type) {
      whereClause.type = type
    }

    const logs = await prisma.activityLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return logs
  })
}
