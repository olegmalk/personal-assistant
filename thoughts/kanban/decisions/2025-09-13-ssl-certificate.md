# Decision: SSL Certificate Strategy

**Date**: 2025-09-13
**Status**: Approved
**Stakeholders**: Self

## Decision
Use **Let's Encrypt + certbot** for SSL certificates

## Context
ChatGPT Custom GPT Actions require HTTPS endpoints. Need valid SSL certificate for API.

## Options Considered

1. **Let's Encrypt** (chosen)
   - Free, trusted certificates
   - Auto-renewal with certbot
   - Requires domain name

2. **Cloudflare Tunnel**
   - Free SSL without port exposure
   - Extra dependency
   - Potential latency

3. **Caddy Reverse Proxy**
   - Auto-manages certificates
   - Another service to run
   - More complex setup

4. **ngrok**
   - Quick testing
   - Not permanent
   - Paid for custom domains

## Implementation

### Elysia Native SSL Support
```typescript
new Elysia({
  serve: {
    hostname: 'yourdomain.com',
    tls: {
      cert: Bun.file('/etc/letsencrypt/live/yourdomain.com/fullchain.pem'),
      key: Bun.file('/etc/letsencrypt/live/yourdomain.com/privkey.pem')
    }
  }
})
```

### Certificate Setup
```bash
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com
# Auto-renewal via cron
```

## Tradeoffs Accepted
- Need to buy/configure domain name
- Manual initial certbot setup
- Port 443 must be accessible

## Benefits
- No proxy layer, direct Elysia HTTPS
- Free, trusted certificates
- Standard approach, well documented