const axios = require('axios');

async function resetUser() {
  try {
    console.log('Criando usuário de teste...');
    
    const response = await axios.post('http://localhost:9999/api/auth/register', {
      nome: 'Teste Frontend',
      email: 'teste@dsim.com',
      senha: '123456',
      role: 'admin'
    });
    
    console.log('✅ Usuário criado:', response.data);
    console.log('\n📝 Use estas credenciais no frontend:');
    console.log('Email: teste@dsim.com');
    console.log('Senha: 123456');
    
  } catch (error) {
    if (error.response) {
      console.log('⚠️ Erro:', error.response.data);
    } else {
      console.error('❌ Erro:', error.message);
    }
  }
}

resetUser();
