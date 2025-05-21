# Contribuir a ProjectFlow

¡Gracias por tu interés en contribuir a ProjectFlow! Este documento proporciona pautas y normas para contribuir al proyecto.

## Código de Conducta

Este proyecto y todos sus participantes están regidos por nuestro [Código de Conducta](CODE_OF_CONDUCT.md). Al participar, se espera que respetes este código.

## Cómo puedo contribuir?

### Reportando Bugs

Los bugs se registran como issues en GitHub. Antes de crear un reporte de bug, verifica si el problema ya ha sido reportado.

**Antes de Enviar un Reporte de Bug**

- Verifica la documentación para asegurarte de que estás utilizando correctamente la funcionalidad.
- Busca entre los issues existentes para ver si el bug ya ha sido reportado.
- Asegúrate de que estás utilizando la última versión del software.

**Cómo Enviar un Buen Reporte de Bug**

- **Utiliza un título claro y descriptivo** que identifique el problema.
- **Describe los pasos exactos para reproducir el problema** en tantos detalles como sea posible.
- **Proporciona ejemplos específicos** para demostrar los pasos.
- **Describe el comportamiento que observaste** después de seguir los pasos.
- **Explica qué comportamiento esperabas ver** y por qué.
- **Incluye capturas de pantalla** si son relevantes y ayudan a explicar el problema.

### Sugiriendo Mejoras

Las sugerencias de mejoras también se manejan a través de issues en GitHub.

**Antes de Enviar una Sugerencia de Mejora**

- Verifica si la misma mejora ya ha sido sugerida.
- Determina en qué parte del proyecto se aplicaría la mejora.
- Considera si tu idea se alinea con el alcance y objetivos del proyecto.

**Cómo Enviar una Buena Sugerencia de Mejora**

- **Utiliza un título claro y descriptivo** para la issue.
- **Proporciona una descripción detallada de la mejora** y sus beneficios.
- **Explica el comportamiento actual** y por qué no es óptimo.
- **Explica qué comportamiento te gustaría ver** en su lugar.
- **Explica por qué esta mejora sería útil** para la mayoría de los usuarios.

### Pull Requests

- Rellena la plantilla de pull request proporcionada.
- No incluyas números de issues en el título del PR.
- Sigue las guías de estilo y convenciones del proyecto.
- Mantén cada PR enfocado en una sola funcionalidad o corrección.
- Incluye pruebas relevantes si es posible.
- Actualiza la documentación según sea necesario.

## Guías de Estilo

### Convenciones de Git

* Utiliza [Conventional Commits](https://www.conventionalcommits.org/) para los mensajes de commit.
* Preferiblemente, utiliza rebase para mantener un historial limpio y lineal.
* Mantén los commits pequeños y centrados en un solo cambio.

### Estilo de Código JavaScript/TypeScript

* Utilizamos ESLint para el linting y Prettier para el formateo.
* El código debe pasar todas las reglas de linting sin errores ni advertencias.
* Configura tu editor para utilizar Prettier con nuestras reglas.

```typescript
// Ejemplo de estilo de código
function ejemploDeFuncion(parametro: string): string {
  // Utiliza 2 espacios para la indentación
  const variable = 'valor';
  
  // Comentarios descriptivos para funcionalidad compleja
  if (condicion) {
    return 'resultado';
  }
  
  return parametro;
}
```

### Nombrado

* **Variables y funciones**: camelCase
* **Clases y tipos**: PascalCase
* **Constantes**: UPPER_SNAKE_CASE
* **Componentes React**: PascalCase
* **Archivos de componentes**: PascalCase
* **Archivos de utilidades**: camelCase

### Documentación

* Utiliza JSDoc para documentar funciones y clases.
* Mantén el README y otros documentos actualizados con cualquier cambio.
* Utiliza lenguaje claro y conciso.

## Proceso de Desarrollo

1. Haz fork del repositorio
2. Clona tu fork: `git clone https://github.com/tu-usuario/projectflow.git`
3. Crea una rama para tu feature: `git checkout -b feature/amazing-feature`
4. Haz commit de tus cambios: `git commit -m 'feat: agregar una funcionalidad increíble'`
5. Haz push a la rama: `git push origin feature/amazing-feature`
6. Abre un Pull Request

## Configuración del Entorno de Desarrollo

1. Asegúrate de tener Node.js 18.0+ y npm/yarn instalados
2. Instala las dependencias: `npm install`
3. Ejecuta el servidor de desarrollo: `npm run dev`
4. Ejecuta los tests: `npm test`

## Recursos Adicionales

* [Documentación de Next.js](https://nextjs.org/docs)
* [Documentación de Prisma](https://www.prisma.io/docs)
* [Documentación de Tailwind CSS](https://tailwindcss.com/docs)

¡Gracias por contribuir a ProjectFlow!
