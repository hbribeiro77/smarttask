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
