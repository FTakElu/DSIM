import { CreateTopicCommand, PublishCommand, SNSClient, SubscribeCommand } from '@aws-sdk/client-sns';

const snsClient = new SNSClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});

const TOPIC_NAME = 'DSIM-Alertas';

interface PatientInfo {
  id: string;
  nome: string;
  contatoEmergencia?: {
    nome?: string;
    telefone?: string;
    email?: string;
  };
}

interface AlertData {
  temperatura?: number;
  frequencia_cardiaca?: number;
  saturacao_oxigenio?: number;
  timestamp?: number;
}

/**
 * Criar tópico SNS para alertas (se não existir)
 */
export async function createAlertTopic(): Promise<string> {
  try {
    const command = new CreateTopicCommand({ Name: TOPIC_NAME });
    const response = await snsClient.send(command);
    console.log(`📢 Tópico SNS criado/obtido: ${response.TopicArn}`);
    return response.TopicArn!;
  } catch (error) {
    console.error('❌ Erro ao criar tópico SNS:', error);
    throw error;
  }
}

/**
 * Inscrever email no tópico de alertas
 */
export async function subscribeEmail(topicArn: string, email: string): Promise<void> {
  try {
    const command = new SubscribeCommand({
      TopicArn: topicArn,
      Protocol: 'email',
      Endpoint: email,
    });
    await snsClient.send(command);
    console.log(`📧 Email ${email} inscrito no tópico de alertas`);
  } catch (error) {
    console.error('❌ Erro ao inscrever email:', error);
    throw error;
  }
}

/**
 * Inscrever telefone (SMS) no tópico de alertas
 */
export async function subscribeSMS(topicArn: string, phoneNumber: string): Promise<void> {
  try {
    // Formato esperado: +55DDDNUMBER (ex: +5511999999999)
    const command = new SubscribeCommand({
      TopicArn: topicArn,
      Protocol: 'sms',
      Endpoint: phoneNumber,
    });
    await snsClient.send(command);
    console.log(`📱 Telefone ${phoneNumber} inscrito no tópico de alertas`);
  } catch (error) {
    console.error('❌ Erro ao inscrever SMS:', error);
    throw error;
  }
}

/**
 * Enviar alerta de pânico
 */
export async function sendPanicAlert(patient: PatientInfo, data: AlertData): Promise<void> {
  const topicArn = process.env.SNS_TOPIC_ARN;
  
  if (!topicArn) {
    console.warn('⚠️ SNS_TOPIC_ARN não configurado, alerta não enviado');
    return;
  }

  const contatoTelefone = patient.contatoEmergencia?.telefone || 'Não cadastrado';

  const message = `
🚨 ALERTA DE PÂNICO - DSIM

Paciente: ${patient.nome}
ID: ${patient.id}
Data/Hora: ${new Date().toLocaleString('pt-BR')}

O paciente acionou o botão de pânico!

${data.frequencia_cardiaca ? `Frequência Cardíaca: ${data.frequencia_cardiaca} bpm` : ''}
${data.saturacao_oxigenio ? `Saturação de O2: ${data.saturacao_oxigenio}%` : ''}
${data.temperatura ? `Temperatura: ${data.temperatura}°C` : ''}

⚠️ AÇÃO IMEDIATA NECESSÁRIA!

Contato de emergência: ${contatoTelefone}
  `.trim();

  try {
    const command = new PublishCommand({
      TopicArn: topicArn,
      Subject: `🚨 ALERTA DE PÂNICO - ${patient.nome}`,
      Message: message,
    });
    
    await snsClient.send(command);
    console.log(`🚨 Alerta de pânico enviado para paciente ${patient.id}`);
  } catch (error) {
    console.error('❌ Erro ao enviar alerta de pânico:', error);
    throw error;
  }
}

/**
 * Enviar alerta de queda
 */
export async function sendFallAlert(patient: PatientInfo, data: AlertData): Promise<void> {
  const topicArn = process.env.SNS_TOPIC_ARN;
  
  if (!topicArn) {
    console.warn('⚠️ SNS_TOPIC_ARN não configurado, alerta não enviado');
    return;
  }

  const contatoTelefone = patient.contatoEmergencia?.telefone || 'Não cadastrado';

  const message = `
⚠️ ALERTA DE QUEDA DETECTADA - DSIM

Paciente: ${patient.nome}
ID: ${patient.id}
Data/Hora: ${new Date().toLocaleString('pt-BR')}

Uma possível queda foi detectada pela pulseira de monitoramento!

${data.frequencia_cardiaca ? `Frequência Cardíaca: ${data.frequencia_cardiaca} bpm` : ''}
${data.saturacao_oxigenio ? `Saturação de O2: ${data.saturacao_oxigenio}%` : ''}
${data.temperatura ? `Temperatura: ${data.temperatura}°C` : ''}

⚠️ Verificação recomendada!

Contato de emergência: ${contatoTelefone}
  `.trim();

  try {
    const command = new PublishCommand({
      TopicArn: topicArn,
      Subject: `⚠️ QUEDA DETECTADA - ${patient.nome}`,
      Message: message,
    });
    
    await snsClient.send(command);
    console.log(`⚠️ Alerta de queda enviado para paciente ${patient.id}`);
  } catch (error) {
    console.error('❌ Erro ao enviar alerta de queda:', error);
    throw error;
  }
}

/**
 * Enviar alerta genérico
 */
export async function sendCustomAlert(
  subject: string,
  message: string,
  topicArn?: string
): Promise<void> {
  const arn = topicArn || process.env.SNS_TOPIC_ARN;
  
  if (!arn) {
    console.warn('⚠️ SNS_TOPIC_ARN não configurado, alerta não enviado');
    return;
  }

  try {
    const command = new PublishCommand({
      TopicArn: arn,
      Subject: subject,
      Message: message,
    });
    
    await snsClient.send(command);
    console.log(`📢 Alerta personalizado enviado: ${subject}`);
  } catch (error) {
    console.error('❌ Erro ao enviar alerta personalizado:', error);
    throw error;
  }
}

export default {
  createAlertTopic,
  subscribeEmail,
  subscribeSMS,
  sendPanicAlert,
  sendFallAlert,
  sendCustomAlert,
};
