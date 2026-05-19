const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@libsql/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');

const url = process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

let prisma;

if (url && url.startsWith('libsql://')) {
  const libsql = createClient({ url, authToken: authToken || "" });
  const adapter = new PrismaLibSQL(libsql);
  prisma = new PrismaClient({ adapter });
} else {
  prisma = new PrismaClient();
}

async function main() {
  const bcrypt = require('bcryptjs');

  console.log('Limpando banco de dados...');
  await prisma.user.deleteMany();
  await prisma.post.deleteMany();
  await prisma.photo.deleteMany();

  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      name: 'Administrador Root',
      email: 'admin@aura.com',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });

  const photos = [
    {
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=2000',
      title: 'Aurora Boreal',
      location: 'Islândia',
      category: 'Landscape',
    },
    {
      url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=2000',
      title: 'Neon Nights',
      location: 'Tóquio, Japão',
      category: 'Urban',
    },
    {
      url: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&q=80&w=2000',
      title: 'O Rei da Savana',
      location: 'Quênia',
      category: 'Wildlife',
    },
  ];

  for (const photo of photos) {
    await prisma.photo.create({ data: photo });
  }

  const posts = [
    {
      title: "Madrugadas na Islândia",
      excerpt: "O que aprendi esperando o sol nascer em temperaturas abaixo de zero na praia de Reynisfjara.",
      content: "A Islândia é um lugar que testa sua paciência. Passei três noites esperando a luz perfeita...",
      image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1200",
      date: new Date(),
    },
    {
      title: "5 Locais Secretos em São Paulo",
      excerpt: "Uma lista curada de ângulos pouco explorados da selva de pedra que rendem cliques incríveis.",
      content: "São Paulo esconde belezas em meio ao caos. Dos telhados do centro às vilas escondidas...",
      image: "https://images.unsplash.com/photo-1512495039889-52a3b799c9bc?auto=format&fit=crop&q=80&w=1200",
      date: new Date(Date.now() - 86400000 * 2),
    },
    {
      title: "O Silêncio dos Alpes",
      excerpt: "Como a fotografia me ajudou a encontrar paz em meio à grandiosidade das montanhas suíças.",
      content: "Estar sozinho nas montanhas com uma câmera no ombro é uma terapia...",
      image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200",
      date: new Date(Date.now() - 86400000 * 5),
    }
  ];

  for (const post of posts) {
    await prisma.post.create({ data: post });
  }

  console.log('Populando configurações iniciais...');
  
  await prisma.homeConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      title1: "Aura",
      title2: "Photography",
      subtitle: "Fotógrafo de Paisagens & Vida",
      mainText: "Capturando a essência do cotidiano em luz e cor.",
      galleryTitle: "Trabalhos Selecionados",
      blogTitle: "Crônicas & Jornadas"
    }
  });

  await prisma.aboutConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      greeting: "Olá, eu sou o Diogo",
      titleNormal: "Um curioso por natureza,",
      titleStyled: "apaixonado por café",
      bio: "Paulistano de alma, encontro paz em caminhadas matinais e na luz que banha as ruas antes da cidade acordar. Sempre com um livro ou uma câmera por perto, busco a beleza no ordinário e nas histórias que as pessoas esquecem de contar.",
      years: "10+",
      equipment: "Leica M11 & Sony A7R V\n35mm Fixed Lens focus",
      address: "São Paulo, Brasil\nDisponível para projetos globais",
      linkText: "Minha história completa"
    }
  });

  await prisma.contactConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      titleNormal: "Vamos",
      titleStyled: "conversar",
      subtitle: "Aberto a patrocínios para expedições e projetos autorais",
      infoTitle: "Informações Diretas",
      infoDesc: "Se você tem interesse em patrocinar uma expedição, adquirir obras originais ou propor um projeto fotográfico, sinta-se à vontade para entrar em contato.",
      email: "contato@diogoalves.com"
    }
  });

  await prisma.footerConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      ctaTitle: "Interessado em apoiar uma expedição?",
      ctaDesc: "Estou sempre em busca de parceiros para patrocinar novas jornadas.",
      copyright: "Diogo Alves. Todos os direitos reservados.",
      tagline: "SÃO PAULO | TOKYO | ZURICH"
    }
  });

  console.log('Seed completo!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
