const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createUser() {
  const user = await prisma.user.create({
    data: {
      name: 'Matias',
      email: 'matiasprogramador@gmail.com',
    },
  });
  
  console.log('Usuario creado:', user);
  
  await prisma.$disconnect();
}

createUser()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });