# Preventiva PIM - Sistema de Manutenção Preventiva

Sistema para gestão de manutenções preventivas de equipamentos industriais, permitindo o controle de planos, execuções e indicadores de conformidade.

---

## 🚀 Tecnologias Utilizadas (Backend)

- **Node.js** com **TypeScript**
- **Express** (Framework Web)
- **TypeORM** (ORM para banco de dados)
- **PostgreSQL** (Banco de dados)
- **JWT** (Autenticação)
- **Bcrypt** (Hash de senhas de alta performance)
- **Zod** (Validação de schemas e ambiente)
- **Pino** (Logging estruturado)
- **Helmet & CORS** (Segurança HTTP)
- **Compression** (Otimização de tráfego)
- **Swagger** (Documentação da API)
- **Jest** (Testes automatizados)


---

## 👥 Personas

### 🔧 Técnico de Manutenção
*   **Perfil:** Executa as manutenções preventivas conforme o calendário. Acessa o sistema para visualizar tarefas e registrar o que foi realizado.
*   **Objetivo Principal:** Ter clareza sobre as manutenções na sua fila e registrar a execução rapidamente.
*   **Dor Atual:** Recebe listas em papel ou mensagens; dificuldade em comprovar execuções sem preenchimento manual.

### 📋 Supervisor de Manutenção
*   **Perfil:** Planeja e acompanha o programa de manutenção preventiva da planta. Responsável pela disponibilidade dos equipamentos.
*   **Objetivo Principal:** Garantir que 100% das preventivas sejam realizadas no prazo e ter evidência documentada.
*   **Dor Atual:** Dificuldade em identificar atrasos e calcular indicadores de conformidade manualmente.

### 📊 Gestor de Produção
*   **Perfil:** Analisa indicadores de alto nível para tomada de decisão estratégica sobre ativos da planta.
*   **Objetivo Principal:** Acompanhar a disponibilidade dos equipamentos e o impacto da manutenção na produtividade.
*   **Dor Atual:** Falta de visibilidade em tempo real sobre a saúde dos ativos e indicadores de disponibilidade confiáveis.

---

---

## 📋 Histórias de Usuário (US)

| ID | Ator | Descrição |
|:---|:---|:---|
| **US01** | Supervisor | Cadastrar um plano de manutenção com periodicidade para um equipamento. |
| **US02** | Técnico | Ver no calendário quais manutenções estão previstas para os próximos dias. |
| **US03** | Técnico | Registrar a execução de uma manutenção com data, status e observações. |
| **US04** | Supervisor | Recalcular automaticamente a próxima data de manutenção após cada execução. |
| **US05** | Supervisor | Ver no dashboard manutenções atrasadas e o percentual de conformidade do mês. |
| **US06** | Supervisor | Consultar o histórico de execuções de um plano específico. |
| **US07** | Supervisor | Cadastrar e editar equipamentos com seus dados de identificação. |
| **US08** | Técnico | Executar um checklist de itens ao registrar a manutenção. |
| **US09** | Supervisor | Ver o percentual de itens conforme por execução no histórico. |
| **US10** | Gestor | Ver o indicador de disponibilidade simplificado dos equipamentos no dashboard. |

---

## 🛠️ Requisitos Funcionais (RF)

| ID | Requisito | Prioridade | Status |
|:---|:---|:---:|:---:|
| **RF01** | Autenticação de usuários via e-mail e senha com JWT (8h). | Alta | ✅ |
| **RF02** | Proteção de rotas com redirecionamento para login. | Alta | ✅ |
| **RF03** | Cadastro de planos de manutenção com periodicidade e data inicial. | Alta | ✅ |
| **RF04** | Recálculo automático: `proxima_em = data_execucao + periodicidade`. | Alta | ✅ |
| **RF05** | Calendário com ordenação por `proxima_em` e filtros de status. | Alta | ✅ |
| **RF06** | Dashboard: atrasadas, previstas (7 dias), conformidade e execuções do mês. | Alta | ✅ |
| **RF07** | Listagem de atrasadas com cálculo de dias de atraso. | Alta | ✅ |
| **RF08** | CRUD de equipamentos e planos vinculados. | Alta | ✅ |
| **RF09** | Histórico de execuções acessível pelo detalhe do plano. | Média | ✅ |
| **RF10** | Filtro de planos inativos (não devem aparecer no calendário/dashboard). | Média | ✅ |
| **RF11** | Suporte a checklists individuais por plano de manutenção. | Baixa | ✅ |
| **RF12** | Dashboard com percentual de itens conforme por execução. | Baixa | ✅ |

> (1) O backend fornece os dados e permite ordenação.  
> (2) Implementado no módulo `/dashboard`.

---

## 🔐 Requisitos Não Funcionais (RNF)

| ID | Requisito | Prioridade | Status |
|:---|:---|:---:|:---:|
| **RNF01** | Base de recálculo deve ser a data de execução, não a data atual. | Alta | ✅ |
| **RNF02** | Armazenamento de senhas com hash Bcrypt. | Alta | ✅ |
| **RNF03** | Todas as rotas (exceto `/auth/login`) devem exigir JWT. | Alta | ✅ |
| **RNF04** | Frontend responsivo (>= 1024px). | Média | N/A |
| **RNF05** | README com instruções de instalação e execução. | Média | ✅ |
| **RNF06** | Variáveis sensíveis em arquivo `.env`. | Alta | ✅ |
| **RNF07** | Tratamento de erros amigável (401 e 500). | Média | ✅ |

---

## 🧪 Critérios de Aceite (Destaques)

- **US04 (Recálculo):** Plano com 30 dias executado em 15/03 -> `proxima_em` = 14/04. Se executado com atraso (ex: 20/03), `proxima_em` = 19/04.
- **US05 (Dashboard):** Atrasados = `proxima_em` < hoje. Dias de atraso = `hoje - proxima_em`.
- **US06 (Histórico):** Ordem cronológica reversa com técnica, status e conformidade.

---

## 🛠️ Como Executar

### Pré-requisitos
- Node.js (v18+)
- Docker (opcional)

### Passos
1. Clone o repositório.
2. Acesse a pasta `backend`.
3. Instale as dependências: `npm install`.
4. Configure o arquivo `.env` (use `.env.example` como base).
5. Execute em modo desenvolvimento: `npm run dev`.
6. Acesse a documentação Swagger em: `http://localhost:3000/docs`.

**Usuário padrão:** `admin@example.com` / `admin123456`
