# Repositório remoto (GitHub)

- **URL HTTPS:** https://github.com/hbribeiro77/smarttask.git
- **Branch principal:** `main`

## Primeira vez / novo clone

```powershell
cd d:\claude\defensoria\smarttask
git remote add origin https://github.com/hbribeiro77/smarttask.git
# se o remote já existir com outra URL:
# git remote set-url origin https://github.com/hbribeiro77/smarttask.git
git branch -M main
git push -u origin main
```

## Envio habitual de alterações

```powershell
cd d:\claude\defensoria\smarttask
git add -A
git status
git commit -m "descreva a alteração em português"
git push
```

## Autenticação no GitHub

No Windows, o GitHub costuma pedir **Personal Access Token (PAT)** em vez de senha ao usar HTTPS, ou use o **GitHub CLI** (`gh auth login`) / **Git Credential Manager**.

## Deploy (Nixpacks / EasyPanel / VPS)

O projeto usa **Next.js 16**, que exige **Node.js ≥ 20.9.0**. O Nixpacks costuma subir **Node 18** se nada for declarado.

Na raiz do repo existem **`nixpacks.toml`** (`NIXPACKS_NODE_VERSION = "20"`), **`.nvmrc`** e **`engines.node`** no `package.json` para forçar Node 20 no build. Se o painel permitir, defina também a variável de ambiente **`NIXPACKS_NODE_VERSION=20`** no serviço.

## Login Google (acesso restrito)

Com **`AUTH_GOOGLE_ID`** e **`AUTH_GOOGLE_SECRET`** definidos (e **`AUTH_SECRET`**), o app exige login Google e só libera e-mails em **`AUTH_ALLOWED_EMAILS`** (lista separada por vírgula, comparação em minúsculas).

Também defina **`AUTH_URL`** com a URL pública do app (ex.: `https://seu-subdominio.com`), para o OAuth e cookies funcionarem atrás do proxy.

No [Google Cloud Console](https://console.cloud.google.com/) crie credenciais OAuth 2.0 (tipo *Web*) e em **URIs de redirecionamento autorizados** inclua:

`{AUTH_URL}/api/auth/callback/google`

(Se `AUTH_URL` tiver barra final, evite duplicar; o padrão do NextAuth é `/api/auth/callback/google`.)

Sem `AUTH_GOOGLE_*`, o app permanece **aberto** (útil no desenvolvimento local). Ver **`.env.example`**.
