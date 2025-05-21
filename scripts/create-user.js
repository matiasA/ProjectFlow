const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function createUser() {
  // Datos del usuario que queremos crear
  const userData = {
    name: 'Matias',
    email: 'matiasprogramador2@gmail.com',
    password: 'micontraseña123' // La contraseña que queremos usar
  };
  
  // Crear hash de la contraseña con bcrypt
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);
  
  // Verificar si el usuario existe
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email }
  });
  
  let user;
  
  if (existingUser) {
    // Actualizar usuario existente con la nueva contraseña
    user = await prisma.user.update({
      where: { email: userData.email },
      data: { 
        name: userData.name,
        password: hashedPassword
      }
    });
    console.log('Usuario actualizado con nueva contraseña:', {
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHashed: true,
    });
  } else {
    // Crear nuevo usuario
    user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword, // Guardar la contraseña hasheada
      },
    });
    console.log('Usuario creado:', {
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHashed: true,
    });
  }
  
  await prisma.$disconnect();
}

createUser()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });