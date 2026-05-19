import { prisma } from '../src/lib/prisma';

async function main() {
  try {
    const home = await prisma.homeConfig.findUnique({ where: { id: "default" } });
    console.log('HomeConfig:', home);
    
    const about = await prisma.aboutConfig.findUnique({ where: { id: "default" } });
    console.log('AboutConfig:', about);
  } catch (e) {
    console.error('Error fetching data:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
