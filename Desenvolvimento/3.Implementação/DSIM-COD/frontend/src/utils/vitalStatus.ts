/**
 * Utilitários para calcular o status de cor dos sinais vitais
 * baseado nos limites de alarme e valores MEWS
 */

export interface VitalLimits {
  batimentos_min: number;
  batimentos_max: number;
  oxigenio_min: number;
  temperatura_max: number;
}

// Limites padrão MEWS (não podem ser removidos)
export const DEFAULT_MEWS_LIMITS: VitalLimits = {
  batimentos_min: 51,
  batimentos_max: 110,
  oxigenio_min: 92,
  temperatura_max: 38.0,
};

// Margem de proximidade (quando mostrar amarelo)
const PROXIMITY_MARGIN = {
  batimentos: 10, // ±10 bpm
  oxigenio: 3,    // ±3%
  temperatura: 0.5, // ±0.5°C
};

export type VitalStatus = 'stable' | 'warning' | 'danger';

/**
 * Calcula o status da frequência cardíaca (batimentos)
 */
export function getHeartRateStatus(bpm: number, limits?: VitalLimits): VitalStatus {
  const min = limits?.batimentos_min || DEFAULT_MEWS_LIMITS.batimentos_min;
  const max = limits?.batimentos_max || DEFAULT_MEWS_LIMITS.batimentos_max;

  // Vermelho: fora dos limites
  if (bpm <= min || bpm >= max) {
    return 'danger';
  }

  // Amarelo: próximo aos limites
  if (
    bpm <= min + PROXIMITY_MARGIN.batimentos ||
    bpm >= max - PROXIMITY_MARGIN.batimentos
  ) {
    return 'warning';
  }

  // Verde: normal
  return 'stable';
}

/**
 * Calcula o status da saturação de oxigênio
 */
export function getOxygenStatus(oxygen: number, limits?: VitalLimits): VitalStatus {
  const min = limits?.oxigenio_min || DEFAULT_MEWS_LIMITS.oxigenio_min;

  // Vermelho: abaixo do limite
  if (oxygen <= min) {
    return 'danger';
  }

  // Amarelo: próximo ao limite
  if (oxygen <= min + PROXIMITY_MARGIN.oxigenio) {
    return 'warning';
  }

  // Verde: normal
  return 'stable';
}

/**
 * Calcula o status da temperatura
 */
export function getTemperatureStatus(temp: number, limits?: VitalLimits): VitalStatus {
  const max = limits?.temperatura_max || DEFAULT_MEWS_LIMITS.temperatura_max;

  // Vermelho: acima do limite
  if (temp >= max) {
    return 'danger';
  }

  // Amarelo: próximo ao limite
  if (temp >= max - PROXIMITY_MARGIN.temperatura) {
    return 'warning';
  }

  // Verde: normal (entre 35°C e limite)
  if (temp < 35.0) {
    return 'danger'; // Hipotermia
  }

  return 'stable';
}

/**
 * Obtém a classe CSS baseada no status
 */
export function getStatusClassName(status: VitalStatus): string {
  switch (status) {
    case 'danger':
      return 'danger';
    case 'warning':
      return 'warning';
    case 'stable':
    default:
      return 'stable';
  }
}
