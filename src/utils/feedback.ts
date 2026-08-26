import { Alert, Platform } from 'react-native';

/**
 * Diálogos que funcionam nos dois alvos do app.
 *
 * No React Native `window.alert` e `window.confirm` não existem: chamá-los
 * direto derruba a tela com "is not a function". Aqui a escolha entre o
 * diálogo do navegador e o `Alert` do RN fica em um lugar só.
 */

function juntar(titulo: string, mensagem?: string): string {
  return mensagem ? `${titulo}\n\n${mensagem}` : titulo;
}

/** Aviso simples, com um único botão de "ok". */
export function notificar(titulo: string, mensagem?: string): void {
  if (Platform.OS === 'web') {
    window.alert(juntar(titulo, mensagem));
    return;
  }
  Alert.alert(titulo, mensagem);
}

interface ConfirmarOpcoes {
  /** Texto do botão que confirma. Padrão: "Confirmar". */
  rotuloConfirmar?: string;
  /** Pinta o botão de confirmação como ação destrutiva (iOS). */
  destrutivo?: boolean;
}

/** Pergunta sim/não. Resolve como `false` se o usuário cancelar ou dispensar. */
export function confirmar(
  titulo: string,
  mensagem?: string,
  opcoes: ConfirmarOpcoes = {}
): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(juntar(titulo, mensagem)));
  }

  return new Promise((resolve) => {
    Alert.alert(
      titulo,
      mensagem,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        {
          text: opcoes.rotuloConfirmar ?? 'Confirmar',
          style: opcoes.destrutivo ? 'destructive' : 'default',
          onPress: () => resolve(true),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });
}
