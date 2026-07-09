#!/bin/bash

# Cores para o terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sem Cor

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}    Script de Deploy - Diogo Alves Fotografia   ${NC}"
echo -e "${BLUE}===============================================${NC}"

# Detecta se é o ambiente local de desenvolvimento ou o servidor, ou se foi solicitado modo automático
OPTION=""
if [ "$1" = "--auto" ] || [ "$1" = "-y" ] || [ "$GITHUB_ACTIONS" = "true" ]; then
    OPTION=2
elif [ -d ".git" ]; then
    echo -e "Como você deseja utilizar este script?"
    echo -e "1) ${GREEN}Enviar alterações para o GitHub (Commit & Push)${NC}"
    echo -e "2) ${YELLOW}Executar deploy local no servidor (Pull, Build & PM2)${NC}"
    echo -e "-----------------------------------------------"
    read -p "Escolha uma opção (1 ou 2): " OPTION
else
    OPTION=2
fi

if [ "$OPTION" = "1" ]; then
    echo -e "\n${BLUE}[1/3] Verificando status do Git...${NC}"
    git status -s
    
    echo -e "-----------------------------------------------"
    read -p "Digite a mensagem do commit: " COMMIT_MSG
    if [ -z "$COMMIT_MSG" ]; then
        COMMIT_MSG="feat: atualizações gerais e melhorias no deploy"
    fi
    
    echo -e "\n${BLUE}[2/3] Adicionando e registrando alterações...${NC}"
    git add .
    git commit -m "$COMMIT_MSG"
    
    echo -e "\n${BLUE}[3/3] Enviando para o GitHub (branch main)...${NC}"
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo -e "\n${GREEN}✅ Alterações enviadas com sucesso para o GitHub!${NC}"
        echo -e "${GREEN}O workflow do GitHub Actions foi iniciado e atualizará seu Raspberry Pi automaticamente.${NC}"
    else
        echo -e "\n${RED}❌ Erro ao enviar alterações para o GitHub. Verifique suas credenciais.${NC}"
    fi

elif [ "$OPTION" = "2" ]; then
    echo -e "\n${BLUE}📥 [1/5] Atualizando código fonte do repositório...${NC}"
    # Se houver conflito local com o deploy.sh antes de fazer pull, removemos ou resetamos ele
    git checkout -- deploy.sh 2>/dev/null || true
    git pull origin main
    
    echo -e "\n${BLUE}📦 [2/5] Instalando todas as dependências necessárias para a compilação (Build)...${NC}"
    # IMPORTANTE: precisamos de devDependencies (como typescript e ts-node) para compilar e migrar o banco!
    npm install
    
    echo -e "\n${BLUE}🔄 [3/5] Gerando cliente Prisma e aplicando schemas no banco (Turso)...${NC}"
    npx prisma generate
    npm run db:push
    
    echo -e "\n${BLUE}🏗️ [4/5] Gerando nova compilação da aplicação (Build)...${NC}"
    npm run build
    
    # Após a compilação (Build) concluída com sucesso, podemos remover as devDependencies para economizar RAM no Pi
    echo -e "\n${BLUE}🧹 Removendo dependências de desenvolvimento para economizar espaço e RAM...${NC}"
    npm prune --omit=dev
    
    echo -e "\n${BLUE}🚀 [5/5] Reiniciando servidor no PM2...${NC}"
    if command -v pm2 &> /dev/null; then
        # Reinicia o processo correto "diogo_alves_fotografia"
        pm2 restart "diogo_alves_fotografia" || pm2 restart "diogo-alves-fotografia" || pm2 start npm --name "diogo_alves_fotografia" -- start
        pm2 save
        echo -e "\n${GREEN}✅ PM2 reiniciado com sucesso!${NC}"
    else
        echo -e "\n${YELLOW}⚠️ PM2 não encontrado neste ambiente.${NC}"
        echo -e "${YELLOW}Para rodar manualmente, execute: npm run start${NC}"
    fi
    
    echo -e "\n${GREEN}🎉 Deploy local concluído com sucesso! Diogo Alves Fotografia está online.${NC}"
else
    echo -e "\n${RED}❌ Opção inválida. Operação cancelada.${NC}"
fi
