import { LaudoParapente } from '../types/laudo';

/** Como `saveLaudo` monta `cidadeEstado`: "Cidade - UF". */
const SEPARADOR = ' - ';

const VAZIO = '-';

/**
 * Os três campos são opcionais de propósito: nos laudos antigos `cidade` e
 * `estado` simplesmente não existem no documento.
 */
type Localidade = Partial<Pick<LaudoParapente, 'cidade' | 'estado' | 'cidadeEstado'>>;

function ausente(valor: string | undefined | null): boolean {
  return valor === undefined || valor === null;
}

/**
 * Quebra o texto combinado. A UF é sempre o último trecho, então a busca é pela
 * última ocorrência: cidades com hífen no nome ("Mogi-Guaçu") não se perdem.
 */
function partes(cidadeEstado: string): [string, string] {
  const i = cidadeEstado.lastIndexOf(SEPARADOR);
  if (i === -1) return [cidadeEstado.trim(), ''];
  return [cidadeEstado.slice(0, i).trim(), cidadeEstado.slice(i + SEPARADOR.length).trim()];
}

/**
 * Laudos anteriores à separação dos campos só têm `cidadeEstado`; os atuais
 * gravam `cidade` e `estado` em separado — inclusive como string vazia, quando
 * o campo não foi preenchido.
 *
 * Por isso o texto combinado só vale como fonte quando os dois campos separados
 * faltam no documento. Consultá-lo também no laudo novo fazia uma cidade em
 * branco exibir a UF, o único pedaço que sobrava em `cidadeEstado`.
 */
function resolver(laudo: Localidade): [string, string] {
  if (!ausente(laudo.cidade) || !ausente(laudo.estado)) {
    return [(laudo.cidade ?? '').trim(), (laudo.estado ?? '').trim()];
  }
  return partes(laudo.cidadeEstado ?? '');
}

/** Cidade para exibição, ou "-" quando não há o dado. */
export function cidadeDoLaudo(laudo: Localidade): string {
  return resolver(laudo)[0] || VAZIO;
}

/** UF para exibição, ou "-" quando não há o dado. */
export function estadoDoLaudo(laudo: Localidade): string {
  return resolver(laudo)[1] || VAZIO;
}
