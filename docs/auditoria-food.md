# Auditoria da Página Food

## Visão Geral
A página `/food` é responsável pelo gerenciamento de alimentação e nutrição do usuário, oferecendo funcionalidades de planejamento de refeições, registro de consumo e controle de hidratação.

## Estrutura da Página

### Arquivo Principal
- **Localização**: `app/food/page.tsx`
- **Tipo**: Server Component (async)
- **Responsabilidades**:
  - Autenticação do usuário via Supabase
  - Redirecionamento para login se não autenticado
  - Renderização do componente principal `NutritionDashboard`

### Componente Principal
- **Componente**: `NutritionDashboard`
- **Localização**: `components/NutritionDashboard.tsx`
- **Tipo**: Client Component
- **Layout**: Grid responsivo com 3 seções principais

## Componentes Utilizados

### 1. MealPlanner
- **Arquivo**: `components/MealPlanner.tsx`
- **Funcionalidades**:
  - Planejamento de refeições por horário
  - Adição de novas refeições com horário, nome e descrição
  - Exclusão de refeições planejadas
  - Visualização em cards organizados por horário
- **Estados**:
  - `mealPlans`: Array de planos de refeição
  - `loading`: Estado de carregamento
  - `showAddForm`: Controle de exibição do formulário
  - `newMeal`: Dados da nova refeição

### 2. MealLog
- **Arquivo**: `components/MealLog.tsx`
- **Funcionalidades**:
  - Registro de refeições consumidas
  - Controle de calorias (opcional)
  - Histórico de refeições do dia
  - Exclusão de registros
- **Estados**:
  - `mealLogs`: Array de registros de refeição
  - `loading`: Estado de carregamento
  - `showAddForm`: Controle de exibição do formulário
  - `newLog`: Dados do novo registro

### 3. HydrationReminder
- **Arquivo**: `components/HydrationReminder.tsx`
- **Funcionalidades**:
  - Controle de hidratação diária
  - Meta de copos de água (padrão: 8 copos)
  - Visualização em progresso e ícones
  - Notificações quando meta é atingida
  - Dicas de hidratação
- **Estados**:
  - `hydrationLog`: Registro de hidratação do dia
  - `loading`: Estado de carregamento

## Stores/Banco de Dados

### Tabelas Supabase Utilizadas

#### 1. meal_plans
- **Campos**:
  - `id`: Identificador único
  - `user_id`: ID do usuário
  - `horario`: Horário da refeição (TIME)
  - `refeicao`: Nome da refeição
  - `descricao`: Descrição opcional
  - `data`: Data do plano (DATE)
  - `created_at`: Data de criação
  - `updated_at`: Data de atualização

#### 2. meal_logs
- **Campos**:
  - `id`: Identificador único
  - `user_id`: ID do usuário
  - `horario`: Horário da refeição (TIME)
  - `refeicao`: Nome da refeição
  - `descricao`: Descrição opcional
  - `calorias`: Quantidade de calorias (NUMBER, opcional)
  - `data`: Data do registro (DATE)
  - `created_at`: Data de criação
  - `updated_at`: Data de atualização

#### 3. hydration_logs
- **Campos**:
  - `id`: Identificador único
  - `user_id`: ID do usuário
  - `copos_consumidos`: Quantidade de copos consumidos
  - `meta_copos`: Meta de copos diários
  - `data`: Data do registro (DATE)
  - `created_at`: Data de criação
  - `updated_at`: Data de atualização

## Hooks Utilizados

### Hooks React Nativos
- `useState`: Gerenciamento de estado local
- `useEffect`: Efeitos colaterais e carregamento de dados

### Hooks Customizados
- **use-user.ts**: Hook para gerenciamento de autenticação
  - Gerencia estado do usuário logado
  - Escuta mudanças de autenticação
  - Fornece estados de loading e error

## Tipos de Dados

### Arquivo: `lib/nutrition-types.ts`
- `MealPlan`: Interface para planos de refeição
- `MealLog` / `MealLogType`: Interface para registros de refeição
- `HydrationLog`: Interface para registros de hidratação

## Lógica de Funcionamento

### Fluxo de Autenticação
1. Página verifica autenticação no servidor
2. Redireciona para login se não autenticado
3. Passa dados do usuário para componentes

### Fluxo de Dados
1. **Carregamento Inicial**:
   - Cada componente busca dados do dia atual
   - Estados de loading durante requisições
   - Tratamento de erros via console.error

2. **Operações CRUD**:
   - **Create**: Inserção de novos registros
   - **Read**: Busca filtrada por usuário e data
   - **Update**: Atualização de registros existentes
   - **Delete**: Exclusão de registros

3. **Sincronização**:
   - Atualização automática após operações
   - Refresh de dados via `fetchData()` functions

### Funcionalidades Especiais

#### HydrationReminder
- **Auto-criação**: Cria registro automaticamente se não existir
- **Notificações**: Usa Web Notifications API
- **Visualização**: Progress bar e ícones de gotas
- **Meta flexível**: Permite ajuste da meta de copos

#### MealPlanner vs MealLog
- **MealPlanner**: Planejamento futuro/presente
- **MealLog**: Registro histórico do que foi consumido
- **Diferenciação**: Cores e ícones diferentes (laranja vs azul)

## Dependências

### Bibliotecas Principais
- `@supabase/supabase-js`: Cliente Supabase
- `next/navigation`: Roteamento Next.js
- `lucide-react`: Ícones

### Componentes UI
- `@/components/ui/*`: Sistema de design baseado em shadcn/ui
- Cards, Buttons, Inputs, Progress, etc.

## Pontos de Atenção

### Segurança
- ✅ Autenticação obrigatória
- ✅ Filtros por user_id em todas as queries
- ✅ Validação de dados antes de inserção

### Performance
- ✅ Queries otimizadas com filtros específicos
- ✅ Estados de loading para UX
- ⚠️ Possível otimização: Cache de dados

### UX/UI
- ✅ Interface responsiva
- ✅ Feedback visual (loading, progress)
- ✅ Notificações para metas atingidas
- ✅ Dicas contextuais

### Manutenibilidade
- ✅ Separação clara de responsabilidades
- ✅ Tipos TypeScript bem definidos
- ✅ Estrutura modular
- ⚠️ Possível melhoria: Centralização de lógica de API

## Recomendações

1. **Implementar cache local** para melhor performance
2. **Adicionar validação de formulários** mais robusta
3. **Implementar sincronização offline** para melhor UX
4. **Adicionar testes unitários** para componentes críticos
5. **Considerar Context API** para compartilhamento de estado
6. **Implementar loading skeletons** mais específicos

---

**Data da Auditoria**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Auditor**: Sistema de Auditoria Automatizada
**Versão**: 1.0