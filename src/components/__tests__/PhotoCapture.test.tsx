import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PhotoCapture } from '../PhotoCapture';
import * as feedback from '../../utils/feedback';

jest.mock('../../services/imageService', () => ({
  pickFromCamera: jest.fn(),
  pickFromGallery: jest.fn(),
}));

/**
 * Regressão: estes botões usavam `Alert.alert`, que no react-native-web é um
 * `static alert() {}` — um no-op. Na prática, remover a foto no navegador não
 * fazia absolutamente nada, sem erro nem diálogo.
 */
describe('PhotoCapture — remover foto', () => {
  const props = {
    photoUri: 'https://exemplo.test/foto.jpg',
    onPhotoSelected: jest.fn(),
    onPhotoRemoved: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('remove a foto quando o usuário confirma', async () => {
    const confirmarSpy = jest.spyOn(feedback, 'confirmar').mockResolvedValue(true);

    const { getByLabelText } = render(<PhotoCapture {...props} />);
    fireEvent.press(getByLabelText('Remover foto'));

    await waitFor(() => expect(props.onPhotoRemoved).toHaveBeenCalledTimes(1));
    expect(confirmarSpy).toHaveBeenCalledWith(
      'Remover foto',
      'Deseja remover a foto do laudo?',
      { rotuloConfirmar: 'Remover', destrutivo: true }
    );
  });

  it('mantém a foto quando o usuário cancela', async () => {
    jest.spyOn(feedback, 'confirmar').mockResolvedValue(false);

    const { getByLabelText } = render(<PhotoCapture {...props} />);
    fireEvent.press(getByLabelText('Remover foto'));

    await waitFor(() => expect(feedback.confirmar).toHaveBeenCalled());
    expect(props.onPhotoRemoved).not.toHaveBeenCalled();
  });
});
