# 🚀 Guia de Deploy Oficial: Vértice na Vercel & Instalação no Celular

Este guia mostra como colocar o **Vértice** no ar em produção de forma gratuita na **Vercel** e como instalá-lo como aplicativo nativo no seu iPhone ou Android.

---

## ☁️ Passo 1: Deploy Gratuito na Vercel (2 minutos)

1. Acesse **[vercel.com](https://vercel.com)** e faça login com a sua conta do GitHub.
2. Clique no botão **"Add New..."** > **"Project"**.
3. Selecione o repositório: **`savioaugusto7-sudo/vertice`**.
4. Na seção **"Environment Variables"** (Variáveis de Ambiente), adicione as seguintes chaves do seu arquivo `.env.local`:

| Nome da Variável | Valor |
| :--- | :--- |
| `PLUGGY_CLIENT_ID` | `5e944354-293f-46aa-b4be-269493118e98` |
| `PLUGGY_CLIENT_SECRET` | `f3Ygk2LmTl_pIhfUgS5eIECt29tirUAImSJ_ZLOXIc4` |
| `PLUGGY_API_KEY` | *(A sua chave JWT da Pluggy)* |

*(Opcional: Se desejar ativar o banco em nuvem Supabase, adicione também `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`).*

5. Clique em **"Deploy"**.
6. Em cerca de 60 segundos, você receberá o link oficial de produção com certificado SSL gratuito (ex: `https://vertice-financas.vercel.app`).

---

## 📱 Passo 2: Instalar no Smartphone (PWA - Experiência Nativa)

Como o Vértice foi construído como um **Progressive Web App (PWA)** com suporte a tela cheia e barra de navegação inferior tátil:

### No iPhone (iOS / Safari):
1. Abra o link da Vercel no **Safari**.
2. Toque no botão de **Compartilhar** (ícone do quadrado com a seta para cima ⬆️ no rodapé).
3. Role a lista e toque em **"Adicionar à Tela de Início"** (ícone `+`).
4. Toque em **Adicionar**.
5. O ícone do **Vértice** aparecerá na tela de início do seu iPhone. Ao abrir, ele roda em tela cheia, sem barra de endereços do navegador!

### No Android (Google Chrome):
1. Abra o link da Vercel no **Chrome**.
2. Um aviso **"Adicionar Vértice à tela inicial"** ou **"Instalar aplicativo"** surgirá na parte inferior.
3. Se não surgir automaticamente, toque nos **3 pontinhos** no canto superior direito e selecione **"Instalar aplicativo"**.
4. O app será adicionado à sua gaveta de aplicativos com atalhos rápidos de "Nova Transação".

---

## 🔐 Como Funciona a Segurança no Celular:
- **Zero-Knowledge:** Seus dados financeiros são criptografados com **AES-256-GCM** antes de qualquer gravação.
- **Biometria:** Ao abrir o app, você pode utilizar o **Face ID** ou **Touch ID** através do botão de Passkeys.
- **Offline First:** O app abre instantaneamente mesmo em áreas com sinal 4G fraco.
