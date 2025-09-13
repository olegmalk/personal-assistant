# Decision: SSL Certificate Strategy

**Date**: 2025-09-13
**Status**: Implemented
**Stakeholders**: Self

## Decision
Use **Let's Encrypt + certbot** with certificates stored in git repo

## Context
ChatGPT Custom GPT Actions require HTTPS endpoints. Need valid SSL certificate for API.

## Options Considered

1. **Let's Encrypt direct** (chosen)
   - Free, trusted certificates
   - Auto-renewal with certbot
   - Requires domain name

2. **Cloudflare Proxy SSL** (tested, rejected)
   - Instant SSL, no setup
   - Rate limiting issues for APIs
   - Takes 24h for universal SSL
   - Hides origin IP (not needed)

3. **DuckDNS** (attempted, failed)
   - Service was down during setup
   - Would have been free subdomain

## Final Implementation

### Domain Setup
- **Domain**: b.mlkv.org (purchased on Cloudflare)
- **DNS**: Direct A record to 35.228.3.131 (no proxy)
- **Port**: 11111 (custom port for isolation)

### Certificate Generation
```bash
# Open port 80 temporarily for verification
gcloud compute firewall-rules create allow-http-certbot-temp --allow tcp:80

# Generate certificate
sudo certbot certonly --standalone -d b.mlkv.org --email admin@mlkv.org

# Copy to repo for easier access
cp /etc/letsencrypt/live/b.mlkv.org/*.pem ./certs/
chown vmuser:vmuser ./certs/*.pem
```

### Elysia Configuration
```typescript
.listen({
  port: 11111,
  tls: {
    cert: Bun.file('/home/vmuser/dev/personal-assistant/certs/fullchain.pem'),
    key: Bun.file('/home/vmuser/dev/personal-assistant/certs/privkey.pem')
  }
})
```

### PM2 Setup
- Running as user `vmuser` (not root)
- Certificates copied to repo with proper permissions
- Auto-restart on crash and reboot

## Decisions Made
- **Port 11111** instead of 443 (avoid conflicts, no root needed)
- **Certificates in repo** (single-user system, easier management)
- **No Cloudflare proxy** (avoid API rate limits)
- **PM2 as user** (security, no root needed with local certs)

## Tradeoffs Accepted
- Manual certificate renewal every 90 days
- Certificates in git (acceptable for personal use)
- Non-standard port (fine for API use)

## Benefits Achieved
- Direct HTTPS without proxy latency
- Full control over SSL/TLS settings
- No dependency on Cloudflare proxy
- Clean separation from other services on machine