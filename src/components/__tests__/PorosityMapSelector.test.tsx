import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PorosityMapSelector from '../PorosityMapSelector';
import {
  PorosityMap,
  PorosityMapLegacy,
  PorosityPoint,
  porosityMapDoFirestore,
} from '../../types/laudo';

const ponto = (over: Partial<PorosityPoint> = {}): PorosityPoint => ({
  selected: false,
  value: '',
  cor: '',
  ...over,
});

/**
 * Este é o caminho que um laudo antigo percorre ao ser aberto para edição: a
 * grade 3×5 não existia, e as medições precisam cair na coluna certa. Errar
 * aqui move — ou apaga — dados de laudos já emitidos.
 */
describe('PorosityMapSelector — laudo no formato antigo', () => {
  const legado: PorosityMapLegacy = {
    extradorso: {
      pontaEsquerda: ponto({ selected: true, value: '180', cor: 'Azul' }),
      meioEsquerda: ponto({ selected: true, value: '240', cor: 'Branco' }),
      meioDireita: ponto(),
      pontaDireita: ponto({ selected: true, value: '95', cor: 'Preto' }),
    },
    intradorso: {
      esquerda: ponto(),
      centro: ponto({ selected: true, value: '300', cor: 'Cinza' }),
      direita: ponto(),
    },
  };

  it('põe cada medição antiga na coluna correspondente', () => {
    const { getAllByText, getByDisplayValue } = render(
      <PorosityMapSelector value={legado} onChange={jest.fn()} />
    );

    // As colunas nomeadas viram ESQ / CENTRO / DIR, no ponto do meio (3 de 5).
    expect(getAllByText('ESQ · Ponto 3')).toHaveLength(1); // só o extradorso
    expect(getAllByText('CENTRO · Ponto 3')).toHaveLength(2); // extradorso e intradorso
    expect(getAllByText('DIR · Ponto 3')).toHaveLength(1);

    // Nenhuma leitura se perde na migração.
    ['180', '240', '95', '300'].forEach((leitura) => {
      expect(getByDisplayValue(leitura)).toBeTruthy();
    });
    ['Azul', 'Branco', 'Preto', 'Cinza'].forEach((cor) => {
      expect(getByDisplayValue(cor)).toBeTruthy();
    });
  });

  it('não inventa pontos que não estavam medidos', () => {
    const { queryByText } = render(<PorosityMapSelector value={legado} onChange={jest.fn()} />);

    // extradorso.meioDireita e intradorso.esquerda/direita estavam vazios.
    expect(queryByText('ESQ · Ponto 1')).toBeNull();
    expect(queryByText('DIR · Ponto 5')).toBeNull();
  });

  it('funciona a partir do documento cru do Firestore, como o app o recebe', () => {
    // O `null` é o que o Firestore devolve onde o app gravou `undefined`.
    const cru = { ...legado, campoInexistente: null } as unknown as PorosityMapLegacy;
    const normalizado = porosityMapDoFirestore(cru);

    const { getByDisplayValue } = render(
      <PorosityMapSelector value={normalizado} onChange={jest.fn()} />
    );

    expect(getByDisplayValue('180')).toBeTruthy();
    expect(getByDisplayValue('300')).toBeTruthy();
  });

  it('não perde a medição quando só o meio-direito do extradorso foi medido', () => {
    // O extradorso antigo tinha 4 pontos e a grade nova tem 3 colunas: os dois
    // do meio disputam a coluna CENTRO. Nenhum dos dois pode sumir.
    const soMeioDireita: PorosityMapLegacy = {
      extradorso: {
        pontaEsquerda: ponto(),
        meioEsquerda: ponto(), // existe, mas vazio
        meioDireita: ponto({ selected: true, value: '155', cor: 'Verde' }),
        pontaDireita: ponto(),
      },
      intradorso: { esquerda: ponto(), centro: ponto(), direita: ponto() },
    };

    const { getByDisplayValue } = render(
      <PorosityMapSelector value={soMeioDireita} onChange={jest.fn()} />
    );

    expect(getByDisplayValue('155')).toBeTruthy();
    expect(getByDisplayValue('Verde')).toBeTruthy();
  });

  it('preserva os dois pontos do meio quando ambos foram medidos', () => {
    const ambos: PorosityMapLegacy = {
      extradorso: {
        pontaEsquerda: ponto(),
        meioEsquerda: ponto({ selected: true, value: '240', cor: 'Branco' }),
        meioDireita: ponto({ selected: true, value: '155', cor: 'Verde' }),
        pontaDireita: ponto(),
      },
      intradorso: { esquerda: ponto(), centro: ponto(), direita: ponto() },
    };

    const { getByDisplayValue } = render(
      <PorosityMapSelector value={ambos} onChange={jest.fn()} />
    );

    expect(getByDisplayValue('240')).toBeTruthy();
    expect(getByDisplayValue('155')).toBeTruthy();
  });

  it('trata o intradorso já medido como incluído, sem exigir novo clique', () => {
    const { queryByText, getByDisplayValue } = render(
      <PorosityMapSelector value={legado} onChange={jest.fn()} />
    );

    expect(queryByText('+ Incluir medição do intradorso')).toBeNull();
    expect(getByDisplayValue('300')).toBeTruthy(); // leitura do intradorso antigo
  });

  it('mantém a grade nova intacta, sem migrar nada', () => {
    const grade = () => [
      [ponto(), ponto(), ponto(), ponto({ selected: true, value: '210' }), ponto()],
      [ponto(), ponto(), ponto(), ponto(), ponto()],
      [ponto(), ponto(), ponto(), ponto(), ponto()],
    ];
    const novo: PorosityMap = { extradorso: grade(), intradorso: grade() };

    const { getAllByText, queryByText } = render(
      <PorosityMapSelector value={novo} onChange={jest.fn()} />
    );

    expect(getAllByText('ESQ · Ponto 4')).toHaveLength(2);
    expect(queryByText('ESQ · Ponto 3')).toBeNull();
  });
});

/**
 * O intradorso é opcional: por padrão o laudo sai só com o extradorso, e quem
 * mediu os dois lados inclui a segunda vela quando precisar.
 */
describe('PorosityMapSelector — intradorso opcional', () => {
  const gradeVazia = () => [
    [ponto(), ponto(), ponto(), ponto(), ponto()],
    [ponto(), ponto(), ponto(), ponto(), ponto()],
    [ponto(), ponto(), ponto(), ponto(), ponto()],
  ];

  it('começa só com o extradorso num laudo novo', () => {
    const { queryByText, getByText } = render(<PorosityMapSelector onChange={jest.fn()} />);

    expect(getByText('EXTRADORSO')).toBeTruthy();
    expect(queryByText('INTRADORSO')).toBeNull();
    expect(getByText('+ Incluir medição do intradorso')).toBeTruthy();
  });

  it('inclui o intradorso ao tocar no botão', () => {
    const onChange = jest.fn();
    const { getByText } = render(<PorosityMapSelector onChange={onChange} />);

    fireEvent.press(getByText('+ Incluir medição do intradorso'));

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ intradorsoAtivo: true }));
  });

  it('remove o intradorso sem apagar o que já tinha sido medido', () => {
    const onChange = jest.fn();
    const intradorso = gradeVazia();
    intradorso[1][2] = ponto({ selected: true, value: '150', cor: 'Cinza' });
    const mapa: PorosityMap = { extradorso: gradeVazia(), intradorso, intradorsoAtivo: true };

    const { getByText } = render(<PorosityMapSelector value={mapa} onChange={onChange} />);
    fireEvent.press(getByText('remover intradorso'));

    const enviado = onChange.mock.calls[0][0] as PorosityMap;
    expect(enviado.intradorsoAtivo).toBe(false);
    // A medição fica guardada: reincluir não deve custar uma nova passada no porosímetro.
    expect(enviado.intradorso[1][2]).toEqual({ selected: true, value: '150', cor: 'Cinza' });
  });

  it('mostra a segunda vela quando o intradorso está incluído', () => {
    const mapa: PorosityMap = {
      extradorso: gradeVazia(),
      intradorso: gradeVazia(),
      intradorsoAtivo: true,
    };

    const { getByText, queryByText } = render(
      <PorosityMapSelector value={mapa} onChange={jest.fn()} />
    );

    expect(getByText('INTRADORSO')).toBeTruthy();
    expect(queryByText('+ Incluir medição do intradorso')).toBeNull();
  });
});
