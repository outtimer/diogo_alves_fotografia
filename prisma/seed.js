const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Limpando banco de dados...');
  await prisma.post.deleteMany();
  await prisma.photo.deleteMany();

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
