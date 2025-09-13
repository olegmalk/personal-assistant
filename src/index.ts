import { Elysia } from 'elysia'

const app = new Elysia()
  .get('/', () => ({
    status: 'ok',
    service: 'Personal Assistant API',
    time: new Date().toISOString()
  }))
  .get('/health', () => 'OK')
  .post('/api/agent', ({ body, headers }) => {
    // Check API key
    const apiKey = headers['x-api-key']
    if (apiKey !== 'test-key-123') {
      return new Response('Unauthorized', { status: 401 })
    }

    return {
      received: body,
      response: 'Agent endpoint ready for implementation',
      timestamp: new Date().toISOString()
    }
  })
  .listen({
    port: 11111,
    tls: {
      cert: Bun.file('/etc/letsencrypt/live/mlkv.org/fullchain.pem'),
      key: Bun.file('/etc/letsencrypt/live/mlkv.org/privkey.pem')
    }
  })

console.log(`🚀 Server running at https://localhost:${app.server?.port}`)
console.log('Using Let\'s Encrypt SSL certificate')