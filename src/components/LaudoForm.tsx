import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useForm, Controller, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { PhotoCapture } from './PhotoCapture';
import { PhotoGallery } from './PhotoGallery';
import PorosityMapSelector from './PorosityMapSelector';
import { ParecerGeral, ParecerPorosimetro, StatusCheck, LaudoFormData } from '../types/laudo';
import { formatDateBR, formatMonthYearBR, toMonthValue } from '../utils/date';
import { notificar } from '../utils/feedback';
import {
  STATUS_CHECK_OPTIONS,
  PARECER_GERAL_LABELS,
  PARECER_GERAL_COLORS,
  PARECER_POROSIMETRO_LABELS,
  PARECER_POROSIMETRO_COLORS,
  ESTADOS_BRASIL,
} from '../types/constants';

// Schema de validação Zod
const laudoSchema = z.object({
  numeroLaudo: z.string().optional(),
  dataEmissao: z.string().optional(),

  // Proprietário
  nomeProprietario: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  email: z.string().optional(),

  // Vela
  fabricaModelo: z.string().optional(),
  numeroSerie: z.string().optional(),
  dataFabricacao: z.string().optional(),
  corBordoAtaque: z.string().optional(),
  corIntradorso: z.string().optional(),
  corExtradorso: z.string().optional(),

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
  linhasSimetria: z.enum(['Ok', 'Não Ok']),
  linhasSimetriaObs: z.string().optional(),
  linhasTrimagem: z.enum(['Ok', 'Não Ok']),
  linhasTrimagemObs: z.string().optional(),

  // Tecido
  tecidoCheckPerfil: z.enum(['Ok', 'Não Ok']),
  tecidoCheckPerfilObs: z.string().optional(),
  tecidoCheckIntradorso: z.enum(['Ok', 'Não Ok']),
  tecidoCheckIntradorsoObs: z.string().optional(),
  tecidoCheckBordoAtaque: z.enum(['Ok', 'Não Ok']),
  tecidoCheckBordoAtaqueObs: z.string().optional(),
  tecidoCheckExtradorso: z.enum(['Ok', 'Não Ok']),
  tecidoCheckExtradorsoObs: z.string().optional(),

  tecidoTesteResistencia: z.string().optional(),
  // Porosidade visual
  porosidade: z.any().optional(),

  parecerConformeFabricante: z.string().optional(),
  observacoes: z.string().optional(),

  // Geral e Foto
  parecerGeral: z.enum([
    'OTIMO',
    'MUITO_BOM',
    'USADO_BOM_ESTADO',
    'USADO_RAZOAVEL',
    'MUITO_USADO',
    'CONDENADO',
  ]),
  fotoUri: z.string().optional(),
  fotoSeloUri: z.string().optional(),
  fotosAdicionais: z
    .array(z.object({ uri: z.string(), descricao: z.string() }))
    .optional(),
});

type FormValues = z.infer<typeof laudoSchema>;

interface LaudoFormProps {
  defaultValues?: Partial<FormValues>;
  onSubmit: (data: LaudoFormData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

// Select Row para opções Ok/Não Ok + Observação Opcional (Design Segmented Pill)
function SelectRow<T extends string>({
  label,
  options,
  value,
  onChange,
  obsValue,
  onObsChange,
  error,
}: {
  label: string;
  options: [T, string][];
  value: T;
  onChange: (v: T) => void;
  obsValue?: string;
  onObsChange?: (v: string) => void;
  error?: string;
}) {
  return (
    <View style={styles.fieldGroup}>
      <View style={styles.selectRowHeader}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.segmentedContainer}>
          {options.map(([key, display]) => {
            const isSelected = value === key;
            const isOk = key === 'Ok';
            const activeBg = isOk ? '#dcfce7' : '#fee2e2';
            const activeBorder = isOk ? '#22c55e' : '#ef4444';
            const activeTextColor = isOk ? '#15803d' : '#b91c1c';
            const iconName = isOk ? 'checkmark-circle' : 'close-circle';

            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.segmentedChip,
                  isSelected && { backgroundColor: activeBg, borderColor: activeBorder },
                ]}
                onPress={() => onChange(key)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={iconName}
                  size={isOk ? 14 : 18}
                  color={isSelected ? activeTextColor : '#94a3b8'}
                />
                {/* O "Não Ok" é representado apenas pelo X vermelho, sem rótulo */}
                {isOk && (
                  <Text
                    style={[
                      styles.segmentedChipText,
                      isSelected && { color: activeTextColor, fontWeight: '700' },
                    ]}
                  >
                    {display}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {onObsChange && (
        <TextInput
          style={[styles.input, styles.obsInput]}
          value={obsValue ?? ''}
          onChangeText={onObsChange}
          placeholder="Observação da inspeção (opcional)"
          placeholderTextColor="#94a3b8"
        />
      )}
      {error && <Text style={styles.errorText}>⚠ {error}</Text>}
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
function StatePicker({
  value,
  onChange,
  error,
}: {
  value?: string;
  onChange: (val: string) => void;
  error?: string;
}) {
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

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
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
                    <Text style={[styles.ufChipText, isSelected && styles.ufChipTextSelected]}>
                      {uf}
                    </Text>
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
  return formatDateBR(isoOrStr);
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
  mode = 'date',
}: {
  label: string;
  value?: string;
  onChange: (val: string) => void;
  error?: string;
  /** 'month' guarda apenas AAAA-MM e exibe MM/AAAA */
  mode?: 'date' | 'month';
}) {
  const [show, setShow] = useState(false);
  const isMonth = mode === 'month';
  const selectedDate = parseDateString(value);

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }
    if (event.type === 'set' && date) {
      const full = formatDateForValue(date);
      onChange(isMonth ? full.slice(0, 7) : full);
    }
  };

  if (Platform.OS === 'web') {
    // Usamos createElement para burlar tipagem do react-native-web de forma limpa
    const React = require('react');
    const inputElement = React.createElement('input', {
      type: isMonth ? 'month' : 'date',
      value: isMonth ? toMonthValue(value) : value || '',
      onChange: (e: any) => onChange(e.target.value),
      style: {
        width: '100%',
        padding: '12px',
        borderRadius: '8px',
        border: `1px solid ${error ? '#ef4444' : '#e2e8f0'}`,
        fontSize: '15px',
        color: '#0f172a',
        backgroundColor: '#ffffff',
        outline: 'none',
        fontFamily: 'inherit',
        boxSizing: 'border-box'
      }
    });

    return (
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>{label}</Text>
        {inputElement}
        {error && <Text style={styles.errorText}>⚠ {error}</Text>}
      </View>
    );
  }

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
          {value
            ? isMonth
              ? formatMonthYearBR(value)
              : formatDateForDisplay(value)
            : isMonth
              ? 'MM/AAAA'
              : 'DD/MM/AAAA'}
        </Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>⚠ {error}</Text>}

      {show &&
        (Platform.OS === 'ios' ? (
          <Modal
            transparent={true}
            animationType="slide"
            visible={show}
            onRequestClose={() => setShow(false)}
          >
            <TouchableOpacity
              style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' }}
              activeOpacity={1}
              onPress={() => setShow(false)}
            >
              <View style={{ backgroundColor: 'white', paddingBottom: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 16 }}>
                  <TouchableOpacity onPress={() => setShow(false)}>
                    <Text style={{ color: '#db2777', fontWeight: '700', fontSize: 15 }}>
                      Concluir
                    </Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="spinner"
                  textColor="#1e293b"
                  onChange={handleChange}
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
        ))}
    </View>
  );
}

export function LaudoForm({
  defaultValues,
  onSubmit,
  isLoading,
  submitLabel = 'Salvar Laudo',
}: LaudoFormProps) {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(laudoSchema),
    defaultValues: {
      dataEmissao: defaultValues?.dataEmissao ?? new Date().toISOString().split('T')[0],
      dataFabricacao: defaultValues?.dataFabricacao ?? new Date().toISOString().slice(0, 7),
      cidade: defaultValues?.cidade ?? '',
      estado: defaultValues?.estado ?? 'RS',
      // Valores padrão recomendados
      linhasTirantes: 'Ok',
      linhasTirantesObs: '',
      linhasBatoquesArgolas: 'Ok',
      linhasBatoquesArgolasObs: '',
      linhasRoldanas: 'Ok',
      linhasRoldanasObs: '',
      linhasDistorcedor: 'Ok',
      linhasDistorcedorObs: '',
      linhasCarga: 'Ok',
      linhasCargaObs: '',
      linhasTroca: 'Ok',
      linhasTrocaObs: '',
      linhasSimetria: 'Ok',
      linhasSimetriaObs: '',
      linhasTrimagem: 'Ok',
      linhasTrimagemObs: '',

      tecidoCheckPerfil: 'Ok',
      tecidoCheckPerfilObs: '',
      tecidoCheckIntradorso: 'Ok',
      tecidoCheckIntradorsoObs: '',
      tecidoCheckBordoAtaque: 'Ok',
      tecidoCheckBordoAtaqueObs: '',
      tecidoCheckExtradorso: 'Ok',
      tecidoCheckExtradorsoObs: '',

      tecidoTesteResistencia: '',
      parecerConformeFabricante: '',
      observacoes: '',
      parecerGeral: 'OTIMO',
      ...defaultValues,
    },
  });

  const fotoUri = watch('fotoUri');
  const fotoSeloUri = watch('fotoSeloUri');

  /**
   * Sem isto o botão de salvar não faz nada quando a validação reprova: o
   * react-hook-form apenas preenche `errors`, e campos fora da tela deixam o
   * usuário sem pista nenhuma.
   */
  const handleFormInvalid = (erros: FieldErrors<FormValues>) => {
    const campos = Object.keys(erros);
    console.warn('Laudo não passou na validação. Campos com problema:', campos, erros);
    notificar(
      'Não foi possível salvar',
      `Revise os campos: ${campos.join(', ')}`
    );
  };

  const handleFormSubmit = async (data: FormValues) => {
    // Nenhum campo é obrigatório. Como o formulário pode entregar undefined,
    // normalizamos tudo para string vazia: assim não grava undefined no banco
    // nem imprime a palavra "undefined" no PDF.
    const parsedData: Record<string, any> = { ...data };

    // Campos que NÃO são texto: viram '' por engano e quebram quem os consome
    // (porosidade é objeto, fotosAdicionais é lista, e as fotos precisam
    // continuar undefined quando vazias para não renderizar imagem fantasma).
    const naoTexto = ['porosidade', 'fotosAdicionais', 'fotoUri', 'fotoSeloUri'];

    Object.keys(parsedData).forEach((key) => {
      if (naoTexto.includes(key)) return;
      if (parsedData[key] === undefined || parsedData[key] === null) {
        parsedData[key] = '';
      }
    });

    // Monta "Cidade - UF" sem deixar traço solto quando um dos dois está vazio
    parsedData.cidadeEstado = [parsedData.cidade, parsedData.estado]
      .filter((part) => part && String(part).trim() !== '')
      .join(' - ');

    await onSubmit(parsedData as LaudoFormData);
  };

  return (
    <View style={styles.container}>
      {/* IDENTIFICAÇÃO DO LAUDO E PROPRIETÁRIO */}
      <SectionHeader icon="person" title="1. Dados do Proprietário" />

      <View style={styles.row}>
        <View style={styles.flex1}>
          <InputField
            control={control}
            name="numeroLaudo"
            label="Número do Laudo"
            autoCapitalize="characters"
            error={errors.numeroLaudo?.message}
          />
        </View>
        <View style={styles.flex1}>
          <Controller
            control={control}
            name="dataEmissao"
            render={({ field: { value, onChange } }) => (
              <DatePickerField
                label="Data da Revisão"
                value={value}
                onChange={onChange}
                error={errors.dataEmissao?.message}
              />
            )}
          />
        </View>
      </View>

      <InputField
        control={control}
        name="nomeProprietario"
        label="Nome do Proprietário"
        error={errors.nomeProprietario?.message}
      />

      <View style={styles.row}>
        <View style={{ flex: 2.2 }}>
          <InputField
            control={control}
            name="cidade"
            label="Cidade"
            placeholder="Ex: Porto Alegre"
            error={errors.cidade?.message}
          />
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
          <InputField
            control={control}
            name="telefone"
            label="Telefone"
            keyboardType="numeric"
            error={errors.telefone?.message}
          />
        </View>
        <View style={styles.flex1}>
          <InputField
            control={control}
            name="email"
            label="E-mail"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email?.message}
          />
        </View>
      </View>
      <InputField
        control={control}
        name="endereco"
        label="Endereço"
        error={errors.endereco?.message}
      />

      {/* IDENTIFICAÇÃO DA VELA */}
      <SectionHeader icon="leaf" title="2. Identificação da Vela" />
      <InputField
        control={control}
        name="fabricaModelo"
        label="Fábrica / Modelo"
        error={errors.fabricaModelo?.message}
      />

      <View style={styles.row}>
        <View style={styles.flex1}>
          <InputField
            control={control}
            name="numeroSerie"
            label="Nº de Série"
            error={errors.numeroSerie?.message}
            autoCapitalize="characters"
          />
        </View>
        <View style={styles.flex1}>
          <Controller
            control={control}
            name="dataFabricacao"
            render={({ field: { value, onChange } }) => (
              <DatePickerField
                label="Data Fabricação"
                mode="month"
                value={value}
                onChange={onChange}
                error={errors.dataFabricacao?.message}
              />
            )}
          />
        </View>
      </View>

      <Text style={styles.subTitle}>Cores do Equipamento</Text>
      <InputField
        control={control}
        name="corBordoAtaque"
        label="Cor do Bordo de Ataque"
        error={errors.corBordoAtaque?.message}
        placeholder="Ex: Azul / Vermelho"
      />
      <View style={styles.row}>
        <View style={styles.flex1}>
          <InputField
            control={control}
            name="corIntradorso"
            label="Cor do Intradorso"
            error={errors.corIntradorso?.message}
            placeholder="Ex: Branco"
          />
        </View>
        <View style={styles.flex1}>
          <InputField
            control={control}
            name="corExtradorso"
            label="Cor do Extradorso"
            error={errors.corExtradorso?.message}
            placeholder="Ex: Cinza"
          />
        </View>
      </View>

      {/* FOTOS DA VELA */}
      <SectionHeader icon="camera" title="3. Identificação Visual (Fotos)" />

      <Text style={styles.subTitle}>Foto da Vela</Text>
      <PhotoCapture
        photoUri={fotoUri}
        onPhotoSelected={(uri) => setValue('fotoUri', uri)}
        onPhotoRemoved={() => setValue('fotoUri', undefined)}
      />

      <Text style={styles.subTitle}>Selo de Informações</Text>
      <PhotoCapture
        photoUri={fotoSeloUri}
        title="Adicionar Foto do Selo"
        subtitle="Etiqueta de identificação da vela"
        onPhotoSelected={(uri) => setValue('fotoSeloUri', uri)}
        onPhotoRemoved={() => setValue('fotoSeloUri', undefined)}
      />

      <Text style={styles.subTitle}>Fotos Complementares</Text>
      <Controller
        control={control}
        name="fotosAdicionais"
        render={({ field: { value, onChange } }) => (
          <PhotoGallery value={value} onChange={onChange} />
        )}
      />

      {/* CHECAGEM DE LINHAS */}
      <SectionHeader icon="analytics" title="4. Checagem de Linhas" />
      <View style={styles.gridChecksFull}>
        {[
          'Tirantes',
          'BatoquesArgolas',
          'Roldanas',
          'Distorcedor',
          'Carga',
          'Troca',
          'Simetria',
          'Trimagem',
        ].map((key) => (
          <Controller
            key={key}
            control={control}
            name={`linhas${key}` as any}
            render={({ field: { value, onChange } }) => (
              <Controller
                control={control}
                name={`linhas${key}Obs` as any}
                render={({ field: { value: obsValue, onChange: onObsChange } }) => (
                  <SelectRow
                    label={key.replace(/([A-Z])/g, ' $1').trim()}
                    options={STATUS_CHECK_OPTIONS}
                    value={value as StatusCheck}
                    onChange={onChange}
                    obsValue={obsValue}
                    onObsChange={onObsChange}
                  />
                )}
              />
            )}
          />
        ))}
      </View>

      {/* CHECAGEM DO TECIDO */}
      <SectionHeader icon="layers" title="5. Checagem do Tecido" />

      <Text style={styles.subTitle}>Visual</Text>
      <View style={styles.gridChecksFull}>
        {['Perfil', 'Intradorso', 'BordoAtaque', 'Extradorso'].map((key) => (
          <Controller
            key={key}
            control={control}
            name={`tecidoCheck${key}` as any}
            render={({ field: { value, onChange } }) => (
              <Controller
                control={control}
                name={`tecidoCheck${key}Obs` as any}
                render={({ field: { value: obsValue, onChange: onObsChange } }) => (
                  <SelectRow
                    label={key.replace(/([A-Z])/g, ' $1').trim()}
                    options={STATUS_CHECK_OPTIONS}
                    value={value as StatusCheck}
                    onChange={onChange}
                    obsValue={obsValue}
                    onObsChange={onObsChange}
                  />
                )}
              />
            )}
          />
        ))}
      </View>

      <Text style={styles.subTitle}>Testes & Resistência</Text>
      <View style={styles.row}>
        <View style={styles.flex1}>
          <InputField
            control={control}
            name="tecidoTesteResistencia"
            label="Teste de Resistência"
            placeholder="Ex: Correto"
            error={errors.tecidoTesteResistencia?.message}
          />
        </View>
      </View>
      
      <SectionHeader icon="analytics-outline" title="5. Medição de Porosidade" />
      <Controller
        control={control}
        name="porosidade"
        render={({ field: { value, onChange } }) => (
          <PorosityMapSelector value={value} onChange={onChange} />
        )}
      />
      

      <Text style={styles.subTitle}>Parecer do Fabricante (Porosímetro)</Text>
      <Controller
        control={control}
        name="parecerConformeFabricante"
        render={({ field: { value, onChange } }) => (
          <SelectVertical
            options={
              Object.entries(PARECER_POROSIMETRO_LABELS) as [ParecerPorosimetro, string][]
            }
            value={value as ParecerPorosimetro}
            onChange={onChange}
            colors={PARECER_POROSIMETRO_COLORS}
          />
        )}
      />
      <InputField
        control={control}
        name="observacoes"
        label="Observações Gerais (opcional)"
        multiline
        numberOfLines={3}
        error={errors.observacoes?.message}
      />

      {/* PARECER GERAL */}
      <SectionHeader icon="shield-checkmark" title="6. Parecer Geral da Vela" />
      <Controller
        control={control}
        name="parecerGeral"
        render={({ field: { value, onChange } }) => (
          <SelectVertical
            options={Object.entries(PARECER_GERAL_LABELS) as [ParecerGeral, string][]}
            value={value}
            onChange={onChange}
            colors={PARECER_GERAL_COLORS}
          />
        )}
      />

      {/* BOTÃO SUBMIT */}
      <TouchableOpacity
        style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
        onPress={handleSubmit(handleFormSubmit, handleFormInvalid)}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
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

function InputField({
  control,
  name,
  label,
  placeholder,
  error,
  multiline,
  numberOfLines,
  keyboardType,
  autoCapitalize,
}: any) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur } }) => (
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            style={[
              styles.input,
              multiline && styles.inputMultiline,
              error ? styles.inputError : null,
            ]}
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            placeholderTextColor="#475569"
            multiline={multiline}
            numberOfLines={numberOfLines}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            textAlignVertical={multiline ? 'top' : 'auto'}
          />
          {error && <Text style={styles.errorText}>⚠ {error}</Text>}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sectionTitle: {
    color: '#1e293b',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  subTitle: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  fieldGroup: { marginBottom: 12 },
  label: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '600',
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  inputMultiline: { minHeight: 85, paddingTop: 12 },
  obsInput: {
    paddingVertical: 10,
    marginTop: 6,
    fontSize: 13,
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
  },
  inputError: { borderColor: '#ef4444' },
  inputValid: { borderColor: '#22c55e55', backgroundColor: '#f0fdf4' },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  errorText: { color: '#ef4444', fontSize: 11, marginTop: 4, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 10 },
  flex1: { flex: 1 },
  gridChecksFull: { flexDirection: 'column', gap: 6 },
  selectRowHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  segmentedContainer: { flexDirection: 'row', gap: 6 },
  segmentedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentedChipText: { color: '#64748b', fontSize: 12, fontWeight: '600' },
  verticalSelect: { gap: 8 },
  verticalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    gap: 12,
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  verticalOptionText: { color: '#1e293b', fontSize: 14, fontWeight: '600', flex: 1 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: { width: 12, height: 12, borderRadius: 6 },
  submitBtn: {
    backgroundColor: '#db2777',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 28,
    marginBottom: 40,
    shadowColor: '#db2777',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },

  // State Picker Modal Styles
  statePickerBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  statePickerText: { color: '#1e293b', fontSize: 14, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  modalTitle: { color: '#1e293b', fontSize: 15, fontWeight: '700' },
  ufGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 16, justifyContent: 'center' },
  ufChip: {
    width: 56,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ufChipSelected: { backgroundColor: '#db277722', borderColor: '#db2777' },
  ufChipText: { color: '#64748b', fontSize: 13, fontWeight: '700' },
  ufChipTextSelected: { color: '#db2777' },

  // Date Picker Styles
  datePickerBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  datePickerText: { color: '#1e293b', fontSize: 14, fontWeight: '600' },
  iosDatePickerContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
});
