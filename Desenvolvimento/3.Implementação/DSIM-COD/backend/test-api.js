// Script de teste rápido das APIs
const https = require('http');

console.log('Testando APIs do DSIM Backend...\n');

// Teste 1: Health Check
console.log('1. Testando /health...');
https.get('http://localhost:9999/health', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('✅ Health:', data);
    console.log('');
    
    // Teste 2: Registrar usuário
    console.log('2. Testando POST /api/auth/register...');
    const postData = JSON.stringify({
      nome: 'Admin Teste',
      email: 'admin@dsim.com',
      senha: 'senha123'
    });

    const options = {
      hostname: 'localhost',
      port: 9999,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Resposta:', data);
        console.log('');
        
        // Teste 3: Login
        console.log('3. Testando POST /api/auth/login...');
        const loginData = JSON.stringify({
          email: 'admin@dsim.com',
          senha: 'senha123'
        });

        const loginOptions = {
          hostname: 'localhost',
          port: 9999,
          path: '/api/auth/login',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(loginData)
          }
        };

        const loginReq = https.request(loginOptions, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            console.log('Status:', res.statusCode);
            console.log('Resposta:', data);
            console.log('');
            console.log('✅ Testes concluídos!');
            console.log('');
            console.log('Próximos passos:');
            console.log('1. Abra http://localhost:9999/health no navegador');
            console.log('2. Configure o frontend para usar esta API');
            console.log('3. Configure AWS IoT Core conforme DEPLOYMENT_GUIDE.md');
          });
        });

        loginReq.on('error', (e) => {
          console.error('❌ Erro no login:', e.message);
        });

        loginReq.write(loginData);
        loginReq.end();
      });
    });

    req.on('error', (e) => {
      console.error('❌ Erro no registro:', e.message);
    });

    req.write(postData);
    req.end();
  });
}).on('error', (e) => {
  console.error('❌ Erro ao conectar:', e.message);
  console.log('');
  console.log('Certifique-se de que o servidor está rodando:');
  console.log('  npm run dev');
});
