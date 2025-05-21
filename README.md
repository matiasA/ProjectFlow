# IA Chat Projects

Gestor de proyectos de chats con IA para organizar y contextualizar de manera óptima conversaciones con modelos de lenguaje.

## Características

- **Organización jerárquica**: Proyectos > Carpetas > Chats
- **Múltiples proveedores de IA**: Compatible con OpenAI, Anthropic, Mistral y más
- **Gestión de contexto**: Personaliza el contexto para cada chat
- **Historial completo**: Guarda y busca en todo tu historial de conversaciones
- **Interfaz moderna**: UI intuitiva y responsive

## Tecnologías

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: API Routes de Next.js
- **Base de datos**: SQLite (Prisma ORM)
- **Autenticación**: NextAuth.js

## Requisitos previos

- Node.js 18.0 o superior
- npm o yarn

## Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/tu-usuario/ia-chat-projects.git
cd ia-chat-projects
```

2. Instala las dependencias:

```bash
npm install
# o
yarn install
```

3. Configura las variables de entorno:

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

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
```

4. Inicializa la base de datos:

```bash
npx prisma migrate dev
```

5. Inicia el servidor de desarrollo:

```bash
npm run dev
# o
yarn dev
```

6. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Uso

### Autenticación

Para el desarrollo, puedes usar las credenciales de prueba:
- Email: user@example.com
- Password: password

### Crear un proyecto nuevo

1. Inicia sesión en la aplicación
2. Haz clic en "Nuevo proyecto" en el dashboard
3. Asigna un nombre y descripción opcional

### Crear un chat nuevo

1. Haz clic en "Nuevo chat" en la barra lateral
2. Selecciona el proyecto y carpeta (opcional)
3. Configura el proveedor de IA y el contexto (opcional)
4. ¡Comienza a chatear!

## Estructura del proyecto

```
ia-chat-projects/
├── app/                # Directorio principal de Next.js App Router
│   ├── api/            # API Routes
│   ├── auth/           # Páginas de autenticación
│   ├── chat/           # Páginas de chat
│   ├── components/     # Componentes reutilizables
│   ├── contexts/       # Contextos de React
│   └── ...
├── prisma/             # Esquema y migraciones de Prisma
├── public/             # Archivos estáticos
└── ...
```

## Licencia

ProjectFlow es software libre y de código abierto, licenciado bajo la [Licencia Apache 2.0](LICENSE).

### ¿Qué significa esto para ti?

- ✅ Puedes usar ProjectFlow libremente para cualquier propósito
- ✅ Puedes modificar el código fuente
- ✅ Puedes distribuir el software
- ✅ Puedes usar el software comercialmente
- ✅ Puedes patentar tus modificaciones

La única condición es que debes incluir una copia de la licencia en cualquier distribución del software.

## Contribuir

¡Las contribuciones son bienvenidas! Hay varias formas de contribuir a ProjectFlow:

### Reportar problemas
- Usa el [sistema de issues](https://github.com/tu-usuario/projectflow/issues)
- Incluye pasos para reproducir el problema
- Describe el comportamiento esperado vs el actual

### Enviar mejoras
1. Haz fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guía de desarrollo
1. Asegúrate de tener Node.js 18.0+ instalado
2. Instala las dependencias: `npm install`
3. Ejecuta los tests: `npm test`
4. Sigue las [guías de estilo de código](CONTRIBUTING.md)

### Código de conducta
Por favor, lee nuestro [Código de Conducta](CODE_OF_CONDUCT.md) para mantener un ambiente respetuoso y colaborativo.

## Agradecimientos

- A todos los contribuidores que han ayudado a hacer ProjectFlow mejor
- A la comunidad de código abierto por su inspiración y herramientas
