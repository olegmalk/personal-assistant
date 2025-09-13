module.exports = {
  apps: [{
    name: 'personal-assistant-api',
    script: '/home/vmuser/.bun/bin/bun',
    args: 'run src/index.ts',
    cwd: '/home/vmuser/dev/personal-assistant',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 11111
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true
  }]
}