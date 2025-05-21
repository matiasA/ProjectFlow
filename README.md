# ProjectFlow

> Organiza, gestiona y potencia tus conversaciones con IA.

## 🚀 Visión General

ProjectFlow es un gestor de proyectos especializado para conversaciones con inteligencia artificial que te permite organizar, contextualizar y aprovechar al máximo tus interacciones con modelos de lenguaje avanzados.

## ✨ Características Principales

- **🗂️ Organización Jerárquica**: Sistema intuitivo de Proyectos > Carpetas > Chats
- **🔄 Múltiples Proveedores de IA**: Compatibilidad con OpenAI, Anthropic, Mistral, LMStudio y más
- **🧠 Gestión de Contexto**: Personaliza y preserva el contexto para cada conversación
- **📚 Historial Inteligente**: Almacenamiento y búsqueda en tu historial completo de conversaciones
- **💻 Interfaz Moderna**: UI intuitiva, responsive y centrada en la experiencia de usuario

## 🛠️ Tecnologías

- **Frontend**: Next.js 15+, React 19, TailwindCSS 4
- **Backend**: API Routes de Next.js
- **Base de datos**: SQLite con Prisma ORM
- **Autenticación**: NextAuth.js

## ⚙️ Requisitos Previos

- Node.js 18.0 o superior
- npm o yarn

## 📋 Instalación

### 1. Clona el repositorio:

```bash
git clone https://github.com/tu-usuario/projectflow.git
cd projectflow
```

### 2. Instala las dependencias:

```bash
npm install
# o
yarn install
```

### 3. Configura las variables de entorno:

Crea un archivo `.env` en la raíz del proyecto:

```
# Base de datos
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secreto-aqui"

# Providers de OAuth (opcional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_ID=""
GITHUB_SECRET=""

# LLM Providers
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
MISTRAL_API_KEY=""
LMSTUDIO_API_ENDPOINT="http://localhost:1234/v1"
```

### 4. Inicializa la base de datos:

```bash
npx prisma migrate dev
```

### 5. Inicia el servidor de desarrollo:

```bash
npm run dev
# o
yarn dev
```

### 6. Accede a la aplicación:

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📱 Guía de Uso

### Acceso

Para desarrollo, puedes usar las credenciales de prueba:
- **Email**: user@example.com
- **Password**: password

### Crear un Proyecto

1. Inicia sesión en la aplicación
2. Haz clic en "Nuevo proyecto" en el dashboard
3. Asigna un nombre y descripción opcional

### Gestionar Conversaciones

1. Haz clic en "Nuevo chat" en la barra lateral
2. Selecciona el proyecto y carpeta (opcional)
3. Configura el proveedor de IA y el contexto
4. ¡Comienza a chatear!

## 📂 Estructura del Proyecto

```
projectflow/
├── app/                # Next.js App Router
│   ├── api/            # API Routes
│   ├── auth/           # Autenticación
│   ├── chat/           # Páginas de chat
│   ├── components/     # Componentes UI
│   └── contexts/       # Contextos React
├── prisma/             # ORM y migraciones
├── public/             # Assets estáticos
└── ...
```

## 📄 Licencia

ProjectFlow es software libre y de código abierto, licenciado bajo la [Licencia Apache 2.0](LICENSE).

### ¿Qué significa esto para ti?

- ✅ Puedes usar ProjectFlow libremente para cualquier propósito
- ✅ Puedes modificar el código fuente
- ✅ Puedes distribuir el software
- ✅ Puedes usar el software comercialmente
- ✅ Puedes patentar tus modificaciones

La única condición es que debes incluir una copia de la licencia en cualquier distribución del software.

## 👥 Contribuir

¡Las contribuciones son bienvenidas! Hay varias formas de contribuir a ProjectFlow:

### �� Reportar Problemas
- Usa el [sistema de issues](https://github.com/tu-usuario/projectflow/issues)
- Incluye pasos para reproducir el problema
- Describe el comportamiento esperado vs el actual

### 🔧 Enviar Mejoras
1. Haz fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### 🧪 Guía de Desarrollo
1. Asegúrate de tener Node.js 18.0+ instalado
2. Instala las dependencias: `npm install`
3. Ejecuta los tests: `npm test`
4. Sigue las [guías de estilo de código](CONTRIBUTING.md)

### 🤝 Código de Conducta
Por favor, lee nuestro [Código de Conducta](CODE_OF_CONDUCT.md) para mantener un ambiente respetuoso y colaborativo.

## 🙏 Agradecimientos

- A todos los contribuidores que han ayudado a hacer ProjectFlow mejor
- A la comunidad de código abierto por su inspiración y herramientas

## 🔗 Enlaces

- [Sitio Web](https://projectflow.uno)
- [Documentación](https://projectflow.uno/docs)
- [GitHub](https://github.com/tu-usuario/projectflow)

---

<p align="center">
  Desarrollado con ❤️ por el equipo de ProjectFlow
</p>
