# Sistema de Comentarios - Documentación

## Descripción General

El sistema de comentarios permite a los usuarios agregar y visualizar comentarios en las solicitudes del sistema. Los comentarios incluyen información del autor (imagen, nombre, email) y fecha de creación.

## Componentes Creados

### 1. CommentSection (`/components/comment/comment-section.tsx`)

Componente principal que maneja la visualización y creación de comentarios.

**Props:**
- `comments: Comment[]` - Array de comentarios a mostrar
- `onAddComment: (content: string) => void` - Función para agregar un nuevo comentario
- `isLoading?: boolean` - Estado de carga para la creación de comentarios

**Características:**
- Lista de comentarios con información del autor
- Formulario para agregar nuevos comentarios
- Textarea con altura mínima de 100px y máxima de 200px
- Validación de contenido mínimo (10 caracteres)

### 2. useComments Hook (`/hooks/use-comments.ts`)

Hook personalizado para manejar la lógica de comentarios.

**Parámetros:**
- `requestId: string` - ID de la solicitud
- `enabled: boolean` - Si debe cargar los comentarios

**Retorna:**
- `comments: Comment[]` - Lista de comentarios
- `isLoading: boolean` - Estado de carga
- `isError: boolean` - Estado de error
- `isCreating: boolean` - Estado de creación
- `handleAddComment: (content: string) => void` - Función para agregar comentarios

## Integración en RequestForm

El componente `RequestForm` ha sido actualizado para incluir un sistema de tabs que separa:

1. **Información de la Solicitud** - Formulario principal
2. **Comentarios** - Sección de comentarios

### Props Agregadas a RequestForm:

```typescript
interface RequestFormProps {
  // ... props existentes
  comments?: Comment[];
  onAddComment?: (content: string) => void;
  isLoadingComment?: boolean;
}
```

## Modelo de Datos

### Comment Interface (`/types/comment.model.ts`)

```typescript
export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}
```

## Ejemplo de Uso

### Uso Básico en un Componente

```typescript
import { useComments } from "@/hooks/use-comments";
import { RequestForm } from "@/components/request/request-form";

function MyComponent() {
  const {
    comments,
    isCreating,
    handleAddComment
  } = useComments({
    requestId: "request-id",
    enabled: true
  });

  return (
    <RequestForm
      // ... otras props
      comments={comments}
      onAddComment={handleAddComment}
      isLoadingComment={isCreating}
    />
  );
}
```

### Integración Completa

Ver el archivo `request-form-example.tsx` para un ejemplo completo de integración.

## API Endpoints Esperados

El hook `useComments` espera los siguientes endpoints:

### GET `/comments/request/{requestId}`
Obtiene todos los comentarios de una solicitud.

**Respuesta:**
```json
[
  {
    "id": "comment-id",
    "content": "Contenido del comentario",
    "createdAt": "2024-01-01T00:00:00Z",
    "author": {
      "id": "user-id",
      "name": "Nombre Usuario",
      "email": "usuario@email.com",
      "image": "url-imagen"
    }
  }
]
```

### POST `/comments`
Crea un nuevo comentario.

**Body:**
```json
{
  "content": "Contenido del comentario",
  "requestId": "request-id"
}
```

**Respuesta:**
```json
{
  "id": "new-comment-id",
  "content": "Contenido del comentario",
  "createdAt": "2024-01-01T00:00:00Z",
  "author": {
    "id": "user-id",
    "name": "Nombre Usuario",
    "email": "usuario@email.com",
    "image": "url-imagen"
  }
}
```

## Características de UI

### Diseño de Comentarios
- **Avatar del usuario** con imagen o iniciales
- **Nombre del autor** en negrita
- **Email del autor** en texto secundario
- **Fecha de creación** formateada
- **Contenido del comentario** con formato preservado

### Formulario de Nuevo Comentario
- **Textarea responsiva** con altura mínima de 100px y máxima de 200px
- **Validación** de contenido mínimo (10 caracteres)
- **Botón de envío** con estado de carga
- **Contador de caracteres** (opcional)

### Estados de Carga
- **Skeleton loading** para comentarios
- **Botón deshabilitado** durante la creación
- **Indicador de carga** en el botón de envío

## Personalización

### Estilos
Los componentes utilizan Tailwind CSS y pueden ser personalizados modificando las clases CSS en los archivos correspondientes.

### Validaciones
Las validaciones pueden ser modificadas en el componente `CommentSection`:
- Longitud mínima del comentario
- Longitud máxima del comentario
- Formato del contenido

### Formato de Fecha
El formato de fecha puede ser personalizado en la función `formatDate` del componente `CommentSection`.

## Consideraciones de Rendimiento

- Los comentarios solo se cargan cuando el modal está abierto (`enabled: isOpen`)
- Se utiliza `React Query` para cache y gestión de estado
- Las mutaciones invalidan automáticamente el cache para mantener los datos actualizados
- Se implementa `staleTime` de 5 minutos para reducir llamadas innecesarias

## Próximas Mejoras

1. **Edición de comentarios** - Permitir editar comentarios existentes
2. **Eliminación de comentarios** - Permitir eliminar comentarios (con permisos)
3. **Respuestas a comentarios** - Sistema de comentarios anidados
4. **Menciones** - Mencionar a otros usuarios en comentarios
5. **Archivos adjuntos** - Permitir adjuntar archivos a comentarios
6. **Notificaciones** - Notificar cuando se agregan nuevos comentarios