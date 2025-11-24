/**
 * Script para configurar o tópico SNS para alertas do DSIM
 * 
 * Execute com: node setup-sns.js
 * 
 * O script irá:
 * 1. Criar o tópico "DSIM-Alertas" (se não existir)
 * 2. Exibir o ARN do tópico para adicionar ao .env
 * 3. Permitir inscrever emails/telefones de teste
 */

import { CreateTopicCommand, ListTopicsCommand, SNSClient, SubscribeCommand } from '@aws-sdk/client-sns';
import 'dotenv/config';
import readline from 'readline';

const snsClient = new SNSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupSNSTopic() {
  console.log('\n🔔 Configuração do SNS para Alertas DSIM\n');
  console.log('═══════════════════════════════════════\n');

  try {
    // Listar tópicos existentes
    console.log('📋 Verificando tópicos SNS existentes...\n');
    const listCommand = new ListTopicsCommand({});
    const listResponse = await snsClient.send(listCommand);
    
    const existingTopic = listResponse.Topics?.find(t => t.TopicArn?.includes('DSIM-Alertas'));
    
    let topicArn;
    
    if (existingTopic) {
      console.log('✅ Tópico DSIM-Alertas já existe!');
      topicArn = existingTopic.TopicArn;
    } else {
      // Criar tópico
      console.log('📢 Criando tópico DSIM-Alertas...\n');
      const createCommand = new CreateTopicCommand({ Name: 'DSIM-Alertas' });
      const createResponse = await snsClient.send(createCommand);
      topicArn = createResponse.TopicArn;
      console.log('✅ Tópico criado com sucesso!');
    }

    console.log('\n' + '═'.repeat(70));
    console.log('📌 ARN do Tópico:');
    console.log(topicArn);
    console.log('═'.repeat(70) + '\n');
    
    console.log('⚙️  Adicione esta linha ao seu arquivo .env:\n');
    console.log(`SNS_TOPIC_ARN=${topicArn}\n`);
    console.log('═'.repeat(70) + '\n');

    // Perguntar se deseja inscrever contatos de teste
    const inscreveEmail = await question('Deseja inscrever um email de teste? (s/n): ');
    
    if (inscreveEmail.toLowerCase() === 's') {
      const email = await question('Digite o email: ');
      
      try {
        const subscribeCommand = new SubscribeCommand({
          TopicArn: topicArn,
          Protocol: 'email',
          Endpoint: email.trim(),
        });
        
        await snsClient.send(subscribeCommand);
        console.log(`\n✅ Email ${email} inscrito!`);
        console.log('📧 Verifique a caixa de entrada para confirmar a inscrição.\n');
      } catch (error) {
        console.error('❌ Erro ao inscrever email:', error.message);
      }
    }

    const inscreveSMS = await question('\nDeseja inscrever um telefone (SMS) de teste? (s/n): ');
    
    if (inscreveSMS.toLowerCase() === 's') {
      console.log('\n⚠️  Formato do telefone: +55DDDNÚMERO (ex: +5511999999999)');
      const telefone = await question('Digite o telefone: ');
      
      try {
        const subscribeCommand = new SubscribeCommand({
          TopicArn: topicArn,
          Protocol: 'sms',
          Endpoint: telefone.trim(),
        });
        
        await snsClient.send(subscribeCommand);
        console.log(`\n✅ Telefone ${telefone} inscrito!`);
        console.log('📱 SMS de teste será enviado.\n');
      } catch (error) {
        console.error('❌ Erro ao inscrever telefone:', error.message);
        console.log('   Nota: SMS pode não estar disponível na região us-east-1');
      }
    }

    console.log('\n✅ Configuração concluída!\n');
    console.log('═══════════════════════════════════════\n');
    console.log('Próximos passos:');
    console.log('1. Adicione SNS_TOPIC_ARN ao arquivo .env');
    console.log('2. Reinicie o servidor backend');
    console.log('3. Confirme as inscrições de email (verifique spam)');
    console.log('4. Teste os alertas de pânico e queda\n');

  } catch (error) {
    console.error('\n❌ Erro ao configurar SNS:', error);
    console.error('\nDetalhes:', error.message);
  } finally {
    rl.close();
  }
}

setupSNSTopic();
