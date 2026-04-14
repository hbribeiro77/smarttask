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

## Senha de acesso (VPS / instância fechada)

Com **`SMARTTASK_ACCESS_PASSWORD`** definida (não vazia), o app exige login em **`/login`**, grava um cookie **httpOnly** assinado e renova a sessão a cada request válido (**30 dias** deslizantes).

Recomenda-se também **`SMARTTASK_SESSION_SECRET`** (string longa aleatória) só para assinar o cookie; se omitida, usa a própria senha de acesso (menos ideal).

Sem **`SMARTTASK_ACCESS_PASSWORD`**, o app fica **aberto** (bom para desenvolvimento local). Detalhes em **`.env.example`**.
