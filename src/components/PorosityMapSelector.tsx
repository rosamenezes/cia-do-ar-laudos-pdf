import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import Svg, { Path, Defs, ClipPath, G, Line } from 'react-native-svg';
import { PorosityMap, PorosityPoint } from '../types/laudo';

interface Props {
  value?: PorosityMap;
  onChange: (value: PorosityMap) => void;
}

const defaultMap: PorosityMap = {
  extradorso: {
    pontaEsquerda: { selected: false, value: '' },
    meioEsquerda: { selected: false, value: '' },
    meioDireita: { selected: false, value: '' },
    pontaDireita: { selected: false, value: '' },
  },
  intradorso: {
    esquerda: { selected: false, value: '' },
    centro: { selected: false, value: '' },
    direita: { selected: false, value: '' },
  },
};

export default function PorosityMapSelector({ value = defaultMap, onChange }: Props) {
  const togglePoint = (section: 'extradorso' | 'intradorso', pointKey: string) => {
    const newMap = JSON.parse(JSON.stringify(value)) as PorosityMap;
    // @ts-ignore
    newMap[section][pointKey].selected = !newMap[section][pointKey].selected;
    onChange(newMap);
  };

  const updatePointValue = (section: 'extradorso' | 'intradorso', pointKey: string, text: string) => {
    const newMap = JSON.parse(JSON.stringify(value)) as PorosityMap;
    // @ts-ignore
    newMap[section][pointKey].value = text;
    onChange(newMap);
  };

  const renderDot = (cx: number | string, cy: number, section: 'extradorso' | 'intradorso', pointKey: string, label: string) => {
    // @ts-ignore
    const isSelected = value[section]?.[pointKey]?.selected;
    return (
      <TouchableOpacity
        key={`${section}-${pointKey}`}
        style={{ position: 'absolute', left: cx as any, top: cy, width: 30, height: 30, marginLeft: -15, marginTop: -15, alignItems: 'center', justifyContent: 'center' }}
        onPress={() => togglePoint(section, pointKey)}
        activeOpacity={0.8}
      >
        <View style={{
          width: 12, height: 12, borderRadius: 6,
          backgroundColor: isSelected ? '#ef4444' : '#ffffff',
          borderWidth: 1.5, borderColor: isSelected ? '#7f1d1d' : '#94a3b8',
          shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 2, shadowOffset: { width: 0, height: 1 },
          elevation: 4
        }} />
      </TouchableOpacity>
    );
  };

  const getActiveInputs = () => {
    const active: { section: string; key: string; label: string; point: PorosityPoint }[] = [];
    const exLabels: any = { pontaEsquerda: 'Extradorso: Ponta Esq.', meioEsquerda: 'Extradorso: Meio Esq.', meioDireita: 'Extradorso: Meio Dir.', pontaDireita: 'Extradorso: Ponta Dir.' };
    Object.keys(value.extradorso || {}).forEach(k => {
      // @ts-ignore
      if (value.extradorso[k]?.selected) active.push({ section: 'extradorso', key: k, label: exLabels[k], point: value.extradorso[k] });
    });
    const inLabels: any = { esquerda: 'Intradorso: Esquerda', centro: 'Intradorso: Centro', direita: 'Intradorso: Direita' };
    Object.keys(value.intradorso || {}).forEach(k => {
      // @ts-ignore
      if (value.intradorso[k]?.selected) active.push({ section: 'intradorso', key: k, label: inLabels[k], point: value.intradorso[k] });
    });
    return active;
  };

  const activeInputs = getActiveInputs();

  const lines = Array.from({ length: 30 }).map((_, i) => (25 + i * 11.6));
  
  // New beautifully rounded path
  const wingPath = "M 30 75 C 10 75, 10 55, 30 55 Q 200 -5 370 55 C 390 55, 390 75, 370 75 Q 200 65 30 75 Z";
  const shadowPath = "M 30 78 C 10 78, 10 58, 30 58 Q 200 -2 370 58 C 390 58, 390 78, 370 78 Q 200 68 30 78 Z";

  return (
    <View style={styles.container}>
      {/* Extradorso */}
      <View style={styles.mapContainer}>
        <Text style={styles.mapTitle}>EXTRADORSO</Text>
        <View style={{ width: '100%', height: 110, position: 'relative' }}>
          <Svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none">
            <Defs>
              <ClipPath id="wingClipExt">
                <Path d={wingPath} />
              </ClipPath>
            </Defs>
            <Path d={shadowPath} fill="#cbd5e1" />
            <Path d={wingPath} fill="#ffffff" />
            <G clipPath="url(#wingClipExt)">
              {lines.map(x => (
                <Line key={`ext-${x}`} x1={x} y1="0" x2={x} y2="100" stroke="#e2e8f0" strokeWidth="1.5" />
              ))}
            </G>
            <Path d={wingPath} fill="none" stroke="#334155" strokeWidth="2.5" strokeLinejoin="round" />
          </Svg>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            {renderDot('20%', 58, 'extradorso', 'pontaEsquerda', 'P.E ESQ')}
            {renderDot('40%', 36, 'extradorso', 'meioEsquerda', 'M. ESQ')}
            {renderDot('60%', 36, 'extradorso', 'meioDireita', 'M. DIR')}
            {renderDot('80%', 58, 'extradorso', 'pontaDireita', 'P.E DIR')}
          </View>
        </View>
      </View>

      {/* Intradorso */}
      <View style={styles.mapContainer}>
        <Text style={styles.mapTitle}>INTRADORSO</Text>
        <View style={{ width: '100%', height: 110, position: 'relative' }}>
          <Svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none">
            <Defs>
              <ClipPath id="wingClipInt">
                <Path d={wingPath} />
              </ClipPath>
            </Defs>
            <Path d={shadowPath} fill="#cbd5e1" />
            <Path d={wingPath} fill="#f1f5f9" />
            <G clipPath="url(#wingClipInt)">
              {lines.map(x => (
                <Line key={`int-${x}`} x1={x} y1="0" x2={x} y2="100" stroke="#cbd5e1" strokeWidth="1.5" />
              ))}
            </G>
            <Path d={wingPath} fill="none" stroke="#475569" strokeWidth="2.5" strokeLinejoin="round" />
          </Svg>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            {renderDot('25%', 50, 'intradorso', 'esquerda', 'ESQ')}
            {renderDot('50%', 28, 'intradorso', 'centro', 'CENTRO')}
            {renderDot('75%', 50, 'intradorso', 'direita', 'DIR')}
          </View>
        </View>
      </View>

      {/* Inputs */}
      {activeInputs.length > 0 && (
        <View style={styles.inputsSection}>
          <Text style={styles.inputsTitle}>Valores Medidos (Segundos)</Text>
          {activeInputs.map((item) => (
            <View key={`${item.section}-${item.key}`} style={styles.inputRow}>
              <Text style={styles.inputLabel}>{item.label}</Text>
              <TextInput
                style={styles.input}
                value={item.point.value}
                onChangeText={(txt) => updatePointValue(item.section as any, item.key, txt)}
                placeholder="Ex: 120"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
            </View>
          ))}
        </View>
      )}
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
  mapTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputsSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 16,
  },
  inputsTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputLabel: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '700',
    flex: 1,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: 110,
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
});
