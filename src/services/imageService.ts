import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';

export interface PhotoResult {
  uri: string;
  base64?: string;
  width: number;
  height: number;
}

export async function requestPermissions(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') return false;

  const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
  return cameraStatus.status === 'granted';
}

export async function pickFromCamera(): Promise<PhotoResult | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permissão de câmera negada');
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: 'images',
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) return null;

  return await compressAndSave(result.assets[0].uri);
}

export async function pickFromGallery(): Promise<PhotoResult | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permissão de galeria negada');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: 'images',
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) return null;

  return await compressAndSave(result.assets[0].uri);
}

async function compressAndSave(uri: string): Promise<PhotoResult> {
  // Comprimir e redimensionar para máximo 1200px
  const manipulated = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 1200 } }], {
    compress: 0.75,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  // Salvar na pasta permanente do app
  const dir = FileSystem.documentDirectory + 'fotos/';
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });

  const filename = `foto_${Date.now()}.jpg`;
  const dest = dir + filename;

  await FileSystem.copyAsync({ from: manipulated.uri, to: dest });

  return {
    uri: dest,
    width: manipulated.width,
    height: manipulated.height,
  };
}

export async function imageToBase64(uri: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return `data:image/jpeg;base64,${base64}`;
}
