const fastify = require('fastify')({ logger: true })

const startedAt = new Date()

const items = [
  { id: 1, name: 'Install IIS, URL Rewrite and ARR', done: true },
  { id: 2, name: 'Run Fastify as a service with NSSM', done: true },
  { id: 3, name: 'Copy the Vue build into the IIS site', done: false }
]

fastify.get('/api/health', async () => ({
  ok: true,
  uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
  node: process.version
}))

fastify.get('/api/items', async () => items)

fastify.post('/api/items', async (request, reply) => {
  const name = ((request.body && request.body.name) || '').trim()
  if (!name) {
    return reply.code(400).send({ error: 'Name is required' })
  }
  const item = { id: items.length + 1, name, done: false }
  items.push(item)
  return reply.code(201).send(item)
})

fastify.patch('/api/items/:id', async (request, reply) => {
  const item = items.find(i => i.id === Number(request.params.id))
  if (!item) {
    return reply.code(404).send({ error: 'Item not found' })
  }
  item.done = !item.done
  return item
})

const port = Number(process.env.PORT) || 3000

fastify.listen({ port, host: '127.0.0.1' }).catch(err => {
  fastify.log.error(err)
  process.exit(1)
})
