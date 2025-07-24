# Auditoria da Página Finance

## Visão Geral
A página de finanças é um módulo completo para gerenciamento financeiro pessoal, oferecendo funcionalidades de rastreamento de gastos, envelopes virtuais, calendário de pagamentos e adição de despesas.

## Estrutura de Arquivos

### Página Principal
- **Arquivo**: `app/finance/page.tsx`
- **Função**: Página principal que renderiza o FinanceDashboard dentro do AuthProvider
- **Características**:
  - Usa "use client" para renderização no lado do cliente
  - Implementa autenticação obrigatória via WithUser
  - Passa o usuário autenticado para o dashboard

### Dashboard Principal
- **Arquivo**: `components/FinanceDashboard.tsx`
- **Função**: Componente principal que organiza todos os módulos financeiros
- **Layout**: Grid responsivo com 2 colunas em telas grandes
- **Funcionalidades**:
  - Sistema de refresh automático via refreshKey
  - Callback handleExpenseAdded para sincronização entre componentes
  - Integração com AppLayout para navegação consistente

## Componentes Utilizados

### 1. ExpenseTracker
- **Arquivo**: `components/ExpenseTracker.tsx`
- **Função**: Rastreamento e visualização de gastos por categoria
- **Funcionalidades**:
  - Busca despesas e categorias do usuário
  - Calcula totais por categoria e percentuais
  - Exibe gráfico placeholder para visualização
  - Formatação de moeda em Real (BRL)
  - Loading state com skeleton
  - Validação crítica de user_id

### 2. VirtualEnvelopes
- **Arquivo**: `components/VirtualEnvelopes.tsx`
- **Função**: Sistema de envelopes virtuais para controle de orçamento
- **Funcionalidades**:
  - Criação de envelopes com nome, valor total e cor
  - Registro de gastos nos envelopes
  - Barra de progresso visual do uso do envelope
  - Validação de limites antes de registrar gastos
  - Exclusão de envelopes com confirmação
  - Dialogs para criação e registro de gastos

### 3. PaymentCalendar
- **Arquivo**: `components/PaymentCalendar.tsx`
- **Função**: Calendário de pagamentos agendados
- **Funcionalidades**:
  - Navegação por mês (anterior/próximo)
  - Criação de pagamentos únicos ou recorrentes
  - Marcação de pagamentos como pagos/não pagos
  - Categorização opcional dos pagamentos
  - Tipos de recorrência: semanal, mensal, anual
  - Exclusão de pagamentos com confirmação

### 4. AddExpense
- **Arquivo**: `components/AddExpense.tsx`
- **Função**: Formulário para adição de novas despesas
- **Funcionalidades**:
  - Campos: descrição, valor, data, categoria, envelope (opcional)
  - Seleção visual de categorias com cores
  - Integração com envelopes virtuais
  - Validação de limites de envelope
  - Callback para notificar outros componentes
  - Dicas de uso integradas

## Hooks Utilizados

### Hooks Nativos do React
- **useState**: Gerenciamento de estado local em todos os componentes
- **useEffect**: Carregamento de dados e side effects

### Hooks Customizados
- **use-user.ts**: Hook para gerenciamento de autenticação
  - Gerencia estado do usuário logado
  - Escuta mudanças de autenticação
  - Fornece loading e error states
  - Implementa validação robusta de sessão

## Stores/Banco de Dados

### Tabelas Supabase Utilizadas

#### 1. finance_categories
- **Campos**:
  - `id`: UUID (Primary Key)
  - `user_id`: UUID (Foreign Key para auth.users)
  - `name`: VARCHAR(100) - Nome da categoria
  - `color`: VARCHAR(7) - Cor em hexadecimal
  - `icon`: VARCHAR(50) - Ícone opcional
  - `created_at`: TIMESTAMP
- **Políticas RLS**: Usuários podem gerenciar apenas suas próprias categorias
- **Categorias Padrão**: Moradia, Alimentação, Transporte, Saúde, Lazer

#### 2. expenses
- **Campos**:
  - `id`: UUID (Primary Key)
  - `user_id`: UUID (Foreign Key para auth.users)
  - `category_id`: UUID (Foreign Key para finance_categories)
  - `description`: TEXT - Descrição da despesa
  - `amount`: DECIMAL(10,2) - Valor da despesa
  - `date`: DATE - Data da despesa
  - `envelope_id`: UUID (Foreign Key para virtual_envelopes)
  - `created_at`, `updated_at`: TIMESTAMP
- **Relacionamentos**: Categoria e envelope opcionais

#### 3. virtual_envelopes
- **Campos**:
  - `id`: UUID (Primary Key)
  - `user_id`: UUID (Foreign Key para auth.users)
  - `name`: VARCHAR(100) - Nome do envelope
  - `total_amount`: DECIMAL(10,2) - Valor total do envelope
  - `used_amount`: DECIMAL(10,2) - Valor já utilizado
  - `color`: VARCHAR(7) - Cor em hexadecimal
  - `created_at`, `updated_at`: TIMESTAMP
- **Lógica**: used_amount é atualizado automaticamente ao registrar gastos

#### 4. scheduled_payments
- **Campos**:
  - `id`: UUID (Primary Key)
  - `user_id`: UUID (Foreign Key para auth.users)
  - `title`: VARCHAR(200) - Título do pagamento
  - `amount`: DECIMAL(10,2) - Valor do pagamento
  - `due_date`: DATE - Data de vencimento
  - `category_id`: UUID (Foreign Key para finance_categories)
  - `is_paid`: BOOLEAN - Status de pagamento
  - `is_recurring`: BOOLEAN - Se é recorrente
  - `recurrence_type`: VARCHAR(20) - Tipo de recorrência
  - `created_at`, `updated_at`: TIMESTAMP

## Lógica de Funcionamento

### Fluxo de Dados
1. **Autenticação**: WithUser garante usuário logado
2. **Carregamento**: Cada componente busca seus dados independentemente
3. **Sincronização**: refreshKey no FinanceDashboard força re-render
4. **Persistência**: Todas as operações são salvas no Supabase

### Validações Implementadas
- **User ID**: Validação crítica em todos os componentes
- **Limites de Envelope**: Verificação antes de registrar gastos
- **Campos Obrigatórios**: Validação de formulários
- **Confirmações**: Para operações de exclusão

### Estados de Loading
- Skeleton loading em todos os componentes
- Estados de carregamento durante operações
- Tratamento de erros com logs detalhados

### Formatação e UX
- **Moeda**: Formatação em Real brasileiro (BRL)
- **Datas**: Formato brasileiro (dd/mm/aaaa)
- **Cores**: Sistema de cores personalizáveis
- **Responsividade**: Layout adaptativo para diferentes telas

## Segurança

### Row Level Security (RLS)
- Todas as tabelas têm RLS habilitado
- Políticas garantem acesso apenas aos próprios dados
- Validação de user_id em todas as operações

### Validações Client-Side
- Verificação de user_id antes de operações
- Validação de limites e campos obrigatórios
- Sanitização de inputs

## Pontos de Melhoria Identificados

### Funcionalidades
1. **Gráficos**: Implementar gráficos reais no ExpenseTracker
2. **Relatórios**: Adicionar relatórios mensais/anuais
3. **Metas**: Sistema de metas de gastos por categoria
4. **Importação**: Importar dados de extratos bancários

### Performance
1. **Cache**: Implementar cache para categorias
2. **Paginação**: Para listas grandes de despesas
3. **Otimização**: Reduzir re-renders desnecessários

### UX/UI
1. **Feedback**: Melhorar feedback visual das operações
2. **Atalhos**: Adicionar atalhos de teclado
3. **Filtros**: Filtros avançados por data/categoria
4. **Busca**: Sistema de busca nas despesas

## Dependências Principais

### Bibliotecas UI
- **@radix-ui**: Componentes base (Dialog, Select, etc.)
- **lucide-react**: Ícones
- **tailwindcss**: Estilização

### Supabase
- **@supabase/supabase-js**: Cliente JavaScript
- **Autenticação**: Sistema de auth integrado
- **Database**: PostgreSQL com RLS

### Utilitários
- **Intl.NumberFormat**: Formatação de moeda
- **Date**: Manipulação de datas

## Conclusão

O módulo de finanças está bem estruturado e funcional, oferecendo um conjunto completo de ferramentas para gerenciamento financeiro pessoal. A arquitetura é modular, segura e escalável, com boa separação de responsabilidades entre os componentes. As principais oportunidades de melhoria estão na implementação de gráficos reais, relatórios avançados e otimizações de performance.