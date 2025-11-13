import { VitalStatus } from '../types';

/**
 * Calcula o escore MEWS (Modified Early Warning Score)
 * baseado nos sinais vitais do paciente
 */
export function calculateMEWS(
  batimentos: number,
  oxigenio: number,
  temperatura: number
): { score: number; status: VitalStatus } {
  let score = 0;

  // Frequência Cardíaca (bpm)
  if (batimentos < 40) score += 3;
  else if (batimentos >= 40 && batimentos < 50) score += 1;
  else if (batimentos >= 50 && batimentos <= 100) score += 0;
  else if (batimentos > 100 && batimentos <= 110) score += 1;
  else if (batimentos > 110 && batimentos <= 129) score += 2;
  else if (batimentos >= 130) score += 3;

  // Saturação de Oxigênio (SpO2 %)
  if (oxigenio < 85) score += 3;
  else if (oxigenio >= 85 && oxigenio < 90) score += 2;
  else if (oxigenio >= 90 && oxigenio < 95) score += 1;
  else score += 0;

  // Temperatura (°C)
  if (temperatura < 35) score += 2;
  else if (temperatura >= 35 && temperatura < 36) score += 1;
  else if (temperatura >= 36 && temperatura <= 38) score += 0;
  else if (temperatura > 38 && temperatura <= 39) score += 1;
  else if (temperatura > 39) score += 2;

  // Determinar status baseado no score
  let status: VitalStatus = 'stable';
  if (score >= 5) status = 'danger';
  else if (score >= 3) status = 'warning';

  return { score, status };
}

/**
 * Verifica se um alarme deve ser disparado baseado nos limites configurados
 */
export function checkAlarmThresholds(
  batimentos: number,
  oxigenio: number,
  temperatura: number,
  config: {
    batimentos_min: number;
    batimentos_max: number;
    oxigenio_min: number;
    temperatura_max: number;
  }
): { shouldAlert: boolean; alerts: string[] } {
  const alerts: string[] = [];

  if (batimentos < config.batimentos_min) {
    alerts.push(`Batimentos cardíacos baixos: ${batimentos} bpm`);
  }
  if (batimentos > config.batimentos_max) {
    alerts.push(`Batimentos cardíacos altos: ${batimentos} bpm`);
  }
  if (oxigenio < config.oxigenio_min) {
    alerts.push(`Saturação de oxigênio baixa: ${oxigenio}%`);
  }
  if (temperatura > config.temperatura_max) {
    alerts.push(`Temperatura elevada: ${temperatura}°C`);
  }

  return {
    shouldAlert: alerts.length > 0,
    alerts,
  };
}
