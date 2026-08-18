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
  if (Platform.OS !== 'web') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') throw new Error('Permissão de câmera negada');
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: 'images',
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) return null;

  return await compressAndEncodeBase64(result.assets[0].uri);
}

export async function pickFromGallery(): Promise<PhotoResult | null> {
  if (Platform.OS !== 'web') {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') throw new Error('Permissão de galeria negada');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: 'images',
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) return null;

  return await compressAndEncodeBase64(result.assets[0].uri);
}

async function compressAndEncodeBase64(uri: string): Promise<PhotoResult> {
  let finalUri = uri;
  let width = 800;
  let height = 600;

  if (Platform.OS !== 'web') {
    const manipulated = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 800 } }], {
      compress: 0.5, // 50% para poupar espaço no banco
      format: ImageManipulator.SaveFormat.JPEG,
    });
    finalUri = manipulated.uri;
    width = manipulated.width;
    height = manipulated.height;
  }

  try {
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
    console.error("Erro ao converter imagem para Base64:", error);
    throw new Error("Falha ao processar a imagem.");
  }
}

export async function imageToBase64(uri: string): Promise<string> {
  // A uri já contém o próprio Base64 agora
  return uri;
}
