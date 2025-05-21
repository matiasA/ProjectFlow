const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

async function checkDatabase() {
  // Verificar la ruta de la base de datos según el .env
  const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
  const dbUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/i);
  const dbUrl = dbUrlMatch ? dbUrlMatch[1] : null;
  
  console.log('URL de la base de datos en .env:', dbUrl);
  
  // Verificar si la ruta del archivo existe
  if (dbUrl && dbUrl.startsWith('file:')) {
    const dbPath = dbUrl.replace('file:./', '');
    const absolutePath = path.join(__dirname, '..', dbPath);
    
    console.log('Ruta absoluta de la base de datos:', absolutePath);
    console.log('¿El archivo existe?', fs.existsSync(absolutePath) ? 'Sí' : 'No');
    
    // Verificar permisos
    try {
      fs.accessSync(absolutePath, fs.constants.R_OK | fs.constants.W_OK);
      console.log('Permisos de lectura/escritura: OK');
    } catch (error) {
      console.log('Problema de permisos:', error.message);
    }
  }
  
  // Intentar conectar con Prisma
  try {
    const prisma = new PrismaClient();
    console.log('Intentando conectar a la base de datos...');
    
    // Intentar una consulta simple
    const userCount = await prisma.user.count();
    console.log('Conexión exitosa. Número de usuarios:', userCount);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error al conectar con Prisma:', error);
  }
}

checkDatabase()
  .catch((e) => {
    console.error('Error general:', e);
    process.exit(1);
  });