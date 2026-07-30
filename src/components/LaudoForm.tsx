import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { PhotoCapture } from './PhotoCapture';
import {
  ParecerGeral,
  StatusCheck,
  LaudoFormData,
} from '../types/laudo';
import {
  STATUS_CHECK_OPTIONS,
  PARECER_GERAL_LABELS,
  PARECER_GERAL_COLORS,
  ESTADOS_BRASIL,
  EstadoBrasil,
} from '../types/constants';

// Schema de validação Zod
const laudoSchema = z.object({
  numeroLaudo: z.string().min(1, 'Número do laudo é obrigatório'),
  dataEmissao: z.string().min(1, 'Data de emissão é obrigatória'),
  
  // Proprietário
  nomeProprietario: z.string().min(1, 'Nome do proprietário é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().min(1, 'UF é obrigatório'),
  telefone: z.string().min(1, 'Telefone é obrigatório'),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  email: z.string().email('E-mail inválido'),

  // Vela
  fabricaModelo: z.string().min(1, 'Fábrica/Modelo é obrigatório'),
  numeroSerie: z.string().min(1, 'Nº de Série é obrigatório'),
  dataFabricacao: z.string().min(1, 'Data de Fabricação é obrigatória'),
  corBordoAtaque: z.string().min(1, 'Cor do Bordo de Ataque é obrigatória'),
  corIntradorso: z.string().min(1, 'Cor do Intradorso é obrigatória'),
  corExtradorso: z.string().min(1, 'Cor do Extradorso é obrigatória'),

  // Linhas
  linhasTirantes: z.enum(['Ok', 'Não Ok']),
  linhasTirantesObs: z.string().optional(),
  linhasBatoquesArgolas: z.enum(['Ok', 'Não Ok']),
  linhasBatoquesArgolasObs: z.string().optional(),
  linhasRoldanas: z.enum(['Ok', 'Não Ok']),
  linhasRoldanasObs: z.string().optional(),
  linhasDistorcedor: z.enum(['Ok', 'Não Ok']),
  linhasDistorcedorObs: z.string().optional(),
  linhasCarga: z.enum(['Ok', 'Não Ok']),
  linhasCargaObs: z.string().optional(),
  linhasTroca: z.enum(['Ok', 'Não Ok']),
  linhasTrocaObs: z.string().optional(),
  linhasSimetriaTrimagem: z.enum(['Ok', 'Não Ok']),
  linhasSimetriaTrimagemObs: z.string().optional(),

  // Tecido
  tecidoCheckPerfil: z.enum(['Ok', 'Não Ok']),
  tecidoCheckPerfilObs: z.string().optional(),
  tecidoCheckIntradorso: z.enum(['Ok', 'Não Ok']),
  tecidoCheckIntradorsoObs: z.string().optional(),
  tecidoCheckBordoAtaque: z.enum(['Ok', 'Não Ok']),
  tecidoCheckBordoAtaqueObs: z.string().optional(),
  tecidoCheckExtradorso: z.enum(['Ok', 'Não Ok']),
  tecidoCheckExtradorsoObs: z.string().optional(),
  
  tecidoTesteResistencia: z.string().min(1, 'Obrigatório'),
  tecidoPorosidadeBordoAtaque: z.string().min(1, 'Obrigatório'),
  tecidoPorosidadeIntradorso: z.string().min(1, 'Obrigatório'),
  tecidoPorosidadeExtradorso: z.string().min(1, 'Obrigatório'),
  
  parecerConformeFabricante: z.string().min(1, 'Obrigatório'),
  observacoes: z.string(),

  // Geral e Foto
  parecerGeral: z.enum(['OTIMO', 'MUITO_BOM', 'USADO_BOM_ESTADO', 'USADO_RAZOAVEL', 'MUITO_USADO', 'CONDENADO']),
  fotoUri: z.string().optional(),
});

type FormValues = z.infer<typeof laudoSchema>;

interface LaudoFormProps {
  defaultValues?: Partial<FormValues>;
  onSubmit: (data: LaudoFormData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

// Select Row para opções Ok/Não Ok + Observação Opcional
function SelectRow<T extends string>({
  label,
  options,
  value,
  onChange,
  obsValue,
  onObsChange,
  error,
  colors,
}: {
  label: string;
  options: [T, string][];
  value: T;
  onChange: (v: T) => void;
  obsValue?: string;
  onObsChange?: (v: string) => void;
  error?: string;
  colors?: Record<string, string>;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.selectRow}>
        {options.map(([key, display]) => {
          const isSelected = value === key;
          const color = colors?.[key] ?? (key === 'Não Ok' ? '#ef4444' : '#3b82f6');
          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.selectChip,
                isSelected && { backgroundColor: color + '22', borderColor: color },
              ]}
              onPress={() => onChange(key)}
            >
              <Text style={[styles.selectChipText, isSelected && { color }]}>{display}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {onObsChange && (
        <TextInput
          style={[styles.input, styles.obsInput]}
          value={obsValue ?? ''}
          onChangeText={onObsChange}
          placeholder="Observação (opcional)"
          placeholderTextColor="#475569"
        />
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// Select Vertical para Parecer Geral
function SelectVertical<T extends string>({
  options,
  value,
  onChange,
  colors,
}: {
  options: [T, string][];
  value: T;
  onChange: (v: T) => void;
  colors: Record<string, string>;
}) {
  return (
    <View style={styles.verticalSelect}>
      {options.map(([key, display]) => {
        const isSelected = value === key;
        const color = colors[key];
        return (
          <TouchableOpacity
            key={key}
            style={[
              styles.verticalOption,
              isSelected && { backgroundColor: color + '1a', borderColor: color },
            ]}
            onPress={() => onChange(key)}
          >
            <View style={[styles.radio, isSelected && { borderColor: color }]}>
              {isSelected && <View style={[styles.radioInner, { backgroundColor: color }]} />}
            </View>
            <Text style={[styles.verticalOptionText, isSelected && { color, fontWeight: '700' }]}>
              {display}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Selector de Estado (UF) com Modal Grid
function StatePicker({ value, onChange, error }: { value: string; onChange: (val: string) => void; error?: string }) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>Estado (UF)</Text>
      <TouchableOpacity
        style={[styles.input, styles.statePickerBtn, error ? styles.inputError : null]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.statePickerText, !value && { color: '#475569' }]}>
          {value || 'UF'}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#94a3b8" />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>⚠ {error}</Text>}

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione o Estado (UF)</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.ufGrid}>
              {ESTADOS_BRASIL.map((uf) => {
                const isSelected = value === uf;
                return (
                  <TouchableOpacity
                    key={uf}
                    style={[styles.ufChip, isSelected && styles.ufChipSelected]}
                    onPress={() => {
                      onChange(uf);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={[styles.ufChipText, isSelected && styles.ufChipTextSelected]}>{uf}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// Formatação e seletores de Data Nativa (iOS / Android)
function parseDateString(str?: string): Date {
  if (!str) return new Date();
  try {
    if (str.includes('-')) {
      const parts = str.split('-').map(Number);
      if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
      }
    }
    if (str.includes('/')) {
      const parts = str.split('/').map(Number);
      if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
        return new Date(parts[2], parts[1] - 1, parts[0]);
      }
    }
  } catch {}
  return new Date();
}

function formatDateForDisplay(isoOrStr?: string): string {
  if (!isoOrStr) return '';
  const d = parseDateString(isoOrStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatDateForValue(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
}

function DatePickerField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  const selectedDate = parseDateString(value);

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }
    if (event.type === 'set' && date) {
      onChange(formatDateForValue(date));
    }
  };

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.input, styles.datePickerBtn, error ? styles.inputError : null]}
        onPress={() => setShow(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="calendar-outline" size={18} color="#db2777" style={{ marginRight: 8 }} />
        <Text style={[styles.datePickerText, !value && { color: '#475569' }]}>
          {value ? formatDateForDisplay(value) : 'DD/MM/AAAA'}
        </Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>⚠ {error}</Text>}

      {show && (
        Platform.OS === 'ios' ? (
          <Modal transparent animationType="fade" visible={show} onRequestClose={() => setShow(false)}>
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShow(false)}>
              <View style={styles.iosDatePickerContainer} onStartShouldSetResponder={() => true}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Selecione a Data</Text>
                  <TouchableOpacity onPress={() => setShow(false)}>
                    <Text style={{ color: '#db2777', fontWeight: '700', fontSize: 15 }}>Concluir</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="spinner"
                  textColor="#f1f5f9"
                  onChange={handleChange}
                  locale="pt-BR"
                  themeVariant="dark"
                />
              </View>
            </TouchableOpacity>
          </Modal>
        ) : (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleChange}
          />
        )
      )}
    </View>
  );
}

export function LaudoForm({ defaultValues, onSubmit, isLoading, submitLabel = 'Salvar Laudo' }: LaudoFormProps) {
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(laudoSchema),
    defaultValues: {
      dataEmissao: defaultValues?.dataEmissao ?? new Date().toISOString().split('T')[0],
      dataFabricacao: defaultValues?.dataFabricacao ?? new Date().toISOString().split('T')[0],
      cidade: defaultValues?.cidade ?? (defaultValues?.cidadeEstado ? defaultValues.cidadeEstado.split('-')[0].trim() : ''),
      estado: defaultValues?.estado ?? (defaultValues?.cidadeEstado && defaultValues.cidadeEstado.includes('-') ? defaultValues.cidadeEstado.split('-')[1].trim() : 'RS'),
      // Valores padrão recomendados
      linhasTirantes: 'Ok', linhasTirantesObs: '',
      linhasBatoquesArgolas: 'Ok', linhasBatoquesArgolasObs: '',
      linhasRoldanas: 'Ok', linhasRoldanasObs: '',
      linhasDistorcedor: 'Ok', linhasDistorcedorObs: '',
      linhasCarga: 'Ok', linhasCargaObs: '',
      linhasTroca: 'Ok', linhasTrocaObs: '',
      linhasSimetriaTrimagem: 'Ok', linhasSimetriaTrimagemObs: '',
      
      tecidoCheckPerfil: 'Ok', tecidoCheckPerfilObs: '',
      tecidoCheckIntradorso: 'Ok', tecidoCheckIntradorsoObs: '',
      tecidoCheckBordoAtaque: 'Ok', tecidoCheckBordoAtaqueObs: '',
      tecidoCheckExtradorso: 'Ok', tecidoCheckExtradorsoObs: '',
      
      tecidoTesteResistencia: 'Correto', tecidoPorosidadeBordoAtaque: 'Correto', tecidoPorosidadeIntradorso: 'Correto', tecidoPorosidadeExtradorso: 'Correto',
      parecerConformeFabricante: 'Correto',
      observacoes: '',
      parecerGeral: 'OTIMO',
      ...defaultValues,
    },
  });

  const fotoUri = watch('fotoUri');

  const handleFormSubmit = async (data: FormValues) => {
    // Garantir fallback vazio para optional strings caso venha undefined
    const parsedData = {
      ...data,
      cidadeEstado: `${data.cidade} - ${data.estado}`,
      linhasTirantesObs: data.linhasTirantesObs || '',
      linhasBatoquesArgolasObs: data.linhasBatoquesArgolasObs || '',
      linhasRoldanasObs: data.linhasRoldanasObs || '',
      linhasDistorcedorObs: data.linhasDistorcedorObs || '',
      linhasCargaObs: data.linhasCargaObs || '',
      linhasTrocaObs: data.linhasTrocaObs || '',
      linhasSimetriaTrimagemObs: data.linhasSimetriaTrimagemObs || '',
      tecidoCheckPerfilObs: data.tecidoCheckPerfilObs || '',
      tecidoCheckIntradorsoObs: data.tecidoCheckIntradorsoObs || '',
      tecidoCheckBordoAtaqueObs: data.tecidoCheckBordoAtaqueObs || '',
      tecidoCheckExtradorsoObs: data.tecidoCheckExtradorsoObs || '',
    };
    await onSubmit(parsedData as LaudoFormData);
  };

  return (
    <View style={styles.container}>
      {/* IDENTIFICAÇÃO DO LAUDO E PROPRIETÁRIO */}
      <SectionHeader icon="person" title="1. Dados do Proprietário" />
      
      <View style={styles.row}>
        <View style={styles.flex1}>
          <InputField control={control} name="numeroLaudo" label="Número do Laudo" autoCapitalize="characters" error={errors.numeroLaudo?.message} />
        </View>
        <View style={styles.flex1}>
          <Controller
            control={control}
            name="dataEmissao"
            render={({ field: { value, onChange } }) => (
              <DatePickerField label="Data da Revisão" value={value} onChange={onChange} error={errors.dataEmissao?.message} />
            )}
          />
        </View>
      </View>

      <InputField control={control} name="nomeProprietario" label="Nome do Proprietário" error={errors.nomeProprietario?.message} />
      
      <View style={styles.row}>
        <View style={{ flex: 2.2 }}>
          <InputField control={control} name="cidade" label="Cidade" placeholder="Ex: Porto Alegre" error={errors.cidade?.message} />
        </View>
        <View style={{ flex: 1 }}>
          <Controller
            control={control}
            name="estado"
            render={({ field: { value, onChange } }) => (
              <StatePicker value={value} onChange={onChange} error={errors.estado?.message} />
            )}
          />
        </View>
      </View>
      
      <View style={styles.row}>
        <View style={styles.flex1}>
          <InputField control={control} name="telefone" label="Telefone" keyboardType="numeric" error={errors.telefone?.message} />
        </View>
        <View style={styles.flex1}>
          <InputField control={control} name="email" label="E-mail" keyboardType="email-address" autoCapitalize="none" error={errors.email?.message} />
        </View>
      </View>
      <InputField control={control} name="endereco" label="Endereço" error={errors.endereco?.message} />

      {/* IDENTIFICAÇÃO DA VELA */}
      <SectionHeader icon="leaf" title="2. Identificação da Vela" />
      <InputField control={control} name="fabricaModelo" label="Fábrica / Modelo" error={errors.fabricaModelo?.message} />
      
      <View style={styles.row}>
        <View style={styles.flex1}>
          <InputField control={control} name="numeroSerie" label="Nº de Série" error={errors.numeroSerie?.message} autoCapitalize="characters" />
        </View>
        <View style={styles.flex1}>
          <Controller
            control={control}
            name="dataFabricacao"
            render={({ field: { value, onChange } }) => (
              <DatePickerField label="Data Fabricação" value={value} onChange={onChange} error={errors.dataFabricacao?.message} />
            )}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.flex1}><InputField control={control} name="corBordoAtaque" label="Cor Bordo Ataque" error={errors.corBordoAtaque?.message} /></View>
        <View style={styles.flex1}><InputField control={control} name="corIntradorso" label="Cor Intradorso" error={errors.corIntradorso?.message} /></View>
        <View style={styles.flex1}><InputField control={control} name="corExtradorso" label="Cor Extradorso" error={errors.corExtradorso?.message} /></View>
      </View>

      {/* FOTO DA VELA */}
      <SectionHeader icon="camera" title="3. Identificação Visual (Foto)" />
      <PhotoCapture photoUri={fotoUri} onPhotoSelected={(uri) => setValue('fotoUri', uri)} onPhotoRemoved={() => setValue('fotoUri', undefined)} />

      {/* CHECAGEM DE LINHAS */}
      <SectionHeader icon="analytics" title="4. Checagem de Linhas" />
      <View style={styles.gridChecksFull}>
        {['Tirantes', 'BatoquesArgolas', 'Roldanas', 'Distorcedor', 'Carga', 'Troca', 'SimetriaTrimagem'].map((key) => (
          <Controller key={key} control={control} name={`linhas${key}` as any} render={({ field: { value, onChange } }) => (
            <Controller control={control} name={`linhas${key}Obs` as any} render={({ field: { value: obsValue, onChange: onObsChange } }) => (
              <SelectRow 
                label={key.replace(/([A-Z])/g, ' $1').trim()} 
                options={STATUS_CHECK_OPTIONS} 
                value={value as StatusCheck} 
                onChange={onChange} 
                obsValue={obsValue}
                onObsChange={onObsChange}
              />
            )} />
          )} />
        ))}
      </View>

      {/* CHECAGEM DO TECIDO */}
      <SectionHeader icon="layers" title="5. Checagem do Tecido" />
      
      <Text style={styles.subTitle}>Visual</Text>
      <View style={styles.gridChecksFull}>
        {['Perfil', 'Intradorso', 'BordoAtaque', 'Extradorso'].map((key) => (
          <Controller key={key} control={control} name={`tecidoCheck${key}` as any} render={({ field: { value, onChange } }) => (
            <Controller control={control} name={`tecidoCheck${key}Obs` as any} render={({ field: { value: obsValue, onChange: onObsChange } }) => (
              <SelectRow 
                label={key.replace(/([A-Z])/g, ' $1').trim()} 
                options={STATUS_CHECK_OPTIONS} 
                value={value as StatusCheck} 
                onChange={onChange} 
                obsValue={obsValue}
                onObsChange={onObsChange}
              />
            )} />
          )} />
        ))}
      </View>

      <Text style={styles.subTitle}>Testes & Porosidade</Text>
      <View style={styles.row}>
        <View style={styles.flex1}><InputField control={control} name="tecidoTesteResistencia" label="Teste de Resistência" error={errors.tecidoTesteResistencia?.message} /></View>
        <View style={styles.flex1}><InputField control={control} name="tecidoPorosidadeBordoAtaque" label="Porosidade B. Ataque" error={errors.tecidoPorosidadeBordoAtaque?.message} /></View>
      </View>
      <View style={styles.row}>
        <View style={styles.flex1}><InputField control={control} name="tecidoPorosidadeIntradorso" label="Porosidade Intradorso" error={errors.tecidoPorosidadeIntradorso?.message} /></View>
        <View style={styles.flex1}><InputField control={control} name="tecidoPorosidadeExtradorso" label="Porosidade Extradorso" error={errors.tecidoPorosidadeExtradorso?.message} /></View>
      </View>

      <InputField control={control} name="parecerConformeFabricante" label="Parecer Conforme Fabricante" error={errors.parecerConformeFabricante?.message} />
      <InputField control={control} name="observacoes" label="Observações Gerais (opcional)" multiline numberOfLines={3} error={errors.observacoes?.message} />

      {/* PARECER GERAL */}
      <SectionHeader icon="shield-checkmark" title="6. Parecer Geral da Vela" />
      <Controller control={control} name="parecerGeral" render={({ field: { value, onChange } }) => (
        <SelectVertical options={Object.entries(PARECER_GERAL_LABELS) as [ParecerGeral, string][]} value={value} onChange={onChange} colors={PARECER_GERAL_COLORS} />
      )} />

      {/* BOTÃO SUBMIT */}
      <TouchableOpacity style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]} onPress={handleSubmit(handleFormSubmit)} disabled={isLoading} activeOpacity={0.8}>
        {isLoading ? <ActivityIndicator color="#fff" /> : (
          <>
            <Ionicons name="save-outline" size={20} color="#fff" />
            <Text style={styles.submitBtnText}>{submitLabel}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function SectionHeader({ icon, title }: { icon: keyof typeof Ionicons.glyphMap; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={18} color="#db2777" />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function InputField({ control, name, label, placeholder, error, multiline, numberOfLines, keyboardType, autoCapitalize }: any) {
  return (
    <Controller control={control} name={name} render={({ field: { value, onChange, onBlur } }) => (
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline, error ? styles.inputError : null]}
          value={value ?? ''} onChangeText={onChange} onBlur={onBlur} placeholder={placeholder} placeholderTextColor="#475569"
          multiline={multiline} numberOfLines={numberOfLines} keyboardType={keyboardType} autoCapitalize={autoCapitalize} textAlignVertical={multiline ? 'top' : 'auto'}
        />
        {error && <Text style={styles.errorText}>⚠ {error}</Text>}
      </View>
    )} />
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24, marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#1e2d45' },
  sectionTitle: { color: '#f1f5f9', fontSize: 16, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase' },
  subTitle: { color: '#94a3b8', fontSize: 13, fontWeight: '700', marginTop: 10, marginBottom: 12, textTransform: 'uppercase' },
  fieldGroup: { marginBottom: 12 },
  label: { color: '#94a3b8', fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase' },
  input: { backgroundColor: '#0d1526', borderWidth: 1, borderColor: '#1e2d45', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: '#f1f5f9', fontSize: 14 },
  inputMultiline: { minHeight: 80, paddingTop: 12 },
  obsInput: { paddingVertical: 8, marginTop: 8, fontSize: 13 },
  inputError: { borderColor: '#ef4444' },
  inputValid: { borderColor: '#22c55e55', backgroundColor: '#0d1f14' },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  errorText: { color: '#f87171', fontSize: 11, marginTop: 4 },
  row: { flexDirection: 'row', gap: 10 },
  flex1: { flex: 1 },
  gridChecksFull: { flexDirection: 'column', gap: 4 },
  selectRow: { flexDirection: 'row', gap: 6 },
  selectChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#1e2d45', backgroundColor: '#0d1526' },
  selectChipText: { color: '#64748b', fontSize: 13, fontWeight: '600' },
  verticalSelect: { gap: 8 },
  verticalOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d1526', borderWidth: 1, borderColor: '#1e2d45', borderRadius: 10, padding: 14, gap: 12 },
  verticalOptionText: { color: '#cbd5e1', fontSize: 13, fontWeight: '500', flex: 1 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#475569', alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  submitBtn: { backgroundColor: '#db2777', borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 24, marginBottom: 40, shadowColor: '#db2777', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },

  // State Picker Modal Styles
  statePickerBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12 },
  statePickerText: { color: '#f1f5f9', fontSize: 14, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 360, backgroundColor: '#131929', borderRadius: 16, borderWidth: 1, borderColor: '#1e2d45', overflow: 'hidden', maxHeight: 420 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1e2d45', backgroundColor: '#0d1526' },
  modalTitle: { color: '#f1f5f9', fontSize: 15, fontWeight: '700' },
  ufGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 16, justifyContent: 'center' },
  ufChip: { width: 56, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#1e2d45', backgroundColor: '#0d1526', alignItems: 'center', justifyContent: 'center' },
  ufChipSelected: { backgroundColor: '#db277722', borderColor: '#db2777' },
  ufChipText: { color: '#94a3b8', fontSize: 13, fontWeight: '700' },
  ufChipTextSelected: { color: '#db2777' },

  // Date Picker Styles
  datePickerBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  datePickerText: { color: '#f1f5f9', fontSize: 14, fontWeight: '600' },
  iosDatePickerContainer: { width: '100%', maxWidth: 360, backgroundColor: '#131929', borderRadius: 16, borderWidth: 1, borderColor: '#1e2d45', overflow: 'hidden' },
});
