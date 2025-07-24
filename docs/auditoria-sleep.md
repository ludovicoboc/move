# Auditoria da Página Sleep

## 📋 Resumo Executivo
A página Sleep é um módulo completo de gestão do sono que oferece funcionalidades para registro, visualização, lembretes e dicas de higiene do sono. O sistema é projetado especificamente para pessoas neurodivergentes, com foco na autorregulação sensorial e melhoria do funcionamento cognitivo.

## 🏗️ Estrutura da Página

### Arquivo Principal
- **Localização**: `app/sleep/page.tsx`
- **Tipo**: Server Component (Next.js 13+ App Router)
- **Responsabilidades**:
  - Autenticação do usuário via Supabase
  - Redirecionamento para login se não autenticado
  - Renderização do componente principal SleepDashboard

### Componente Principal
- **SleepDashboard** (`components/SleepDashboard.tsx`)
  - Client Component com sistema de abas
  - 4 abas principais: Registrar Sono, Visualizar Sono, Lembretes, Dicas
  - Utiliza AppLayout para layout consistente

## 🧩 Componentes Utilizados

### 1. SleepRecorder (`components/SleepRecorder.tsx`)
**Funcionalidades:**
- Registro detalhado de dados de sono
- Formulário com 15+ campos de dados
- Visualização de registros recentes (últimos 7 dias)
- Validação e atualização de registros existentes

**Campos de Registro:**
- Data do sono
- Horário de dormir e acordar
- Qualidade do sono (1-5 estrelas)
- Tempo para adormecer (latência)
- Número de despertares
- Avaliação do ambiente (1-5)
- Nível de estresse (1-5)
- Consumo de cafeína (boolean)
- Exercício antes de dormir (boolean)
- Tempo de tela antes de dormir (minutos)
- Notas opcionais

**Estados Gerenciados:**
- `recentRecords`: Array de registros recentes
- `loading`: Estado de carregamento
- `showForm`: Controle de exibição do formulário
- `formData`: Dados do formulário atual

### 2. SleepVisualizer (`components/SleepVisualizer.tsx`)
**Funcionalidades:**
- Visualização semanal de dados de sono
- Navegação entre semanas
- Cálculo de estatísticas detalhadas
- Calendário visual com indicadores de qualidade

**Métricas Calculadas:**
- Duração média de sono
- Qualidade média
- Horários médios de dormir/acordar
- Eficiência do sono
- Score de consistência
- Melhor e pior dia da semana

**Estados Gerenciados:**
- `currentWeek`: Semana atual sendo visualizada
- `weeklyData`: Dados da semana (array de 7 dias)
- `weekStats`: Estatísticas calculadas da semana
- `loading`: Estado de carregamento

### 3. SleepReminders (`components/SleepReminders.tsx`)
**Funcionalidades:**
- Criação de lembretes para dormir e acordar
- Configuração de dias da semana
- Ativação/desativação de lembretes
- Edição e exclusão de lembretes

**Tipos de Lembrete:**
- `bedtime`: Lembretes para hora de dormir
- `wake_time`: Lembretes para hora de acordar

**Estados Gerenciados:**
- `reminders`: Array de lembretes do usuário
- `loading`: Estado de carregamento
- `showForm`: Controle de exibição do formulário
- `editingReminder`: Lembrete sendo editado
- `formData`: Dados do formulário de lembrete

### 4. SleepHygieneTips (`components/SleepHygieneTips.tsx`)
**Funcionalidades:**
- Exibição de dicas de higiene do sono
- Sistema de pontuação personalizada
- Dicas personalizadas baseadas em padrões
- Filtros por categoria

**Categorias de Dicas:**
- `environment`: Ambiente de sono
- `routine`: Rotina de sono
- `lifestyle`: Estilo de vida
- `diet`: Alimentação

**Sistema de Pontuação:**
- Qualidade (0-25 pontos)
- Duração (0-25 pontos)
- Consistência (0-25 pontos)
- Hábitos (0-25 pontos)
- **Total**: 0-100 pontos

**Estados Gerenciados:**
- `tips`: Array de dicas gerais
- `recentRecords`: Registros para análise
- `personalizedTips`: Dicas personalizadas
- `sleepScore`: Pontuação calculada
- `selectedCategory`: Filtro de categoria ativo

## 🎣 Hooks Utilizados

### Hooks React Nativos
- **`useState`**: Gerenciamento de estado local em todos os componentes
- **`useEffect`**: Carregamento de dados e side effects

### Hooks Customizados do Projeto
- **Não utiliza hooks customizados específicos**
- Utiliza diretamente o cliente Supabase em cada componente

### Stores/Context
- **Não utiliza stores globais**
- Cada componente gerencia seu próprio estado
- Autenticação gerenciada via Supabase Auth

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### 1. `sleep_records`
```sql
CREATE TABLE sleep_records (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  sleep_date DATE NOT NULL,
  bedtime TIME NOT NULL,
  wake_time TIME NOT NULL,
  sleep_duration_minutes INTEGER GENERATED ALWAYS AS (...) STORED,
  sleep_quality INTEGER CHECK (1-5),
  notes TEXT,
  sleep_latency_minutes INTEGER,
  wake_up_count INTEGER DEFAULT 0,
  sleep_environment_rating INTEGER CHECK (1-5),
  stress_level INTEGER CHECK (1-5),
  caffeine_intake BOOLEAN DEFAULT FALSE,
  exercise_before_sleep BOOLEAN DEFAULT FALSE,
  screen_time_before_sleep INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

#### 2. `sleep_reminders`
```sql
CREATE TABLE sleep_reminders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  reminder_type TEXT CHECK ('bedtime', 'wake_time'),
  time TIME NOT NULL,
  days_of_week INTEGER[] NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  title TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

#### 3. `sleep_goals`
```sql
CREATE TABLE sleep_goals (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  target_bedtime TIME NOT NULL,
  target_wake_time TIME NOT NULL,
  target_duration_hours DECIMAL(3,1) NOT NULL,
  target_quality_rating INTEGER CHECK (1-5),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

#### 4. `sleep_hygiene_tips`
```sql
CREATE TABLE sleep_hygiene_tips (
  id UUID PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE
);
```

### Políticas de Segurança (RLS)
- **Row Level Security** habilitado em todas as tabelas
- Usuários só podem acessar seus próprios dados
- Políticas para SELECT, INSERT, UPDATE, DELETE

### Índices de Performance
- `idx_sleep_records_date`: Otimização por data
- `idx_sleep_records_user_date`: Otimização por usuário e data
- `idx_sleep_reminders_active`: Otimização para lembretes ativos

## 📊 Tipos TypeScript

### Interfaces Principais (`lib/sleep-types.ts`)

```typescript
interface SleepRecord {
  id: string
  user_id: string
  sleep_date: string
  bedtime: string
  wake_time: string
  sleep_duration_minutes: number
  sleep_quality: number
  notes?: string
  sleep_latency_minutes?: number
  wake_up_count: number
  sleep_environment_rating?: number
  stress_level?: number
  caffeine_intake: boolean
  exercise_before_sleep: boolean
  screen_time_before_sleep: number
  created_at: string
  updated_at: string
}

interface SleepReminder {
  id: string
  user_id: string
  reminder_type: "bedtime" | "wake_time"
  time: string
  days_of_week: number[]
  active: boolean
  title?: string
  message?: string
  created_at: string
  updated_at: string
}

interface SleepStats {
  averageDuration: number
  averageQuality: number
  averageBedtime: string
  averageWakeTime: string
  totalRecords: number
  bestDay?: SleepRecord
  worstDay?: SleepRecord
  sleepEfficiency: number
  consistencyScore: number
}

interface WeeklyData {
  date: string
  dayName: string
  sleepRecord?: SleepRecord
  hasData: boolean
}
```

## 🔄 Fluxo de Dados

### 1. Carregamento Inicial
1. Página verifica autenticação
2. SleepDashboard renderiza com aba "register" ativa
3. Cada componente carrega seus dados via useEffect
4. Estados de loading são gerenciados individualmente

### 2. Registro de Sono
1. Usuário preenche formulário no SleepRecorder
2. Validação de dados no frontend
3. Verificação de registro existente para a data
4. INSERT ou UPDATE na tabela sleep_records
5. Recarga dos dados recentes

### 3. Visualização de Dados
1. SleepVisualizer busca dados da semana atual
2. Cálculo de estatísticas em tempo real
3. Navegação entre semanas recarrega dados
4. Renderização de calendário visual

### 4. Gerenciamento de Lembretes
1. CRUD completo de lembretes
2. Validação de dias da semana
3. Toggle de ativação/desativação
4. Separação por tipo (dormir/acordar)

## 🎨 Interface e UX

### Design System
- **Componentes UI**: Shadcn/ui (Radix UI + Tailwind)
- **Ícones**: Lucide React
- **Cores**: Sistema de cores semântico
  - Verde: Qualidade boa (≥4)
  - Amarelo: Qualidade média (3)
  - Vermelho: Qualidade ruim (<3)

### Acessibilidade
- Componentes acessíveis do Radix UI
- Navegação por teclado
- Labels apropriados
- Contraste adequado

### Responsividade
- Grid responsivo (1-4 colunas)
- Componentes adaptáveis
- Mobile-first approach

## 🔧 Lógica de Negócio

### Cálculo de Duração
- **Campo calculado** no banco de dados
- Considera mudança de dia (ex: 23:00 às 07:00)
- Armazenado em minutos para precisão

### Sistema de Pontuação
- **Qualidade**: Baseada na média de qualidade (1-5)
- **Duração**: Otimizada para 7-9 horas
- **Consistência**: Variância dos horários de dormir
- **Hábitos**: Fatores como cafeína, exercício, tela

### Dicas Personalizadas
- **Análise de padrões** dos últimos 7 dias
- **Geração automática** de dicas específicas
- **Priorização** baseada em problemas identificados

### Validações
- **Frontend**: Validação de formulários
- **Backend**: Constraints no banco de dados
- **Tipos**: TypeScript para type safety

## 🚀 Performance

### Otimizações
- **Índices de banco**: Consultas otimizadas
- **Limit de registros**: Carregamento paginado
- **Estados de loading**: UX responsiva
- **Cálculos client-side**: Reduz carga do servidor

### Possíveis Melhorias
- **React Query**: Cache e sincronização
- **Virtualization**: Para listas grandes
- **Service Worker**: Cache offline
- **Debounce**: Em formulários

## 🔒 Segurança

### Autenticação
- **Supabase Auth**: Sistema robusto
- **Server-side**: Verificação no servidor
- **Redirecionamento**: Para login se não autenticado

### Autorização
- **Row Level Security**: Isolamento de dados
- **Políticas específicas**: Por operação
- **Validação dupla**: Frontend + Backend

## 📈 Métricas e Analytics

### Dados Coletados
- **Padrões de sono**: Duração, qualidade, horários
- **Fatores externos**: Cafeína, exercício, tela
- **Ambiente**: Avaliação do quarto
- **Bem-estar**: Estresse, humor

### Insights Gerados
- **Tendências semanais**: Melhores/piores dias
- **Correlações**: Fatores vs qualidade
- **Recomendações**: Dicas personalizadas
- **Progresso**: Score de sono

## 🎯 Público-Alvo

### Foco Neurodivergente
- **Autorregulação sensorial**: Ambiente de sono
- **Rotinas estruturadas**: Horários regulares
- **Feedback visual**: Gráficos e indicadores
- **Personalização**: Dicas adaptadas

### Funcionalidades Específicas
- **Registro detalhado**: Múltiplos fatores
- **Visualização clara**: Calendário colorido
- **Lembretes visuais**: Não dependem de notificações
- **Educação**: Dicas de higiene do sono

## 🔮 Roadmap e Melhorias

### Funcionalidades Futuras
- **Integração com wearables**: Dados automáticos
- **Análise de tendências**: Relatórios mensais
- **Metas personalizadas**: Sistema de goals
- **Exportação de dados**: PDF/CSV

### Melhorias Técnicas
- **Offline support**: PWA capabilities
- **Real-time sync**: WebSockets
- **Advanced analytics**: Machine learning
- **API externa**: Integração com outros apps

## 📝 Conclusão

O módulo Sleep é uma implementação robusta e completa para gestão do sono, especialmente adequada para pessoas neurodivergentes. A arquitetura é bem estruturada, com separação clara de responsabilidades, tipos bem definidos e foco na experiência do usuário. O sistema oferece funcionalidades abrangentes desde registro básico até análises avançadas e recomendações personalizadas.

### Pontos Fortes
- ✅ Arquitetura bem estruturada
- ✅ Tipos TypeScript completos
- ✅ Segurança robusta (RLS)
- ✅ Interface intuitiva
- ✅ Funcionalidades abrangentes
- ✅ Foco no público neurodivergente

### Áreas de Melhoria
- 🔄 Implementar cache/React Query
- 🔄 Adicionar testes automatizados
- 🔄 Melhorar performance com virtualization
- 🔄 Implementar PWA capabilities
- 🔄 Adicionar mais validações

---

**Data da Auditoria**: $(date)
**Versão Analisada**: Current
**Auditor**: AI Assistant