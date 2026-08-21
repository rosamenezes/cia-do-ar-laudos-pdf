# Cia do Ar - Sistema Especializado de Laudos Técnicos 

Um sistema de missão crítica (PWA e Mobile) desenvolvido com **Expo** e **React Native** para a digitalização completa do processo de criação, gestão e geração de laudos técnicos para inspeção de parapentes. Este aplicativo transforma processos complexos baseados em papel em um fluxo totalmente digital e sincronizado na nuvem, culminando em relatórios PDF ricos em detalhes e altamente profissionais, prontos para serem enviados aos pilotos.

---

## Arquitetura e Principais Funcionalidades

### 1. Autenticação e Segurança (Firebase Auth)
O sistema é protegido nativamente com integração ao **Firebase Authentication**.
- Login de inspetores/técnicos por **E-mail e Senha**.
- Sessões persistentes controladas pelo Context API (`AuthContext`), bloqueando o acesso de usuários não autenticados através de roteamento protegido no `_layout.tsx` do Expo Router.

### 2. Sincronização em Tempo Real (Cloud Firestore)
Todos os dados das inspeções são armazenados de forma estruturada no **Firebase Firestore**.
- **Coleção de Laudos**: O módulo `/src/services/database.ts` gerencia o CRUD completo.
- Listagem otimizada: Carrega imediatamente os laudos criados, ordenados por data de criação.

### 3. Upload de Evidências (Firebase Cloud Storage & ImagePicker)
- **Captura Integrada**: Ao preencher a ficha, o técnico pode tirar uma foto da vela com a câmera do dispositivo ou fazer o upload direto da galeria.
- **Armazenamento**: O `imageService.ts` cuida da conversão, compressão (para economia de banda e storage) e codificação antes de acionar a camada que fará o upload das imagens para o **Firebase Storage**, salvando apenas as URLs públicas no documento principal.

### 4. Gráfico Interativo de Porosidade (React Native SVG)
Foi construído um componente 100% vetorial e interativo (`PorosityMapSelector.tsx`) para o lançamento dos dados mais cruciais: a medição da porosidade do tecido.
- Em vez de campos de texto genéricos, o usuário tem a visão do **Extradorso e Intradorso** da vela projetados na tela.
- O inspetor "clica" nos pontos (Células, Bordo de Ataque, Orelhas) onde o teste foi executado, habilitando as caixas exatas para salvar os valores em segundos.
- Esse SVG foi estilizado (linhas de células, sombreamento dinâmico e formato fiel de velame).

### 5. Geração de PDF Profissional Nativamente
A funcionalidade mais complexa e importante: exportar o trabalho para um PDF formatado em A4.
- **Template Dinâmico HTML (`laudoTemplate.ts`)**: Renderiza variáveis, logos, as imagens do cloud storage, e injeta as regras de quebra de página (CSS Paged Media).
- **Injeção SVG no Relatório**: A medição da porosidade injeta o próprio gráfico desenhado na tela diretamente no PDF impresso, lado a lado com uma tabela dinâmica dos resultados de porosidade.
- **Exportação Web e iOS (`pdfGenerator.ts`)**: Mapeia a arquitetura nativa. Em web/PWA é usado o poderoso e seguro `window.print()` configurado perfeitamente para renderizar Iframes sem sujar o layout base. Em dispositivos mobile puros (iOS), utiliza o `<WebView>` combinado ao Safari Native Share Sheet, entregando o arquivo pelo WhatsApp em 2 toques.

### 6. Design System: Força e Legibilidade (Light Mode Fixo)
O sistema implementa regras estritas de UI/UX visando claridade em ambientes externos (sob a luz do sol nas oficinas).
- **Desativação Completa do Dark Mode**: O sistema ignora a preferência de esquema de cores do OS do aparelho e força o modo claro (branco absoluto, tons neutros cinzas `#f8fafc` e destaques em Rosa Choque/Magenta corporativos).
- Componentes padronizados: Componente customizado do seletor "Ok / Não Ok", badges arredondados visuais para aprovação (`STATUS_CHECK_OPTIONS`), e Dropdowns modernos para "Estado (UF)" e "Parecer Geral".

### 7. Validação Estrita (Zod + React Hook Form)
O motor do fluxo. Um laudo incompleto nunca é gerado.
- Formulários com dezenas de campos complexos validados usando o **Zod Schema** dentro do `LaudoForm.tsx`.

---

##  Stack Tecnológica Completa

| Categoria | Tecnologias Empregadas |
| :--- | :--- |
| **Framework Base** | **Expo SDK** & **React Native** (Arquitetura PWA-first e Mobile) |
| **Roteamento** | **Expo Router** (File-based routing nativo) |
| **Linguagem** | **TypeScript** (Strict mode e Safety Interfaces em `/types/laudo.ts`) |
| **Backend as a Service** | **Firebase** (Firestore, Storage, Authentication) |
| **Formulários** | **React Hook Form** integrado nativamente |
| **Validação** | **Zod** (Data schema parsing) |
| **Gráficos e Print** | **react-native-svg**, **CSS Print Media Queries**, **Expo Print** |

---

## Visão Detalhada da Árvore do Projeto

```text
CiadoArLaudos/
├── app/                        # Expo Router (Páginas do App)
│   ├── _layout.tsx             # Entrypoint Global, Proteção de Rotas e ThemeProvider
│   ├── index.tsx               # Tela 01: Login (Auth gate)
│   ├── (tabs)/                 
│   │   ├── laudos.tsx          # Tela 02: Dashboard e listagem dos documentos
│   │   └── perfil.tsx          # Tela 03: Conta e controle de sessão
│   └── laudo/                  
│       ├── novo.tsx            # Tela 04: Motor de Criação (Integra o LaudoForm)
│       ├── [id].tsx            # Tela 05: Visualização final de Leitura (Ready for PDF)
│       └── [id]/editar.tsx     # Tela 06: Edição e sobreposição (SetDoc/Merge)
├── src/
│   ├── components/             # Building Blocks da UI
│   │   ├── LaudoForm.tsx       # Monster Component de Entrada de Dados (RHF + Zod)
│   │   ├── PorosityMapSelector # Componente Vetorial do Mapa de Células
│   │   └── PhotoCapture.tsx    # Abstração de Câmera/Galeria
│   ├── contexts/               # Controle de Estado e Context API
│   │   ├── AuthContext.tsx     # Session Token e User Watcher
│   │   └── ThemeContext.tsx    # Controle de Design System Fixo
│   ├── services/               # Ponte de Comunicação com Backend e Hardware
│   │   ├── firebaseConfig.ts   # Chaves de Ignição e Inicialização da GCP
│   │   ├── database.ts         # Querying Layer (Firestore)
│   │   ├── authService.ts      # Authentication Layer (Login, Logout)
│   │   ├── imageService.ts     # Processamento, Compressão 50% JPG, Base64 e Storage
│   │   └── pdfGenerator.ts     # Camada de Injeção de Iframe e Chamada de Impressora Nativa
│   ├── templates/
│   │   └── laudoTemplate.ts    # Template Literal (CSS puro e HTML 5, Watermark via B64)
│   └── types/
│       ├── laudo.ts            # Tipagens globais do negócio (LaudoParapente, Parecer, Mapas)
│       └── constants.ts        # Enums base do banco de dados e cores dinâmicas
├── assets/                     # Splash screens, logos corporativas
└── package.json                # Gerenciador do Node.js
```

---

## Guia de Inicialização do Ambiente

1. **Faça o clone do repositório** e acesse a pasta raiz:
   ```bash
   git clone <repo_url>
   cd CiadoArLaudos
   ```

2. **Instalação Profunda das Dependências**:
   O Expo exige o download de binários precompilados do SDK.
   ```bash
   npm install
   ```

3. **Chaves Mestras do Firebase (Variáveis de Ambiente)**:
   Sem isto o Auth e o Database irão falhar. Crie um `.env.development` no root da aplicação:
   ```env
   # Substitua pelos dados do seu Firebase Console > Configurações do Projeto
   EXPO_PUBLIC_FIREBASE_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="ciadoarlaudos-xyz.firebaseapp.com"
   EXPO_PUBLIC_FIREBASE_PROJECT_ID="ciadoarlaudos-xyz"
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET="ciadoarlaudos-xyz.appspot.com"
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="1234567890"
   EXPO_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abcdefghij123456"
   ```

4. **Acendendo a turbina do Servidor Expo (Metro Bundler)**:
   A abordagem central é a arquitetura híbrida focada em Web. O flag `--web` inicia o build instantâneo da PWA no localhost.
   ```bash
   npx expo start --web --clear
   ```

---

## Deploy Contínuo (Firebase Hosting PWA)

A entrega da aplicação é focada primeiramente na web pela facilidade do suporte nativo da api global Print. Para subir atualizações para os técnicos, compile o código estático utilizando o Metro para Web e suba via Hosting:

```bash
# 1. Empacotar o build estático otimizado
npx expo export -p web

# 2. Transmitir o build para o CDN Global do Firebase
firebase deploy --only hosting
```
