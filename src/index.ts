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
    const validKey = process.env.API_KEY || Bun.env.API_KEY
    if (!apiKey || apiKey !== validKey) {
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
      cert: Bun.file('/home/vmuser/dev/personal-assistant/certs/fullchain.pem'),
      key: Bun.file('/home/vmuser/dev/personal-assistant/certs/privkey.pem')
    }
  })

console.log(`🚀 Server running at https://localhost:${app.server?.port}`)
console.log('Using Let\'s Encrypt SSL certificate')