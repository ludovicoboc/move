"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Home,
  Utensils,
  ChefHat,
  BookOpen,
  Heart,
  Gamepad2,
  DollarSign,
  Zap,
  Anchor,
  Bed,
  User,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [openSections, setOpenSections] = useState<string[]>([])
  const router = useRouter()

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => (prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]))
  }

  const sections = [
    {
      id: "dashboard",
      title: "Dashboard Principal",
      icon: Home,
      path: "/",
      description: "Visão geral de todas as suas atividades e métricas importantes",
      features: [
        "Painel do dia com resumo das atividades",
        "Lista de prioridades personalizável",
        "Lembretes de pausas automáticos",
        "Métricas de bem-estar em tempo real",
        "Acesso rápido a todas as funcionalidades",
      ],
    },
    {
      id: "nutrition",
      title: "Gestão Nutricional",
      icon: Utensils,
      path: "/food",
      description: "Controle completo da sua alimentação e hidratação",
      features: [
        "Planejamento de refeições semanal",
        "Registro detalhado de refeições",
        "Lembretes de hidratação personalizáveis",
        "Análise nutricional das refeições",
        "Histórico de hábitos alimentares",
      ],
    },
    {
      id: "recipes",
      title: "Banco de Receitas",
      icon: ChefHat,
      path: "/recipes",
      description: "Organize e descubra receitas para uma alimentação saudável",
      features: [
        "Biblioteca de receitas categorizada",
        "Filtros por categoria e ingredientes",
        "Importação de receitas de URLs",
        "Criação de receitas personalizadas",
        "Sistema de avaliação e favoritos",
      ],
    },
    {
      id: "studies",
      title: "Gestão de Estudos",
      icon: BookOpen,
      path: "/studies",
      description: "Otimize seu aprendizado com ferramentas especializadas",
      features: [
        "Timer Pomodoro integrado",
        "Registro de sessões de estudo",
        "Gerenciamento de exames e provas",
        "Organização de materiais de estudo",
        "Análise de produtividade",
      ],
    },
    {
      id: "health",
      title: "Monitoramento de Saúde",
      icon: Heart,
      path: "/health",
      description: "Acompanhe sua saúde física e mental",
      features: [
        "Registro de medicamentos",
        "Monitoramento de humor diário",
        "Lembretes de consultas médicas",
        "Histórico de sintomas",
        "Relatórios de saúde personalizados",
      ],
    },
    {
      id: "leisure",
      title: "Gestão de Lazer",
      icon: Gamepad2,
      path: "/leisure",
      description: "Balance trabalho e descanso de forma saudável",
      features: [
        "Timer para atividades de lazer",
        "Catálogo de atividades relaxantes",
        "Sugestões de descanso personalizadas",
        "Controle de tempo de tela",
        "Planejamento de momentos de pausa",
      ],
    },
    {
      id: "finance",
      title: "Controle Financeiro",
      icon: DollarSign,
      path: "/finance",
      description: "Gerencie suas finanças pessoais com eficiência",
      features: [
        "Rastreamento de gastos por categoria",
        "Sistema de envelopes virtuais",
        "Calendário de pagamentos",
        "Análise de padrões de gastos",
        "Metas financeiras personalizáveis",
      ],
    },
    {
      id: "hyperfocus",
      title: "Gestão de Hiperfoco",
      icon: Zap,
      path: "/hyperfocus",
      description: "Transforme períodos de hiperfoco em produtividade",
      features: [
        "Conversor de interesses em projetos",
        "Sistema de alternância de foco",
        "Visualizador de projetos ativos",
        "Timer de foco com pausas",
        "Análise de padrões de concentração",
      ],
    },
    {
      id: "self-awareness",
      title: "Autoconhecimento",
      icon: Anchor,
      path: "/self-awareness",
      description: "Desenvolva maior consciência sobre si mesmo",
      features: [
        "Sistema de notas organizadas",
        "Modo refúgio para momentos difíceis",
        "Diário reflexivo estruturado",
        "Ferramentas de autoanálise",
        "Acompanhamento de padrões emocionais",
      ],
    },
    {
      id: "sleep",
      title: "Gestão do Sono",
      icon: Bed,
      path: "/sleep",
      description: "Otimize a qualidade do seu sono e descanso",
      features: [
        "Registro detalhado do sono",
        "Visualização de padrões de sono",
        "Lembretes personalizáveis",
        "Dicas de higiene do sono",
        "Análise de qualidade do descanso",
      ],
    },
    {
      id: "profile",
      title: "Perfil do Usuário",
      icon: User,
      path: "/profile",
      description: "Personalize completamente sua experiência",
      features: [
        "Informações pessoais editáveis",
        "Preferências de acessibilidade avançadas",
        "Personalização de tema e cores",
        "Configuração de metas diárias",
        "Gerenciamento de notificações",
        "Controle de dados e privacidade",
      ],
    },
  ]

  const faqs = [
    {
      question: "Como funciona o sistema de acessibilidade?",
      answer:
        "O sistema oferece opções como alto contraste, redução de estímulos, texto grande, suporte para daltonismo, navegação por teclado e compatibilidade com leitores de tela. Todas as configurações são aplicadas imediatamente e salvas automaticamente.",
    },
    {
      question: "Posso usar a aplicação offline?",
      answer:
        "Algumas funcionalidades básicas funcionam offline, mas para sincronização completa dos dados é necessária conexão com a internet. Os dados são salvos localmente e sincronizados quando a conexão é restaurada.",
    },
    {
      question: "Como personalizar as notificações?",
      answer:
        "Acesse o seu perfil e vá para a aba 'Notificações'. Lá você pode configurar quais tipos de lembretes deseja receber e como prefere recebê-los (visual, sonoro, email, etc.).",
    },
    {
      question: "É possível exportar meus dados?",
      answer:
        "Sim! Na seção 'Dados' do seu perfil, você pode exportar todos os seus dados em formato JSON ou CSV. Os exports ficam disponíveis por 7 dias para download.",
    },
    {
      question: "Como funciona o modo escuro?",
      answer:
        "O modo escuro pode ser ativado clicando no ícone da lua no cabeçalho. A aplicação também pode seguir automaticamente as preferências do seu sistema operacional.",
    },
    {
      question: "Posso usar em dispositivos móveis?",
      answer:
        "Sim! A aplicação é totalmente responsiva e otimizada para funcionar em smartphones, tablets e desktops, mantendo todas as funcionalidades em qualquer dispositivo.",
    },
  ]

  const filteredSections = sections.filter(
    (section) =>
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.features.some((feature) => feature.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Perguntas Frequentes</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Guia completo sobre todas as funcionalidades da aplicação
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar funcionalidades, perguntas ou respostas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sections Overview */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Funcionalidades da Aplicação</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSections.map((section) => (
              <Card key={section.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <section.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    {section.title}
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{section.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <Collapsible open={openSections.includes(section.id)} onOpenChange={() => toggleSection(section.id)}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                        <span className="text-sm font-medium">Ver funcionalidades</span>
                        {openSections.includes(section.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3">
                      <ul className="space-y-2">
                        {section.features.map((feature, index) => (
                          <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full bg-transparent"
                        onClick={() => router.push(section.path)}
                      >
                        Acessar {section.title}
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Perguntas Frequentes</h2>
          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <Card key={index}>
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <CardTitle className="flex items-center justify-between text-base">
                        {faq.question}
                        <ChevronDown className="h-4 w-4" />
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        </div>

        {/* Accessibility Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Recursos de Acessibilidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Recursos Visuais</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Alto contraste para melhor legibilidade</li>
                  <li>• Redução de estímulos visuais</li>
                  <li>• Texto grande personalizável</li>
                  <li>• Suporte para daltonismo</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Recursos de Navegação</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Navegação completa por teclado</li>
                  <li>• Indicadores de foco visíveis</li>
                  <li>• Compatibilidade com leitores de tela</li>
                  <li>• Controle de animações</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">Não encontrou o que procurava?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Esta aplicação está em constante desenvolvimento. Suas sugestões e feedback são muito importantes!
            </p>
            <Button onClick={() => router.push("/profile")}>Acessar Configurações</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
