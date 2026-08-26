import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';

export interface PhotoResult {
  uri: string; // Base64 string agora
  width: number;
  height: number;
}

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return true;

  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') return false;

  const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
  return cameraStatus.status === 'granted';
}

/**
 * Seletor de imagem na web.
 *
 * O input PRECISA estar dentro do DOM antes do .click(): no Chrome do Android,
 * um input solto faz o sistema abrir apenas o seletor de arquivos, sem as
 * opções de Galeria/Fotos. Com o elemento na página e accept="image/*",
 * o Android oferece os apps de galeria normalmente.
 */
function pickImageFromWeb(capture?: 'environment'): Promise<PhotoResult | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    if (capture) input.setAttribute('capture', capture);

    input.style.position = 'fixed';
    input.style.left = '-9999px';
    input.style.opacity = '0';
    document.body.appendChild(input);

    const cleanup = () => {
      if (input.parentNode) input.parentNode.removeChild(input);
    };

    input.onchange = () => {
      const file = input.files && input.files[0];
      if (!file) {
        cleanup();
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const img = new Image();
        img.onload = () => {
          cleanup();
          resolve({ uri: base64, width: img.width, height: img.height });
        };
        img.onerror = () => {
          cleanup();
          reject(new Error('Não foi possível ler a imagem selecionada.'));
        };
        img.src = base64;
      };
      reader.onerror = () => {
        cleanup();
        reject(new Error('Falha ao ler o arquivo selecionado.'));
      };
      reader.readAsDataURL(file);
    };

    // Ao cancelar, o evento "change" não dispara: sem isto a Promise ficava
    // pendente para sempre e o botão parecia travado.
    input.oncancel = () => {
      cleanup();
      resolve(null);
    };

    input.click();
  });
}

export async function pickFromCamera(): Promise<PhotoResult | null> {
  if (Platform.OS === 'web') {
    return pickImageFromWeb('environment');
  }

  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') throw new Error('Permissão de câmera negada');

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: 'images',
    allowsEditing: false,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) return null;

  return await compressAndEncodeBase64(result.assets[0].uri);
}

export async function pickFromGallery(): Promise<PhotoResult | null> {
  if (Platform.OS === 'web') {
    return pickImageFromWeb();
  }

  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') throw new Error('Permissão de galeria negada');

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: 'images',
    allowsEditing: false, // Menos chances de quebrar no Android nativo
    aspect: [4, 3],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) return null;

  return await compressAndEncodeBase64(result.assets[0].uri);
}

async function compressAndEncodeBase64(uri: string): Promise<PhotoResult> {
  try {
    const manipulated = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 800 } }], {
      compress: 0.5, // 50% para poupar espaço no banco
      format: ImageManipulator.SaveFormat.JPEG,
    });

    const finalUri = manipulated.uri;
    const width = manipulated.width;
    const height = manipulated.height;

    let base64String = '';

    if (Platform.OS === 'web') {
      const response = await fetch(finalUri);
      const blob = await response.blob();
      base64String = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } else {
      const b64 = await FileSystem.readAsStringAsync(finalUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      base64String = `data:image/jpeg;base64,${b64}`;
    }

    return {
      uri: base64String,
      width,
      height,
    };
  } catch (error) {
    console.error('Erro ao converter imagem para Base64:', error);
    throw new Error('Falha ao processar a imagem.');
  }
}

export async function imageToBase64(uri: string): Promise<string> {
  // A uri já contém o próprio Base64 agora
  return uri;
}
