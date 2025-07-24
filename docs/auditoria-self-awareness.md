# Auditoria da Página Self-Awareness

## 📋 Visão Geral
A página Self-Awareness (`/self-awareness`) é um módulo completo de autoconhecimento que oferece ferramentas para reflexão pessoal, modo refúgio para momentos difíceis, diário reflexivo e análise de métricas pessoais.

## 🏗️ Estrutura de Arquivos

### Página Principal
- **Arquivo**: `app/self-awareness/page.tsx`
- **Função**: Server Component que gerencia autenticação e renderiza o dashboard
- **Dependências**:
  - `@/lib/supabase/server` - Cliente Supabase para SSR
  - `@/components/SelfAwarenessDashboard` - Componente principal

### Componente Principal
- **Arquivo**: `components/SelfAwarenessDashboard.tsx`
- **Tipo**: Client Component
- **Funcionalidades**:
  - Sistema de abas com 4 seções principais
  - Modo simplificado/completo alternável
  - Interface adaptativa para diferentes necessidades

## 🧩 Componentes Filhos

### 1. OrganizedNotes (`components/OrganizedNotes.tsx`)
**Funcionalidade**: Sistema de notas organizadas por categorias

**Features**:
- CRUD completo de notas de autoconhecimento
- Sistema de categorias com ícones e cores
- Tags personalizáveis
- Avaliação de humor (1-5)
- Busca por título, conteúdo e tags
- Interface responsiva com cards

**Stores/Estado**:
- `categories`: Array de categorias disponíveis
- `notes`: Array de notas do usuário
- `searchTerm`: Termo de busca atual
- `selectedCategory`: Categoria ativa
- `newNote`: Dados da nova nota sendo criada

### 2. RefugeMode (`components/RefugeMode.tsx`)
**Funcionalidade**: Espaço seguro para momentos de sobrecarga

**Features**:
- Sessões cronometradas de refúgio
- Configurações de acessibilidade (animações, contraste, texto)
- Estratégias de enfrentamento pré-definidas
- Avaliação de efetividade (1-5)
- Interface minimalista durante sessão ativa

**Stores/Estado**:
- `isRefugeModeActive`: Status da sessão ativa
- `currentSession`: Dados da sessão atual
- `refugeSettings`: Configurações de acessibilidade
- `sessionData`: Dados da sessão (trigger, estratégias, notas)
- `sessionTimer`: Cronômetro da sessão

### 3. ReflectiveJournal (`components/ReflectiveJournal.tsx`)
**Funcionalidade**: Diário com prompts de reflexão

**Features**:
- Prompts de reflexão categorizados
- Sistema de prompts aleatórios
- Criação de prompts personalizados
- Registro de humor antes/depois
- Sistema de insights e aprendizados
- Histórico de reflexões recentes

**Stores/Estado**:
- `prompts`: Array de prompts disponíveis
- `entries`: Array de entradas do diário
- `selectedPrompt`: Prompt selecionado
- `currentEntry`: Dados da entrada sendo criada
- `newInsight`: Novo insight sendo adicionado

### 4. SelfAnalysisTools (`components/SelfAnalysisTools.tsx`)
**Funcionalidade**: Ferramentas de análise e métricas pessoais

**Features**:
- Registro de métricas personalizadas (1-10)
- 8 tipos de métricas pré-definidas (humor, energia, estresse, etc.)
- Análise de tendências e médias
- Filtros por período (semana, mês, trimestre)
- Visualização com barras de progresso
- Resumo analítico com tendências

**Stores/Estado**:
- `metrics`: Array de métricas registradas
- `newMetric`: Dados da nova métrica
- `selectedPeriod`: Período de análise
- `selectedMetricType`: Tipo de métrica filtrada

## 🗄️ Stores e Gerenciamento de Estado

### Cliente Supabase
- **Browser**: `createClient()` de `@/lib/supabase/client`
- **Server**: `createClient()` de `@/lib/supabase/server`
- **Configuração**: Utiliza variáveis de ambiente para URL e chave anônima

### Tabelas do Banco de Dados
1. **self_awareness_categories**
   - Categorias para organização de notas
   - Campos: id, user_id, name, description, color, icon

2. **self_awareness_notes**
   - Notas de autoconhecimento
   - Campos: id, user_id, category_id, title, content, tags, mood_rating

3. **refuge_sessions**
   - Sessões do modo refúgio
   - Campos: id, user_id, trigger_description, coping_strategies, duration_minutes, effectiveness_rating

4. **reflection_prompts**
   - Prompts para reflexão
   - Campos: id, user_id, prompt_text, category, is_system_prompt, usage_count

5. **reflection_entries**
   - Entradas do diário reflexivo
   - Campos: id, user_id, prompt_id, entry_text, mood_before, mood_after, insights

6. **self_analysis_metrics**
   - Métricas de autoanálise
   - Campos: id, user_id, metric_name, metric_value, metric_type, recorded_date, notes

## 🔧 Hooks Utilizados

### Hooks Nativos do React
- `useState`: Gerenciamento de estado local
- `useEffect`: Efeitos colaterais e ciclo de vida

### Hooks Personalizados
- `useToast`: Sistema de notificações (shadcn/ui)
- `useUser`: Hook personalizado para gerenciamento de usuário (não utilizado diretamente)

## 🎨 Componentes UI (shadcn/ui)
- `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger`
- `Card`, `CardContent`, `CardHeader`, `CardTitle`
- `Button`, `Input`, `Textarea`, `Label`
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogTrigger`
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`
- `Badge`, `Switch`
- Ícones do Lucide React

## 🔐 Autenticação e Segurança

### Proteção de Rota
- Verificação de usuário autenticado no Server Component
- Redirecionamento para `/auth/login` se não autenticado
- RLS (Row Level Security) implícito via Supabase

### Validação de Dados
- Validação de campos obrigatórios antes de salvar
- Sanitização de inputs
- Tratamento de erros com toast notifications

## 📊 Lógica de Funcionamento

### Fluxo Principal
1. **Autenticação**: Verificação no servidor
2. **Inicialização**: Carregamento de dados do usuário
3. **Interface**: Renderização do dashboard com abas
4. **Interação**: CRUD operations com feedback visual
5. **Persistência**: Sincronização com Supabase

### Funcionalidades Especiais

#### Modo Simplificado
- Interface reduzida para usuários com necessidades especiais
- Cards grandes com ícones claros
- Navegação simplificada

#### Sistema de Categorias
- Categorias dinâmicas com cores e ícones
- Organização visual das notas
- Filtros automáticos por categoria

#### Análise de Tendências
- Cálculo de médias por tipo de métrica
- Detecção de tendências (subindo/descendo/estável)
- Visualização com indicadores visuais

#### Timer de Sessão
- Cronômetro em tempo real para sessões de refúgio
- Formatação MM:SS
- Persistência da duração no banco

## 🚀 Performance e Otimizações

### Client-Side
- Componentes marcados como "use client" apenas quando necessário
- Estado local para interações rápidas
- Debounce implícito em buscas

### Server-Side
- Server Components para autenticação
- SSR para carregamento inicial
- Queries otimizadas com select específicos

### Banco de Dados
- Relacionamentos com joins eficientes
- Índices implícitos por user_id
- Ordenação no banco (order by)

## 🎯 Pontos de Melhoria Identificados

1. **Paginação**: Implementar para listas grandes
2. **Cache**: Adicionar cache local para dados frequentes
3. **Offline**: Suporte a funcionalidades offline
4. **Exportação**: Permitir export de dados
5. **Gráficos**: Visualizações mais avançadas para métricas
6. **Notificações**: Lembretes para reflexões regulares
7. **Backup**: Sistema de backup automático
8. **Acessibilidade**: Melhorar suporte a screen readers

## 📱 Responsividade
- Grid responsivo (1 coluna em mobile, 2-3 em desktop)
- Componentes adaptáveis
- Breakpoints do Tailwind CSS
- Interface touch-friendly

## 🔍 Monitoramento e Debug
- Console logs para debugging
- Error boundaries implícitos
- Toast notifications para feedback
- Validação de dados em tempo real

---

**Data da Auditoria**: $(date)
**Versão Analisada**: Atual
**Status**: ✅ Funcional e bem estruturado