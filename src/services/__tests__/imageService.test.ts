import {
  requestPermissions,
  pickFromCamera,
  pickFromGallery,
  imageToBase64,
} from '../imageService';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn().mockResolvedValue({
    uri: 'file:///mock/manipulated.jpg',
    width: 1200,
    height: 900,
  }),
  SaveFormat: { JPEG: 'jpeg' },
}));

describe('imageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve solicitar permissões de mídia e câmera', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'granted',
    });
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'granted',
    });

    const granted = await requestPermissions();
    expect(granted).toBe(true);
  });

  it('deve selecionar foto da câmera com sucesso', async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'granted',
    });
    (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file:///temp/camera.jpg' }],
    });

    const result = await pickFromCamera();
    expect(result).not.toBeNull();
    expect(result?.width).toBe(1200);
  });

  it('deve lançar erro se a permissão de câmera for negada', async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'denied',
    });

    await expect(pickFromCamera()).rejects.toThrow('Permissão de câmera negada');
  });

  it('deve selecionar foto da galeria com sucesso', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'granted',
    });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file:///temp/gallery.jpg' }],
    });

    const result = await pickFromGallery();
    expect(result).not.toBeNull();
  });

  it('deve converter imagem para base64 com prefixo data:image/jpeg', async () => {
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValueOnce('ABCDEF123456');

    const base64 = await imageToBase64('file:///mock/image.jpg');
    expect(base64).toBe('data:image/jpeg;base64,ABCDEF123456');
  });
});
