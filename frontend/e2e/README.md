# Pruebas E2E con Selenium + Cucumber

## Requisitos

- Node.js y las dependencias de `frontend` instaladas.
- Google Chrome.
- La aplicación en ejecución.

## Ejecutar

Desde `frontend`:

```bash
npm run dev
```

En otra terminal:

```bash
npm run test:e2e
```

Por defecto se usa `http://localhost:5173` y Chrome sin interfaz. Las variables
opcionales son:

```bash
E2E_BASE_URL=http://localhost npm run test:e2e
E2E_HEADLESS=false npm run test:e2e
E2E_TIMEOUT_MS=30000 npm run test:e2e
```

En PowerShell:

```powershell
$env:E2E_BASE_URL = "http://localhost"
npm run test:e2e
```

Los reportes HTML y JSON se crean en `e2e/reports/`. Si falla un escenario, la
captura de pantalla queda incrustada en el reporte HTML.
