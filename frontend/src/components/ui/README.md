# Componentes UI - ATS-UCE

Librería de componentes reutilizables para el frontend de ATS-UCE.

## 📦 Componentes Disponibles

### Button
Botón versátil con múltiples variantes y tamaños.

```tsx
import { Button } from '@/components/ui'

export default function Example() {
  return (
    <>
      <Button variant="primary" size="md">
        Botón Primario
      </Button>
      
      <Button variant="secondary" size="lg">
        Botón Secundario
      </Button>
      
      <Button variant="outline">
        Botón Outline
      </Button>
      
      <Button variant="danger" isLoading>
        Cargando...
      </Button>
      
      <Button fullWidth>
        Botón a Ancho Completo
      </Button>
    </>
  )
}
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'danger' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `isLoading`: boolean (default: false)
- `fullWidth`: boolean (default: false)
- `disabled`: boolean
- `className`: string (para estilos adicionales)

---

### Badge
Etiquetas para categorizar o destacar información.

```tsx
import { Badge } from '@/components/ui'

export default function Example() {
  return (
    <>
      <Badge variant="cyan">Activo</Badge>
      <Badge variant="blue">Importante</Badge>
      <Badge variant="green">Completado</Badge>
      <Badge variant="red">Error</Badge>
      <Badge variant="yellow" size="sm">Pequeño</Badge>
    </>
  )
}
```

**Props:**
- `variant`: 'default' | 'cyan' | 'blue' | 'green' | 'red' | 'yellow'
- `size`: 'sm' | 'md' (default: 'md')

---

### Input
Campo de entrada con validación y etiquetas.

```tsx
import { Input } from '@/components/ui'
import { useState } from 'react'

export default function Example() {
  const [email, setEmail] = useState('')
  
  return (
    <>
      <Input
        type="email"
        label="Correo Electrónico"
        placeholder="ejemplo@uce.edu.ec"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      
      <Input
        type="text"
        label="Nombre"
        error="Este campo es requerido"
      />
      
      <Input
        type="password"
        label="Contraseña"
        helpText="Mínimo 8 caracteres"
      />
    </>
  )
}
```

**Props:**
- `label`: string
- `error`: string (muestra mensaje de error en rojo)
- `helpText`: string (muestra texto de ayuda)
- `fullWidth`: boolean (default: true)
- Todos los atributos HTML estándar de `<input>`

---

### Textarea
Área de texto para comentarios largos.

```tsx
import { Textarea } from '@/components/ui'

export default function Example() {
  return (
    <Textarea
      label="Comentarios"
      placeholder="Escriba sus comentarios aquí..."
      rows={4}
      error={errors.comments?.message}
    />
  )
}
```

**Props:**
- `label`: string
- `error`: string
- `helpText`: string
- `fullWidth`: boolean (default: true)
- Todos los atributos HTML estándar de `<textarea>`

---

### Select
Selector desplegable.

```tsx
import { Select } from '@/components/ui'

export default function Example() {
  return (
    <Select
      label="Seleccione un departamento"
      options={[
        { value: 'hr', label: 'Recursos Humanos' },
        { value: 'it', label: 'Tecnología' },
        { value: 'admin', label: 'Administración' },
      ]}
      onChange={(e) => console.log(e.target.value)}
    />
  )
}
```

**Props:**
- `label`: string
- `error`: string
- `helpText`: string
- `options`: Array<{ value: string; label: string }>
- `fullWidth`: boolean (default: true)

---

### Checkbox
Casilla de verificación.

```tsx
import { Checkbox } from '@/components/ui'

export default function Example() {
  return (
    <>
      <Checkbox
        label="Acepto los términos y condiciones"
        id="terms"
      />
      
      <Checkbox
        label="Suscribirse a notificaciones"
        helpText="Recibirá actualizaciones por correo"
      />
      
      <Checkbox
        label="Campo requerido"
        error="Debe aceptar esto"
      />
    </>
  )
}
```

**Props:**
- `label`: string
- `error`: string
- `helpText`: string
- Todos los atributos HTML estándar de `<input type="checkbox">`

---

### Radio
Botón de selección.

```tsx
import { Radio } from '@/components/ui'

export default function Example() {
  return (
    <>
      <Radio
        name="options"
        value="option1"
        label="Opción 1"
      />
      
      <Radio
        name="options"
        value="option2"
        label="Opción 2"
      />
    </>
  )
}
```

**Props:**
- `label`: string
- `error`: string
- `helpText`: string
- Todos los atributos HTML estándar de `<input type="radio">`

---

### Card
Contenedor con estilos predefinidos.

```tsx
import { Card } from '@/components/ui'

export default function Example() {
  return (
    <Card>
      <h3 className="text-xl font-bold">Título</h3>
      <p className="mt-2">Contenido de la tarjeta</p>
    </Card>
  )
}
```

**Props:**
- `className`: string (para estilos adicionales)

---

### Modal
Ventana modal para diálogos.

```tsx
import { Modal, Button } from '@/components/ui'
import { useState } from 'react'

export default function Example() {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Abrir Modal
      </Button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirmación"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
            >
              Aceptar
            </Button>
          </>
        }
      >
        <p>¿Está seguro de continuar?</p>
      </Modal>
    </>
  )
}
```

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string
- `footer`: ReactNode
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')

---

### Alert
Mensaje de alerta con diferentes tipos.

```tsx
import { Alert } from '@/components/ui'
import { useState } from 'react'

export default function Example() {
  const [showAlert, setShowAlert] = useState(true)
  
  return (
    <>
      {showAlert && (
        <Alert
          type="success"
          title="Éxito"
          onClose={() => setShowAlert(false)}
          dismissible
        >
          La operación se completó correctamente.
        </Alert>
      )}
      
      <Alert type="error" title="Error">
        Ocurrió un error al procesar la solicitud.
      </Alert>
      
      <Alert type="warning">
        Tenga cuidado con esta acción.
      </Alert>
      
      <Alert type="info">
        Esta es una información importante.
      </Alert>
    </>
  )
}
```

**Props:**
- `type`: 'success' | 'error' | 'warning' | 'info' (default: 'info')
- `title`: string
- `dismissible`: boolean (default: true)
- `onClose`: () => void

---

### Spinner
Indicador de carga.

```tsx
import { Spinner } from '@/components/ui'

export default function Example() {
  return (
    <>
      <Spinner size="sm" color="cyan" />
      <Spinner size="md" color="slate" />
      <Spinner size="lg" color="white" />
    </>
  )
}
```

**Props:**
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `color`: 'cyan' | 'slate' | 'white' (default: 'cyan')

---

### Breadcrumb
Navegación de migas de pan.

```tsx
import { Breadcrumb } from '@/components/ui'

export default function Example() {
  return (
    <Breadcrumb
      items={[
        { label: 'Inicio', href: '/' },
        { label: 'Candidatos', href: '/candidates' },
        { label: 'Juan Pérez' },
      ]}
    />
  )
}
```

**Props:**
- `items`: Array<{ label: string; href?: string; onClick?: () => void }>

---

## 🎯 Mejores Prácticas

1. **Importar desde el índice**: Siempre importa desde `@/components/ui` para mantener consistencia.

```tsx
// ✅ Correcto
import { Button, Input, Card } from '@/components/ui'

// ❌ Evitar
import Button from '@/components/ui/Button'
```

2. **Pasar props correctamente**: Usa todas las props disponibles para mayor funcionalidad.

```tsx
// ✅ Con validación
<Input
  label="Correo"
  type="email"
  error={errors.email}
  placeholder="ejemplo@uce.edu.ec"
/>

// ⚠️ Mínimo
<Input type="email" />
```

3. **Reutilizar estilos**: Aprovecha los estilos predefinidos mediante `className`.

```tsx
<Button className="text-lg" variant="primary">
  Botón Grande
</Button>
```

4. **Accessibility**: Todos los componentes incluyen soporte para accesibilidad (labels, ARIA, etc.).

---

## 📝 Notas

- Todos los componentes están optimizados con Tailwind CSS
- Soportan propiedades estándar HTML
- Incluyen indicadores visuales de estado (hover, focus, disabled, etc.)
- Son completamente tipados con TypeScript
