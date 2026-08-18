import React from 'react';
import { render } from '@testing-library/react-native';
import NovoLaudoScreen from '../novo';

jest.mock('../../../src/services/database', () => ({
  saveLaudo: jest.fn(),
  generateId: () => 'id-mock-123',
  generateNumeroLaudo: () => 'LRP-2026-9999',
}));

describe('NovoLaudoScreen', () => {
  it('deve renderizar o formulário para criação de novo laudo', () => {
    const { getByText } = render(<NovoLaudoScreen />);

    expect(getByText('1. Dados do Proprietário')).toBeTruthy();
    expect(getByText('2. Identificação da Vela')).toBeTruthy();
    expect(getByText('4. Checagem de Linhas')).toBeTruthy();
    expect(getByText('5. Checagem do Tecido')).toBeTruthy();
  });
});
