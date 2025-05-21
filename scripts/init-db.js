const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

async function initDatabase() {
  console.log('Iniciando proceso de inicialización de la base de datos...');
  
  // Verificar si existe el archivo de la base de datos
  const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
  if (fs.existsSync(dbPath)) {
    console.log('Archivo de base de datos encontrado:', dbPath);
    
    // Hacer una copia de seguridad por si acaso
    const backupPath = `${dbPath}.backup-${Date.now()}`;
    fs.copyFileSync(dbPath, backupPath);
    console.log('Copia de seguridad creada:', backupPath);
    
    // Intentar eliminar el archivo actual si está corrupto
    fs.unlinkSync(dbPath);
    console.log('Archivo de base de datos eliminado para recreación');
  } else {
    console.log('No se encontró archivo de base de datos, se creará uno nuevo');
  }
  
  try {
    // Ejecutar prisma migrate para recrear la base de datos
    console.log('Ejecutando prisma migrate para recrear la base de datos...');
    execSync('npx prisma migrate dev --name init', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    console.log('Migración completada. Intentando conectar con Prisma...');
    
    // Verificar la conexión
    const prisma = new PrismaClient();
    await prisma.$connect();
    console.log('Conexión exitosa a la base de datos');
    
    // Crear usuario de prueba
    console.log('Creando usuario de prueba...');
    const userData = {
      name: 'Matias',
      email: 'matiasprogramador2@gmail.com',
      password: 'micontraseña123'
    };
    
    const bcrypt = require('bcrypt');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    // Eliminar usuario si existe
    await prisma.user.deleteMany({
      where: { email: userData.email }
    });
    
    // Crear nuevo usuario
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
      },
    });
    
    console.log('Usuario creado exitosamente:', {
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHashed: true,
    });
    
    await prisma.$disconnect();
    console.log('Proceso completado con éxito');
  } catch (error) {
    console.error('Error durante la inicialización:', error);
  }
}

initDatabase()
  .catch((e) => {
    console.error('Error general:', e);
    process.exit(1);
  });