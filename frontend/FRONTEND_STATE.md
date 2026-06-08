# ATS-UCE Frontend — Estado Completo del Proyecto

> **Fecha del análisis:** 7 de junio de 2026
> **Propósito:** Documentar el estado actual del frontend para que cualquier LLM o desarrollador pueda retomar el trabajo sin ambigüedad.

---

## 1. Resumen Ejecutivo

El frontend de **ATS-UCE** (Sistema de Reclutamiento Docente — Universidad Central del Ecuador) es una aplicación web desarrollada con **React 19 + TypeScript 6 + Vite 8 + Tailwind CSS v4**. Se encuentra en **etapa temprana de desarrollo**: la página de inicio con registro de usuarios es la única funcional completamente implementada. Las 3 páginas de rol (Applicant, HumanResources, Administrator) son placeholders. No usa React Router — el ruteo es manual con `window.location`.

**Desarrollador principal:** Jonathan Villarreal
**Stack completo:** React 19 → Vite 8 → Tailwind v4 → Clerk Auth → Backend API (FastAPI)

---

## 2. Tech Stack Detallado

| Capa | Tecnología | Versión | Propósito |
|------|-----------|---------|-----------|
| **Framework** | React | ^19.2.5 | UI declarativa |
| **Lenguaje** | TypeScript | ~6.0.2 | Tipado estático |
| **Build** | Vite | ^8.0.16 | Dev server + bundler |
| **CSS** | Tailwind CSS | ^4.3.0 | Utilidades de estilo |
| **Auth** | Clerk (`@clerk/react`) | ^6.7.0 | Autenticación + sesiones |
| **Formularios** | react-hook-form | ^7.76.0 | Manejo de formularios |
| **Iconos** | lucide-react | ^0.408.0 | Iconos SVG |
| **Linting** | ESLint | ^10.2.1 | Calidad de código |
| **Testing** | Vitest + Playwright + Storybook | ^4.1.8 / ^1.60.0 / ^10.4.2 | Tests + documentación visual |
| **Docker** | Node 20-alpine | — | Contenedor dev |
| **Path alias** | `@/` → `./src/` | — | Imports simplificados |

**Ausencias notables:**
- React Router (no instalado)
- Redux / Zustand / Context API (manejo de estado global)
- Axios (usa fetch nativo)
- shadcn/ui, MUI, Chakra (todos los componentes UI son custom)
- SCSS / CSS Modules
- Tests unitarios (no existe ningún `.test.ts`)

---

## 3. Estructura Completa de Directorios

```
frontend/
├── .dockerignore
├── .env                              # VITE_CLERK_PUBLISHABLE_KEY (test mode)
├── .gitignore
├── .storybook/
│   ├── main.ts                       # Config Storybook (stories, addons)
│   └── preview.tsx                   # Theme + a11y test (todo)
├── Dockerfile                        # node:20-alpine, expone 5173
├── eslint.config.js
├── index.html                        # Entry point HTML
├── package.json                      # Dependencias + scripts
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── README.md                         # Boilerplate Vite
├── src/
│   ├── App.tsx                       # Router manual + layout raíz
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components/
│   │   ├── home/
│   │   │   ├── CTASection.tsx        # CTA oscuro con botón
│   │   │   ├── HeroSection.tsx       # Hero 2-columnas (info + formulario)
│   │   │   └── RegisterForm.tsx      # Formulario registro con react-hook-form
│   │   ├── layout/
│   │   │   ├── Footer.tsx            # Footer oscuro con copyright
│   │   │   └── Header.tsx            # Header azul + Clerk Auth buttons
│   │   └── ui/
│   │       ├── Alert.tsx             # Alertas con ícono (success/error/warning/info)
│   │       ├── Badge.tsx             # Etiquetas con 6 variantes de color
│   │       ├── Breadcrumb.tsx        # Migas de pan con ChevronRight
│   │       ├── Button.tsx            # Botón 4 variantes, 3 tamaños + loading
│   │       ├── Card.tsx              # Contenedor blanco con sombra
│   │       ├── Checkbox.tsx          # Checkbox con label/error/help
│   │       ├── index.ts              # Barrel export de todos los UI
│   │       ├── Input.tsx             # Input text con label/error/help
│   │       ├── Modal.tsx             # Modal con backdrop + X close
│   │       ├── Radio.tsx             # Radio button con label/error/help
│   │       ├── README.md             # Documentación en español del design system
│   │       ├── Select.tsx            # Dropdown con label/error/help
│   │       ├── Spinner.tsx           # SVG spinner (3 tamaños, 3 colores)
│   │       └── Textarea.tsx          # Textarea con label/error/help
│   ├── hooks/
│   │   └── useSignUpWithRole.ts      # Custom hook: signUp Clerk + POST role
│   ├── index.css                     # @import "tailwindcss"
│   ├── main.tsx                      # Entry point React (ClerkProvider condicional)
│   ├── pages/
│   │   ├── Administrator.tsx         # Placeholder para rol authorities
│   │   ├── Applicant.tsx             # Placeholder para rol applicant
│   │   ├── Authorities.tsx           # VACÍO (0 bytes, no se usa)
│   │   ├── Home.tsx                  # Landing page completa
│   │   └── HumanResources.tsx        # Placeholder para rol human_resources
│   ├── services/
│   │   └── userService.ts            # createUserWithRole() — POST /api/users/set-role
│   └── stories/                      # Storybook boilerplate (archivos default)
├── tsconfig.app.json                 # Config TS para la app
├── tsconfig.json                     # Config TS raíz
├── tsconfig.node.json                # Config TS para tooling
├── vite.config.ts                    # Config Vite + React + Tailwind + alias
└── vitest.shims.d.ts                 # Tipos para vitest browser
```

**Total:** ~76 archivos (excluyendo `node_modules`), ~964 KB de código fuente.

---

## 4. Sistema de Ruteo (App.tsx)

**NO usa React Router.** El ruteo es manual con `window.location`:

```typescript
// App.tsx — lógica central de ruteo
const path = window.location.pathname;

// Si está autenticado y en "/", redirige según rol
if (isSignedIn && path === "/") {
  const role = user.publicMetadata.role;
  if (role === "applicant") window.location.replace("/applicant");
  if (role === "human_resources") window.location.replace("/human-resources");
  if (role === "authorities") window.location.replace("/administrator");
}

// Mapeo directo de rutas
if (path === "/applicant") return <Applicant />;
if (path === "/human-resources") return <HumanResources />;
if (path === "/administrator") return <Administrator />;
return <Home />; // fallback (incluye "/")
```

**Rutas registradas:**

| Ruta | Componente | Estado | Descripción |
|------|-----------|--------|-------------|
| `/` | `Home.tsx` | ✅ Completo | Landing page con hero, registro, CTA |
| `/applicant` | `Applicant.tsx` | ⏳ Placeholder | "Welcome Applicant" |
| `/human-resources` | `HumanResources.tsx` | ⏳ Placeholder | "Welcome Human Resources" |
| `/administrator` | `Administrator.tsx` | ⏳ Placeholder | "Welcome Administrator" |
| — | `Authorities.tsx` | ❌ Vacío | Archivo de 0 bytes, no importado en ninguna parte |

---

## 5. Flujo de Autenticación — Clerk

### 5.1 Configuración

```env
# .env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_c3RyaWtpbmctdGlnZXItNjMuY2xlcmsuYWNjb3VudHMuZGV2JA
```

En `main.tsx`, si la variable no existe, se muestra un mensaje de error y no se renderiza la app.

### 5.2 Estado no autenticado

- **Header** muestra `<SignInButton />` y `<SignUpButton />` de Clerk
- **HeroSection** muestra el **RegisterForm** en la columna derecha

### 5.3 RegisterForm (componente de registro)

```typescript
// Interfaz del formulario
interface RegisterFormData {
  firstName: string;
  lastName: string;
  role: "applicant" | "hr_staff" | "authorities";
  email: string;
  password: string;
  confirmPassword: string;
}
```

**Validaciones:**
- `email`: requerido, formato email, si role es `hr_staff` o `authorities` debe terminar en `@uce.edu.ec`
- `password`: mínimo 8 caracteres
- `confirmPassword`: debe coincidir con password
- Todos los campos son requeridos

**Tecnología:** `react-hook-form` con `useForm` + `handleSubmit`

### 5.4 useSignUpWithRole (custom hook)

```typescript
// hook: src/hooks/useSignUpWithRole.ts
const { signUpUser, error, isLoading } = useSignUpWithRole();

// Flujo interno:
// 1. signUp.create({ emailAddress, password, firstName, lastName })
// 2. POST /api/users/set-role { clerkUserId, role }
// 3. signUp.prepareEmailAddressVerification()
```

Retorna `{ signUpUser, error, isLoading }` para manejo de estados en UI.

### 5.5 Estado autenticado

- **Header** muestra `<UserButton />` de Clerk
- **App.tsx** redirige automáticamente de `"/"` a la ruta correspondiente al rol
- El rol se lee de `user.publicMetadata.role`

---

## 6. Design System (UI Components)

12 componentes atómicos, todos **100% custom** (sin librerías externas de UI).

### 6.1 Catálogo

| Componente | Archivo | Variantes | Props clave |
|-----------|---------|-----------|-------------|
| **Button** | `Button.tsx` | primary / secondary / outline / danger | `isLoading`, `fullWidth`, `size` (sm/md/lg) |
| **Input** | `Input.tsx` | — | `label`, `error`, `helpText`, `fullWidth` |
| **Select** | `Select.tsx` | — | `label`, `error`, `helpText`, `options[]`, `fullWidth` |
| **Textarea** | `Textarea.tsx` | — | `label`, `error`, `helpText`, `fullWidth` |
| **Checkbox** | `Checkbox.tsx` | — | `label`, `error`, `helpText` |
| **Radio** | `Radio.tsx` | — | `label`, `error`, `helpText` |
| **Modal** | `Modal.tsx` | sm / md / lg (size) | `isOpen`, `onClose`, `title`, `footer` |
| **Alert** | `Alert.tsx` | success / error / warning / info | `title`, `dismissible`, `onClose` |
| **Badge** | `Badge.tsx` | default / cyan / blue / green / red / yellow | `size` (sm/md/lg) |
| **Breadcrumb** | `Breadcrumb.tsx` | — | `items: [{label, href?, onClick?}]` |
| **Card** | `Card.tsx` | — | `children` + `className` |
| **Spinner** | `Spinner.tsx` | 3 tamaños, 3 colores | `size`, `color` |

### 6.2 Convenciones de diseño

- **Barrel export:** `src/components/ui/index.ts` re-exporta todos los componentes
- **Atributos nativos:** Todos los componentes de formulario extienden los atributos HTML nativos (`InputHTMLAttributes`, `SelectHTMLAttributes`, etc.)
- **Path alias:** `@/components/ui/Button`
- **Tailwind v4:** usa la sintaxis `@import "tailwindcss"` en `index.css` (sin archivo `tailwind.config.js`)
- **Colores primarios:** `cyan-600` / `cyan-700` para focuses, bordes activos y acciones principales
- **Estilo de error:** `red-500` para textos de error, `red-300` para bordes
- **Tipografía:** texto `sm` (14px) para labels, texto `base` (16px) para inputs

---

## 7. Servicios y API

### `userService.ts` — único servicio del frontend

```typescript
export async function createUserWithRole(
  signUp: SignUpResource,
  data: RegisterFormData
): Promise<void> {
  // 1. Crea usuario en Clerk
  await signUp.create({
    emailAddress: data.email,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
  });

  // 2. POST al backend para asignar rol
  await fetch("/api/users/set-role", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clerkUserId: signUp.createdUserId,
      role: data.role,
    }),
  });
}
```

### Endpoint esperado del backend

```
POST /api/users/set-role
Content-Type: application/json

{
  "clerkUserId": "user_abc123",
  "role": "applicant"
}
```

**Nota:** Este es el **único** punto de integración con el backend en el frontend actual.

---

## 8. Configuraciones Clave

### `vite.config.ts`

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    browser: { provider: "playwright", enabled: true, name: "chromium" },
    setupFiles: "./src/stories/.storybook/preview.tsx",
  },
});
```

### `tsconfig.app.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "verbatimModuleSyntax": true,
    "erasableSyntaxOnly": true,
    "jsx": "react-jsx",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

### Scripts de `package.json`

| Script | Comando | Propósito |
|--------|---------|-----------|
| `dev` | `vite` | Servidor de desarrollo |
| `build` | `tsc -b && vite build` | Build producción con typecheck |
| `lint` | `eslint .` | Linting |
| `preview` | `vite preview` | Preview del build |
| `storybook` | `storybook dev -p 6006` | Servidor Storybook |
| `build-storybook` | `storybook build` | Build Storybook |

---

## 9. Testing y Documentación

| Tipo | Estado | Detalle |
|------|--------|---------|
| **Storybook** | ⚠️ Configurado | `.storybook/main.ts` + `preview.tsx` existen. Las stories son boilerplate default (Button, Header, Page). |
| **Vitest** | ⚠️ Configurado | Integrado con Playwright (Chromium). No hay tests escritos. |
| **Unit tests** | ❌ **No existen** | Cero archivos `.test.ts` o `.spec.ts` en el proyecto. |
| **Component README** | ✅ Completo | `src/components/ui/README.md` — 8.9 KB de documentación en español con ejemplos de cada componente UI. |
| **Project README** | ⚠️ Default | `README.md` es el boilerplate de Vite, no personalizado para ATS-UCE. |

### Addons de Storybook configurados

- `@storybook/addon-a11y` (accesibilidad, configurado como `test: 'todo'`)
- `@storybook/addon-docs` (documentación)
- `@storybook/addon-mcp` (MCP protocol)
- `@chromatic-com/storybook` (Chromattic visual testing)

---

## 10. Git History

**Rama activa:** `dev`
**Desarrollador principal:** Jonathan Villarreal (Villarreal Cardenas Jonathan Rolando)

| Commit | Fecha | Mensaje |
|--------|-------|---------|
| `8377500` | 2026-06-04 | Jonathan/frontend improvements (#77) |
| `f3d1712` | 2026-06-01 | Main pages |
| `fd7ac34` | 2026-05-21 | Form and Login |
| `208c0f1` | 2026-05-21 | Merge branch 'DEV' |
| `d8cd315` | 2026-05-21 | Home |
| `6160465` | 2026-05-21 | Initial DevOps project structure |
| `256d7d2` | 2026-05-20 | organs |

---

## 11. Estado por Funcionalidad (Sprint Map)

| Funcionalidad | Estado | % | Notas |
|--------------|--------|---|-------|
| Landing page | ✅ Completo | 100% | Hero + RegisterForm + CTA + Header/Footer |
| Registro de usuarios | ✅ Completo | 100% | react-hook-form + Clerk + role assignment |
| Autenticación Clerk | ✅ Completo | 100% | SignIn, SignUp, UserButton, manejo de sesiones |
| Design System (UI) | ✅ Completo | 100% | 12 componentes atómicos documentados |
| Página Applicant | ⏳ Placeholder | 10% | Solo texto "Welcome Applicant" |
| Página HumanResources | ⏳ Placeholder | 10% | Solo texto "Welcome Human Resources" |
| Página Administrator | ⏳ Placeholder | 10% | Solo texto "Welcome Administrator" |
| Ruteo SPA | ❌ No implementado | 0% | Usa `window.location` (full page reloads) |
| Tests unitarios | ❌ No implementados | 0% | Ni un solo archivo de test |
| Storybook personalizado | ❌ No implementado | 0% | Stories son boilerplate default de Vite |
| Docker producción | ⏳ Parcial | 50% | Dockerfile existe, solo para desarrollo |
| Dashboard | ❌ No implementado | 0% | Sin conectar al backend |
| Evaluaciones | ❌ No implementado | 0% | Sin conectar al backend |
| Listado aplicaciones | ❌ No implementado | 0% | Sin conectar al backend |

---

## 12. Dependencias del Backend

El frontend actual espera del backend:

1. **`POST /api/users/set-role`** — Endpoint para asignar el rol del usuario después del registro en Clerk. Body: `{ clerkUserId: string, role: string }`.
2. **Endpoints futuros** (a conectar en siguientes sprints): POST /applications, GET /applications, GET /dashboard/stats, POST /evaluations, etc.

---

## 13. Observaciones y Riesgos Técnicos

1. **`Authorities.tsx` está vacío (0 bytes)** — Existe en disco pero no se importa en ninguna parte. `Administrator.tsx` es el componente que se usa para el rol `authorities`.

2. **No hay React Router** — El ruteo manual con `window.location.replace()` causa recargas completas de página. Esto es subóptimo para una SPA y debe migrarse a React Router.

3. **Tailwind CSS v4** — Usa la nueva sintaxis `@import "tailwindcss"` en CSS, sin archivo `tailwind.config.js`. Esto es el nuevo estándar en v4 pero puede causar confusión si alguien espera el archivo de configuración tradicional.

4. **Sin tests** — Cero cobertura de pruebas. Storybook está configurado pero con stories default. Vitest + Playwright están en las dependencias pero sin usar.

5. **Sin manejo de estado global** — No hay Redux, Zustand, ni Context API. La única fuente de estado global es Clerk (sesión del usuario). Toda la lógica de estado local está en los componentes.

6. **Un solo punto de integración backend** — `POST /api/users/set-role`. El resto de endpoints se conectarán cuando se implementen las páginas de rol.

7. **TypeScript 6.0** — Versión muy reciente. Puede tener diferencias de comportamiento con TS 5.x. Prestar atención a `erasableSyntaxOnly` que es nuevo en TS 6.

8. **`vitest.shims.d.ts`** — Archivo de tipos para Vitest browser mode. Solo contiene `/// <reference types="..." />`.

---

## 14. Mapa de Archivos y su Propósito

### Punto de entrada

| Archivo | Propósito |
|---------|-----------|
| `index.html` | HTML raíz con div#root, carga `/src/main.tsx` |
| `src/main.tsx` | Renderiza `<App />` dentro de `<ClerkProvider>` (condicional) |
| `src/App.tsx` | Router manual, layout raíz (Header + page + Footer) |

### Páginas

| Archivo | Propósito |
|---------|-----------|
| `src/pages/Home.tsx` | Landing page, renderiza HeroSection + CTASection + Footer |
| `src/pages/Applicant.tsx` | Placeholder: muestra "Welcome Applicant" |
| `src/pages/HumanResources.tsx` | Placeholder: muestra "Welcome Human Resources" |
| `src/pages/Administrator.tsx` | Placeholder: muestra "Welcome Administrator" |
| `src/pages/Authorities.tsx` | Vacío, no se usa |

### Componentes

| Archivo | Propósito |
|---------|-----------|
| `src/components/layout/Header.tsx` | Barra superior con logo + auth buttons |
| `src/components/layout/Footer.tsx` | Barra inferior con copyright |
| `src/components/home/HeroSection.tsx` | Sección hero 2 columnas (texto + formulario) |
| `src/components/home/RegisterForm.tsx` | Formulario de registro con react-hook-form |
| `src/components/home/CTASection.tsx` | Sección de call-to-action |
| `src/components/ui/Button.tsx` | Botón reutilizable con variantes |
| `src/components/ui/Input.tsx` | Input de texto con label y validación |
| `src/components/ui/Select.tsx` | Select desplegable |
| `src/components/ui/Textarea.tsx` | Área de texto |
| `src/components/ui/Checkbox.tsx` | Checkbox |
| `src/components/ui/Radio.tsx` | Radio button |
| `src/components/ui/Modal.tsx` | Modal con backdrop |
| `src/components/ui/Alert.tsx` | Alerta con ícono |
| `src/components/ui/Badge.tsx` | Etiqueta/Badge |
| `src/components/ui/Breadcrumb.tsx` | Migas de pan |
| `src/components/ui/Card.tsx` | Contenedor Card |
| `src/components/ui/Spinner.tsx` | Indicador de carga |

### Hooks y Servicios

| Archivo | Propósito |
|---------|-----------|
| `src/hooks/useSignUpWithRole.ts` | Hook que encapsula registro Clerk + asignación de rol |
| `src/services/userService.ts` | Función que llama a Clerk API + backend para crear usuario |

---

## 15. Consejos para el Próximo Desarrollador

1. **Para arrancar:** `npm run dev` (puerto 5173). Asegúrate de tener el `.env` con la clave de Clerk.
2. **Para build:** `npm run build` (corre `tsc -b` primero, TypeScript strict mode puede quejarse).
3. **Para storybook:** `npm run storybook` (puerto 6006).
4. **Para añadir una página nueva:** Crear en `src/pages/`, agregar ruta en `App.tsx`.
5. **Para migrar a React Router:** Instalar `react-router-dom`, reemplazar `window.location` en `App.tsx`.
6. **Para tests:** Vitest ya configurado con Playwright. Storybook tiene integración con `@storybook/addon-vitest`.
7. **Backend esperado:** `http://localhost:8000` (FastAPI con CORS configurado).

---

*Documento generado el 7 de junio de 2026 — ATS-UCE Project*
