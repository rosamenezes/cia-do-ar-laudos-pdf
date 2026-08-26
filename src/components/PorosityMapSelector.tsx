import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  PorosityGrid,
  PorosityMap,
  PorosityMapLegacy,
  PorosityPoint,
  isPorosityLegacy,
  intradorsoEstaAtivo,
} from '../types/laudo';
import {
  POROSIDADE_COLUNAS,
  POROSIDADE_COLUNA_X,
  POROSIDADE_PONTOS_POR_COLUNA,
  POROSIDADE_PONTO_Y,
  POROSIDADE_VELA_PATH,
} from '../types/constants';

interface Props {
  value?: PorosityMap | PorosityMapLegacy;
  onChange: (value: PorosityMap) => void;
}

/** Nomes das 3 colunas, da esquerda para a direita */
const COLUNAS = POROSIDADE_COLUNAS;
const PONTOS_POR_COLUNA = POROSIDADE_PONTOS_POR_COLUNA;

/** Coordenadas no viewBox do desenho, compartilhadas com o PDF */
const COLUNA_X = POROSIDADE_COLUNA_X;
const PONTO_Y = POROSIDADE_PONTO_Y;

/** Recorte vertical do desenho dentro do viewBox */
const VIEW_TOPO = 48;
const VIEW_ALTURA = 96;

const VELA_PATH = POROSIDADE_VELA_PATH;

function pontoVazio(): PorosityPoint {
  return { selected: false, value: '', cor: '' };
}

function gradeVazia(): PorosityGrid {
  return COLUNAS.map(() => Array.from({ length: PONTOS_POR_COLUNA }, pontoVazio));
}

/**
 * Traz o valor recebido para a grade 3×5.
 * Laudos antigos usavam pontos nomeados: aproveitamos as medições que existiam,
 * encaixando-as na coluna correspondente, para não perder o dado já registrado.
 */
function normalizar(value?: PorosityMap | PorosityMapLegacy): PorosityMap {
  // Laudo novo começa só com o extradorso: o intradorso é opcional.
  if (!value) return { extradorso: gradeVazia(), intradorso: gradeVazia(), intradorsoAtivo: false };

  const ativo = intradorsoEstaAtivo(value);

  if (!isPorosityLegacy(value)) {
    const corrigir = (grade?: PorosityGrid): PorosityGrid => {
      const base = gradeVazia();
      if (!Array.isArray(grade)) return base;
      grade.forEach((coluna, c) => {
        if (!Array.isArray(coluna) || c >= COLUNAS.length) return;
        coluna.forEach((ponto, i) => {
          if (i < PONTOS_POR_COLUNA && ponto) {
            base[c][i] = { selected: !!ponto.selected, value: ponto.value ?? '', cor: ponto.cor ?? '' };
          }
        });
      });
      return base;
    };
    return {
      extradorso: corrigir(value.extradorso),
      intradorso: corrigir(value.intradorso),
      intradorsoAtivo: ativo,
    };
  }

  // Migração do formato antigo: mantém as leituras, no ponto central de cada coluna
  const extradorso = gradeVazia();
  const intradorso = gradeVazia();
  const meio = 2;

  const foiMedido = (antigo?: PorosityPoint) => !!(antigo?.selected || antigo?.value);

  const migrar = (
    destino: PorosityGrid,
    coluna: number,
    antigo?: PorosityPoint,
    ponto: number = meio
  ) => {
    if (!foiMedido(antigo)) return;
    destino[coluna][ponto] = {
      selected: true,
      value: antigo!.value ?? '',
      cor: antigo!.cor ?? '',
    };
  };

  migrar(extradorso, 0, value.extradorso?.pontaEsquerda);
  migrar(extradorso, 2, value.extradorso?.pontaDireita);

  // O extradorso antigo tinha 4 pontos e a grade nova tem 3 colunas: os dois do
  // meio disputam a coluna CENTRO. Guardamos cada um em um ponto próprio dela,
  // porque descartar uma medição já registrada seria perda silenciosa de dado.
  migrar(extradorso, 1, value.extradorso?.meioEsquerda, meio);
  migrar(
    extradorso,
    1,
    value.extradorso?.meioDireita,
    foiMedido(value.extradorso?.meioEsquerda) ? meio + 1 : meio
  );

  migrar(intradorso, 0, value.intradorso?.esquerda);
  migrar(intradorso, 1, value.intradorso?.centro);
  migrar(intradorso, 2, value.intradorso?.direita);

  return { extradorso, intradorso, intradorsoAtivo: ativo };
}

export default function PorosityMapSelector({ value, onChange }: Props) {
  const mapa = normalizar(value);

  const atualizar = (
    secao: 'extradorso' | 'intradorso',
    coluna: number,
    ponto: number,
    mudanca: Partial<PorosityPoint>
  ) => {
    const novo: PorosityMap = {
      extradorso: mapa.extradorso.map((c) => c.map((p) => ({ ...p }))),
      intradorso: mapa.intradorso.map((c) => c.map((p) => ({ ...p }))),
      intradorsoAtivo: mapa.intradorsoAtivo,
    };
    novo[secao][coluna][ponto] = { ...novo[secao][coluna][ponto], ...mudanca };
    onChange(novo);
  };

  /**
   * Liga/desliga o intradorso. Ao desligar, os pontos marcados continuam
   * guardados — quem tirou sem querer reinclui sem refazer as medições —,
   * mas a superfície some do laudo.
   */
  const alternarIntradorso = () => {
    onChange({
      extradorso: mapa.extradorso.map((c) => c.map((p) => ({ ...p }))),
      intradorso: mapa.intradorso.map((c) => c.map((p) => ({ ...p }))),
      intradorsoAtivo: !mapa.intradorsoAtivo,
    });
  };

  const renderSuperficie = (
    secao: 'extradorso' | 'intradorso',
    titulo: string,
    comRemover = false
  ) => {
    const grade = mapa[secao];

    const marcados: { coluna: number; ponto: number; dados: PorosityPoint }[] = [];
    grade.forEach((coluna, c) =>
      coluna.forEach((dados, i) => {
        if (dados.selected) marcados.push({ coluna: c, ponto: i, dados });
      })
    );

    return (
      <View style={styles.mapContainer}>
        <View style={styles.mapHeader}>
          <Text style={styles.mapTitle}>{titulo}</Text>
          {comRemover && (
            <TouchableOpacity
              style={styles.removerSuperficie}
              onPress={alternarIntradorso}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.removerSuperficieTexto}>remover intradorso</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.desenho}>
          <Svg width="100%" height="100%" viewBox={`0 ${VIEW_TOPO} 400 ${VIEW_ALTURA}`}>
            <Path d={VELA_PATH} fill="#ffffff" stroke="#0f172a" strokeWidth="3" strokeLinejoin="round" />
          </Svg>

          {/* Pontos clicáveis por cima do desenho */}
          <View style={StyleSheet.absoluteFill}>
            {grade.map((coluna, c) =>
              coluna.map((ponto, i) => (
                <TouchableOpacity
                  key={`${secao}-${c}-${i}`}
                  style={[
                    styles.alvo,
                    {
                      left: `${(COLUNA_X[c] / 400) * 100}%`,
                      top: `${((PONTO_Y[c][i] - VIEW_TOPO) / VIEW_ALTURA) * 100}%`,
                    },
                  ]}
                  onPress={() => atualizar(secao, c, i, { selected: !ponto.selected })}
                  activeOpacity={0.7}
                >
                  <View style={[styles.bolinha, ponto.selected && styles.bolinhaMarcada]} />
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {/* Rótulos das colunas */}
        <View style={styles.colunaLabels}>
          {COLUNAS.map((nome) => (
            <Text key={nome} style={styles.colunaLabel}>
              {nome}
            </Text>
          ))}
        </View>

        {/* Campos dos pontos marcados */}
        {marcados.length > 0 && (
          <View style={styles.inputsSection}>
            {marcados.map(({ coluna, ponto, dados }) => (
              <View key={`campo-${secao}-${coluna}-${ponto}`} style={styles.inputRow}>
                <View style={styles.inputHeader}>
                  <Text style={styles.inputLabel}>
                    {COLUNAS[coluna]} · Ponto {ponto + 1}
                  </Text>
                  <TouchableOpacity
                    onPress={() => atualizar(secao, coluna, ponto, { selected: false })}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.remover}>remover</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputPair}>
                  <TextInput
                    style={[styles.input, styles.inputCor]}
                    value={dados.cor}
                    onChangeText={(txt) => atualizar(secao, coluna, ponto, { cor: txt })}
                    placeholder="Cor do tecido"
                    placeholderTextColor="#94a3b8"
                  />
                  <TextInput
                    style={[styles.input, styles.inputValor]}
                    value={dados.value}
                    onChangeText={(txt) => atualizar(secao, coluna, ponto, { value: txt })}
                    placeholder="Seg."
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderSuperficie('extradorso', 'EXTRADORSO')}

      {mapa.intradorsoAtivo ? (
        renderSuperficie('intradorso', 'INTRADORSO', true)
      ) : (
        <TouchableOpacity
          style={styles.adicionarIntradorso}
          onPress={alternarIntradorso}
          activeOpacity={0.7}
        >
          <Text style={styles.adicionarIntradorsoTexto}>+ Incluir medição do intradorso</Text>
          <Text style={styles.adicionarIntradorsoDica}>
            Opcional — sem isso o laudo sai só com o extradorso
          </Text>
        </TouchableOpacity>
      )}
      <Text style={styles.dica}>
        Toque nos pontos onde a medição foi feita. Para cada ponto marcado, informe a cor do tecido
        e a leitura do porosímetro.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginVertical: 12,
  },
  mapContainer: {
    marginBottom: 20,
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 10,
  },
  removerSuperficie: {
    paddingHorizontal: 4,
  },
  removerSuperficieTexto: {
    fontSize: 11,
    color: '#ef4444',
    fontWeight: '700',
  },
  adicionarIntradorso: {
    borderWidth: 1.5,
    borderColor: '#f9a8d4',
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#fdf2f8',
  },
  adicionarIntradorsoTexto: {
    fontSize: 13,
    fontWeight: '800',
    color: '#db2777',
    letterSpacing: 0.3,
  },
  adicionarIntradorsoDica: {
    fontSize: 11,
    color: '#9d174d',
    marginTop: 3,
    textAlign: 'center',
  },
  mapTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  desenho: {
    width: '100%',
    aspectRatio: 400 / VIEW_ALTURA,
    position: 'relative',
  },
  alvo: {
    position: 'absolute',
    width: 34,
    height: 34,
    marginLeft: -17,
    marginTop: -17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bolinha: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#64748b',
  },
  bolinhaMarcada: {
    backgroundColor: '#dc2626',
    borderColor: '#7f1d1d',
  },
  colunaLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: '12%',
    marginTop: 2,
  },
  colunaLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  inputsSection: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
    gap: 8,
  },
  inputRow: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputLabel: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  remover: {
    fontSize: 11,
    color: '#ef4444',
    fontWeight: '700',
  },
  inputPair: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 14,
    color: '#0f172a',
  },
  inputCor: {
    flex: 1,
  },
  inputValor: {
    width: 90,
    fontWeight: '700',
    textAlign: 'center',
  },
  dica: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 16,
  },
});
