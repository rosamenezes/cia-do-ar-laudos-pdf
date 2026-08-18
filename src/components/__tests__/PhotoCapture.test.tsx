import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PhotoCapture } from '../PhotoCapture';
import * as imageService from '../../services/imageService';

jest.mock('../../services/imageService', () => ({
  pickFromCamera: jest.fn(),
  pickFromGallery: jest.fn(),
}));

describe('PhotoCapture component', () => {
  it('deve renderizar estado vazio com opções de Câmera e Galeria', () => {
    const { getByText } = render(
      <PhotoCapture photoUri={undefined} onPhotoSelected={jest.fn()} onPhotoRemoved={jest.fn()} />
    );

    expect(getByText('Adicionar Foto da Vela')).toBeTruthy();
    expect(getByText('Tirar foto agora')).toBeTruthy();
    expect(getByText('Escolher da galeria')).toBeTruthy();
  });

  it('deve acionar a câmera ao clicar no botão Câmera', async () => {
    (imageService.pickFromCamera as jest.Mock).mockResolvedValueOnce({
      uri: 'file:///photo.jpg',
    });
    const onPhotoSelectedMock = jest.fn();

    const { getByText } = render(
      <PhotoCapture
        photoUri={undefined}
        onPhotoSelected={onPhotoSelectedMock}
        onPhotoRemoved={jest.fn()}
      />
    );

    fireEvent.press(getByText('Tirar foto agora'));
    await Promise.resolve();

    expect(imageService.pickFromCamera).toHaveBeenCalled();
  });

  it('deve renderizar estado com foto adicionada', () => {
    const { getByText } = render(
      <PhotoCapture
        photoUri="file:///photo.jpg"
        onPhotoSelected={jest.fn()}
        onPhotoRemoved={jest.fn()}
      />
    );

    expect(getByText('Foto adicionada')).toBeTruthy();
  });
});
