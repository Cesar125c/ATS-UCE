# Guía de contribución - ATS-UCE

Este documento define las reglas técnicas para trabajar en el repositorio GitHub del proyecto ATS-UCE, sistema orientado a la contratación de personal docente para la Universidad Central del Ecuador.

## 1. Objetivo

Establecer un flujo de trabajo ordenado para que los integrantes del equipo puedan desarrollar, revisar e integrar cambios sin afectar las ramas principales del proyecto.

## 2. Ramas principales

El repositorio maneja las siguientes ramas:

- `main`: rama estable del proyecto. Contiene la versión final o validada.
- `QA`: rama de pruebas. Recibe cambios desde `DEV` para validación.
- `DEV`: rama de integración del desarrollo. Recibe cambios desde ramas temporales.
- `feature/*`: ramas para nuevas funcionalidades.
- `fix/*`: ramas para corrección de errores.
- `docs/*`: ramas para documentación.
- `devops/*`: ramas para configuración técnica del repositorio, despliegue o automatización.

## 3. Flujo oficial de ramas

El flujo definido para el proyecto es:

```txt
feature/* → DEV → QA → main