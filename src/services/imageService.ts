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

export async function pickFromCamera(): Promise<PhotoResult | null> {
  if (Platform.OS === 'web') {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // Força abrir a câmera traseira
      input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (!file) {
          resolve(null);
          return;
        }
        
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          const img = new Image();
          img.onload = () => resolve({ uri: base64, width: img.width, height: img.height });
          img.src = base64;
        };
        reader.onerror = () => reject(new Error('Falha ao ler a foto.'));
        reader.readAsDataURL(file);
      };
      input.click();
    });
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
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*'; // Exige explicitamente imagens, o Android vai mostrar a Galeria
      input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (!file) {
          resolve(null);
          return;
        }
        
        // Em web, lemos o arquivo direto para Base64 sem passar pelo ImageManipulator
        // porque o manipulador às vezes falha no Android Chrome com arquivos locais
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          
          // Obtemos as dimensões reais da imagem
          const img = new Image();
          img.onload = () => {
             resolve({
                uri: base64,
                width: img.width,
                height: img.height
             });
          };
          img.src = base64;
        };
        reader.onerror = () => reject(new Error('Falha ao ler o arquivo selecionado.'));
        reader.readAsDataURL(file);
      };
      input.click();
    });
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
