import { filtrarLaudos, normalizarTexto } from '../busca';
import { LaudoParapente } from '../../types/laudo';

const laudo = (over: Partial<LaudoParapente>): LaudoParapente =>
  ({
    id: over.numeroLaudo ?? 'x',
    numeroLaudo: '',
    nomeProprietario: '',
    fabricaModelo: '',
    numeroSerie: '',
    ...over,
  }) as LaudoParapente;

const base = [
  laudo({
    numeroLaudo: 'LRP-2026-8812',
    nomeProprietario: 'Carlos Eduardo Silva',
    fabricaModelo: 'Ozone Zeno 2',
    numeroSerie: 'OZN-98214',
  }),
  laudo({
    numeroLaudo: 'LRP-2026-8190',
    nomeProprietario: 'João Gonçalves',
    fabricaModelo: 'SOL/SYCROSS ONE M',
    numeroSerie: '18968',
  }),
  laudo({
    numeroLaudo: 'LRP-2025-0001',
    nomeProprietario: 'Ana Paula',
    fabricaModelo: 'Ozone Rush 6',
    numeroSerie: 'OZN-11111',
  }),
];

describe('normalizarTexto', () => {
  it('tira acento e caixa', () => {
    expect(normalizarTexto('João Gonçalves')).toBe('joao goncalves');
    expect(normalizarTexto('Mogi-Guaçu')).toBe('mogi-guacu');
  });

  it('aceita ausência de valor', () => {
    expect(normalizarTexto(undefined)).toBe('');
    expect(normalizarTexto(null)).toBe('');
  });
});

describe('filtrarLaudos', () => {
  it('devolve tudo quando o termo está vazio', () => {
    expect(filtrarLaudos(base, '')).toHaveLength(3);
    expect(filtrarLaudos(base, '   ')).toHaveLength(3);
  });

  it('acha por nome mesmo sem acento e sem caixa', () => {
    // O técnico digita rápido: "joao" precisa achar "João Gonçalves".
    expect(filtrarLaudos(base, 'joao')).toHaveLength(1);
    expect(filtrarLaudos(base, 'GONCALVES')).toHaveLength(1);
  });

  it('acha por número de série, modelo e número do laudo', () => {
    expect(filtrarLaudos(base, '18968')[0].nomeProprietario).toBe('João Gonçalves');
    expect(filtrarLaudos(base, 'ozone')).toHaveLength(2);
    expect(filtrarLaudos(base, 'lrp-2025')).toHaveLength(1);
  });

  it('combina termos separados por espaço, mesmo vindo de campos diferentes', () => {
    // "ozone" está no modelo e "98214" na série: os dois juntos devem convergir
    // em um só laudo.
    expect(filtrarLaudos(base, 'ozone 98214')).toHaveLength(1);
    expect(filtrarLaudos(base, 'ozone rush')).toHaveLength(1);
    expect(filtrarLaudos(base, 'ozone inexistente')).toHaveLength(0);
  });

  it('não quebra com campos ausentes no documento', () => {
    const incompleto = [{ id: 'z', numeroLaudo: 'LRP-1' } as LaudoParapente];
    expect(() => filtrarLaudos(incompleto, 'qualquer')).not.toThrow();
    expect(filtrarLaudos(incompleto, 'lrp-1')).toHaveLength(1);
  });
});
