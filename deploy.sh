#!/bin/bash

# Cores para o terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sem Cor

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}      Script de Deploy - Aura Portfolio        ${NC}"
echo -e "${BLUE}===============================================${NC}"

# Detecta se é o ambiente local de desenvolvimento ou o servidor
if [ -d ".git" ]; then
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
    git pull origin main
    
    echo -e "\n${BLUE}📦 [2/5] Instalando dependências (produção)...${NC}"
    npm install --omit=dev
    
    echo -e "\n${BLUE}🔄 [3/5] Gerando cliente Prisma e aplicando schemas no banco (Turso)...${NC}"
    npx prisma generate
    npm run db:push
    
    echo -e "\n${BLUE}🏗️ [4/5] Gerando nova compilação da aplicação (Build)...${NC}"
    npm run build
    
    echo -e "\n${BLUE}🚀 [5/5] Reiniciando servidor no PM2...${NC}"
    if command -v pm2 &> /dev/null; then
        pm2 restart "aura-portfolio" || pm2 start npm --name "aura-portfolio" -- start
        pm2 save
        echo -e "\n${GREEN}✅ PM2 reiniciado com sucesso!${NC}"
    else
        echo -e "\n${YELLOW}⚠️ PM2 não encontrado neste ambiente.${NC}"
        echo -e "${YELLOW}Para rodar manualmente, execute: npm run start${NC}"
    fi
    
    echo -e "\n${GREEN}🎉 Deploy local concluído com sucesso! Aura Portfolio está online.${NC}"
else
    echo -e "\n${RED}❌ Opção inválida. Operação cancelada.${NC}"
fi
