# Smoke Test — ATS-UCE Backend

**Fecha:** 2026-07-05

## Paso 1 — Health Check

```bash
curl -f http://localhost/api/v1/health
# {"status":"ok","version":"0.1.0","database":"connected"}
```

## Paso 2 — Listar vacantes (público)

```bash
curl -f http://localhost/api/v1/vacancies/
# [] o [{...}, ...]
```

## Paso 3 — Login y subir CV (applicant)

1. Abrir `http://localhost` en el navegador
2. Iniciar sesión con Clerk
3. Seleccionar rol `applicant`
4. Ir a "Postular" y subir un PDF
5. Verificar que la respuesta sea `201` y `status: "RECEIVED"`
6. Esperar ~5 segundos y verificar que el stepper avance a `HR_STAGE`

## Paso 4 — Dashboard HR

1. Cerrar sesión
2. Iniciar sesión con rol `human_resources`
3. Verificar que el dashboard cargue estadísticas
4. Verificar que la postulación del Paso 3 aparezca en el ranking

## Paso 5 — Flujo de aprobación completo

1. Desde HR, aprobar la postulación → debe pasar a `DEAN_STAGE`
2. Cerrar sesión, iniciar con rol `authorities`
3. Aprobar en `DEAN_STAGE` → `RECTOR_STAGE`
4. Aprobar en `RECTOR_STAGE` → `FINANCE_STAGE`
5. Aprobar en `FINANCE_STAGE` → `HIRED`
6. Verificar que el postulante vea `HIRED` en su stepper

## Resultado

| Paso | Estado |
|------|--------|
| 1. Health Check | |
| 2. Vacantes públicas | |
| 3. Submit + AI scoring | |
| 4. Dashboard HR | |
| 5. Flujo completo | |
