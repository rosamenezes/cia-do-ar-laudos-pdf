import { Alert, Platform } from 'react-native';
import { confirmar, notificar } from '../feedback';

/**
 * `Platform.OS` é lido no momento da chamada, então dá para alternar entre os
 * dois alvos sem reimportar o módulo.
 */
function comPlataforma<T>(os: 'web' | 'ios', executar: () => T): T {
  const original = Platform.OS;
  Object.defineProperty(Platform, 'OS', { value: os, configurable: true });
  try {
    return executar();
  } finally {
    Object.defineProperty(Platform, 'OS', { value: original, configurable: true });
  }
}

/**
 * O preset jest-expo roda como React Native: ali `window` existe, mas `alert` e
 * `confirm` não — é justamente por isso que chamá-los direto derrubava a tela.
 * Instalamos e removemos os dois para simular o navegador.
 */
function comDialogosDeNavegador<T>(
  respostaDoConfirm: boolean,
  executar: (chamadas: { alert: string[]; confirm: string[] }) => T
): T {
  const chamadas = { alert: [] as string[], confirm: [] as string[] };
  const janela = window as any;
  const tinhaAlert = 'alert' in janela;
  const tinhaConfirm = 'confirm' in janela;
  const alertOriginal = janela.alert;
  const confirmOriginal = janela.confirm;

  janela.alert = (msg: string) => chamadas.alert.push(msg);
  janela.confirm = (msg: string) => {
    chamadas.confirm.push(msg);
    return respostaDoConfirm;
  };

  try {
    return executar(chamadas);
  } finally {
    if (tinhaAlert) janela.alert = alertOriginal;
    else delete janela.alert;
    if (tinhaConfirm) janela.confirm = confirmOriginal;
    else delete janela.confirm;
  }
}

describe('notificar e confirmar', () => {
  afterEach(() => jest.restoreAllMocks());

  it('no web usa os diálogos do navegador', async () => {
    await comDialogosDeNavegador(true, async (chamadas) => {
      comPlataforma('web', () => notificar('Salvo', 'Tudo certo'));
      expect(chamadas.alert).toEqual(['Salvo\n\nTudo certo']);

      await expect(comPlataforma('web', () => confirmar('Excluir?'))).resolves.toBe(true);
      expect(chamadas.confirm).toEqual(['Excluir?']);
    });
  });

  it('no web, cancelar resolve como false', async () => {
    await comDialogosDeNavegador(false, async () => {
      await expect(comPlataforma('web', () => confirmar('Excluir?'))).resolves.toBe(false);
    });
  });

  it('no nativo usa o Alert do React Native', () => {
    // Regressão: `window.alert` nem existe no React Native — note que este
    // teste roda sem instalar os diálogos de navegador e mesmo assim passa.
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    comPlataforma('ios', () => notificar('Erro', 'Deu ruim'));

    expect(alertSpy).toHaveBeenCalledWith('Erro', 'Deu ruim');
  });

  it('no nativo, cancelar resolve como false', async () => {
    jest.spyOn(Alert, 'alert').mockImplementation((_titulo, _msg, botoes) => {
      // "Cancelar" é sempre o primeiro botão.
      botoes?.[0]?.onPress?.();
    });

    await expect(
      comPlataforma('ios', () => confirmar('Excluir Laudo', 'Some pra sempre'))
    ).resolves.toBe(false);
  });

  it('no nativo, confirmar resolve como true e respeita o rótulo', async () => {
    let rotulo: string | undefined;
    jest.spyOn(Alert, 'alert').mockImplementation((_titulo, _msg, botoes) => {
      rotulo = botoes?.[1]?.text;
      botoes?.[1]?.onPress?.();
    });

    await expect(
      comPlataforma('ios', () =>
        confirmar('Excluir Laudo', undefined, { rotuloConfirmar: 'Excluir', destrutivo: true })
      )
    ).resolves.toBe(true);
    expect(rotulo).toBe('Excluir');
  });
});
