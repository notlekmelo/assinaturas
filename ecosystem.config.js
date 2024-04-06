module.exports = {
    apps : [{
      name: 'assinaturas',
      script: 'src/app.js',
      instances: 'max',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      },
    }]
  };
  