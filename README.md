# LaudoVoo

App mobile para geração de laudos de equipamentos de voo em PDF.

## Stack

- React Native + Expo
- TypeScript
- Expo Router (navegação file-based)
- react-hook-form + zod (formulários e validação)
- expo-sqlite (armazenamento local)
- expo-print + expo-sharing (geração e compartilhamento de PDF)
- expo-image-picker (câmera e galeria)

## Estrutura

```
app/
├── _layout.tsx           # Root layout (tema dark)
├── (tabs)/
│   ├── _layout.tsx       # Tab navigator
│   ├── index.tsx         # Lista de laudos
│   └── novo.tsx          # Formulário novo laudo
└── laudo/
    └── [id].tsx          # Detalhes e PDF do laudo

src/
├── types/
│   ├── laudo.ts          # Interfaces TypeScript
│   └── constants.ts      # Labels e cores dos enums
├── services/
│   ├── database.ts       # SQLite CRUD
│   ├── imageService.ts   # Câmera e galeria
│   └── pdfGenerator.ts   # Geração de PDF
├── templates/
│   └── laudoTemplate.ts  # HTML do laudo para PDF
└── components/
    ├── LaudoForm.tsx      # Formulário completo
    ├── LaudoCard.tsx      # Card na listagem
    └── PhotoCapture.tsx   # Componente de foto
```

## Comandos

```bash
# Instalar dependências
npm install --legacy-peer-deps

# Iniciar em modo desenvolvimento
npm start

# Iniciar no iOS (Simulator)
npm run ios

# Iniciar no Android (Emulator)
npm run android
```

## Campos do Laudo

- **Identificação**: Número, data de emissão, local de inspeção
- **Equipamento**: Tipo, fabricante, modelo, número de série, ano, matrícula
- **Inspeção**: Tipo de manutenção, última/próxima inspeção, horas de voo
- **Resultado**: Aprovado / Reprovado / Aprovado com Ressalvas
- **Técnico**: Nome e habilitação (CREA/ANAC)
- **Foto**: Câmera ou galeria

## Build para Produção

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Configurar EAS
eas build:configure

# Build para iOS
eas build --platform ios

# Build para Android
eas build --platform android
```
