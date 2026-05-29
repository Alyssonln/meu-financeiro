# FinançasPro

App de finanças pessoais com login, banco de dados e deploy no Vercel.

**Stack:** React + Vite · Supabase (auth + PostgreSQL) · Vercel

---

## 1. Configurar o Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto gratuito
2. No painel, vá em **SQL Editor** e cole o conteúdo de `supabase_migration.sql` → clique em **Run**
3. Vá em **Project Settings → API** e copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

---

## 2. Rodar localmente

```bash
# 1. Instalar dependências
npm install

# 2. Criar o .env com suas chaves
cp .env.example .env
# Edite o .env com seus valores do Supabase

# 3. Iniciar
npm run dev
```

---

## 3. Deploy no Vercel

```bash
# Instalar Vercel CLI (se não tiver)
npm i -g vercel

# Na pasta do projeto
vercel

# Seguir os prompts:
# - Link to existing project? No
# - Project name: financas-app (ou o que preferir)
# - Root directory: ./ (Enter)
# - Override settings? No
```

Após o primeiro deploy, configure as variáveis de ambiente no painel do Vercel:

1. Acesse seu projeto em [vercel.com](https://vercel.com)
2. Vá em **Settings → Environment Variables**
3. Adicione:
   - `VITE_SUPABASE_URL` = sua URL do Supabase
   - `VITE_SUPABASE_ANON_KEY` = sua chave anon

4. Vá em **Deployments** e clique em **Redeploy**

---

## Funcionalidades

- ✅ Login e cadastro com e-mail e senha
- ✅ Sessão persistente (JWT via Supabase)
- ✅ Receitas e despesas por mês
- ✅ Pendências com status de vencimento
- ✅ Gráfico dos últimos 6 meses
- ✅ Dados isolados por usuário (RLS)
- ✅ Responsivo para mobile e desktop

---

## Estrutura

```
src/
  context/AuthContext.jsx   — sessão do usuário
  hooks/useFinance.js       — todas as operações no banco
  pages/AuthPage.jsx        — login e cadastro
  pages/Dashboard.jsx       — shell principal com abas
  components/
    Summary.jsx             — resumo e gráfico
    Transactions.jsx        — lista e form de transações
    Pendencies.jsx          — pendências e vencimentos
    Modal.jsx               — modal reutilizável
```
