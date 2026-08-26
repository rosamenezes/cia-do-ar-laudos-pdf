import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PerfilScreen from '../perfil';
import * as authService from '../../src/services/authService';
import * as feedback from '../../src/utils/feedback';

jest.mock('../../src/services/authService', () => ({ logout: jest.fn() }));

jest.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { displayName: 'Guilherme', email: 'guilherme@example.com' } }),
}));

jest.mock('../../src/contexts/ThemeContext', () => ({
  useAppTheme: () => ({
    colors: {
      background: '#fff',
      card: '#fff',
      text: '#000',
      textSecondary: '#666',
      divider: '#eee',
      danger: '#dc2626',
    },
  }),
}));

describe('PerfilScreen — sair da conta', () => {
  beforeEach(() => jest.clearAllMocks());

  it('só desloga depois que o usuário confirma', async () => {
    const confirmarSpy = jest.spyOn(feedback, 'confirmar').mockResolvedValue(true);

    const { getByText } = render(<PerfilScreen />);
    fireEvent.press(getByText('Sair da Conta'));

    await waitFor(() => expect(authService.logout).toHaveBeenCalledTimes(1));
    expect(confirmarSpy).toHaveBeenCalledWith('Deseja sair da sua conta?', undefined, {
      rotuloConfirmar: 'Sair',
    });
  });

  it('não desloga quando o usuário cancela', async () => {
    jest.spyOn(feedback, 'confirmar').mockResolvedValue(false);

    const { getByText } = render(<PerfilScreen />);
    fireEvent.press(getByText('Sair da Conta'));

    // Espera o ciclo da promise antes de afirmar que nada aconteceu.
    await waitFor(() => expect(feedback.confirmar).toHaveBeenCalled());
    expect(authService.logout).not.toHaveBeenCalled();
  });
});
