import { cidadeDoLaudo, estadoDoLaudo } from '../localidade';

describe('cidade e UF do laudo', () => {
  it('usa os campos separados quando existem', () => {
    const laudo = { cidade: 'Porto Alegre', estado: 'RS', cidadeEstado: 'Porto Alegre - RS' };
    expect(cidadeDoLaudo(laudo)).toBe('Porto Alegre');
    expect(estadoDoLaudo(laudo)).toBe('RS');
  });

  it('não exibe a UF no lugar da cidade quando a cidade ficou em branco', () => {
    // Regressão: `cidadeEstado` vira só "RS", e o fallback antigo mostrava
    // "Cidade: RS" por pegar o primeiro pedaço do texto combinado.
    const laudo = { cidade: '', estado: 'RS', cidadeEstado: 'RS' };
    expect(cidadeDoLaudo(laudo)).toBe('-');
    expect(estadoDoLaudo(laudo)).toBe('RS');
  });

  it('cai no texto combinado nos laudos antigos, sem os campos separados', () => {
    const laudo = { cidadeEstado: 'São Paulo - SP' };
    expect(cidadeDoLaudo(laudo)).toBe('São Paulo');
    expect(estadoDoLaudo(laudo)).toBe('SP');
  });

  it('não quebra cidade com hífen no nome', () => {
    const laudo = { cidadeEstado: 'Mogi-Guaçu - SP' };
    expect(cidadeDoLaudo(laudo)).toBe('Mogi-Guaçu');
    expect(estadoDoLaudo(laudo)).toBe('SP');
  });

  it('sem nenhum dado, exibe "-"', () => {
    expect(cidadeDoLaudo({})).toBe('-');
    expect(estadoDoLaudo({})).toBe('-');
  });
});
