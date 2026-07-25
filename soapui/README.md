# Pruebas de integración SoapUI — ATS-UCE

El proyecto `ATS-UCE-soapui-project.xml` prueba la API REST de FastAPI que se
ejecuta en `http://localhost:8000`. No contiene secretos ni modifica datos.

## Contenido

- `01 - Public and Security`: health, conexión con PostgreSQL, vacantes públicas,
  ausencia de JWT, JWT inválido y parámetros inválidos. Se ejecuta sin configurar
  usuarios.
- `02 - Authenticated Roles`: perfil y estado del postulante, prohibición de
  consultar el ranking, ranking y dashboard de RR. HH., y perfil de autoridad.

## Abrir en SoapUI

1. Instalar y abrir SoapUI Open Source (5.7.2 o posterior).
2. Elegir **File > Import Project**.
3. Seleccionar `ATS-UCE-soapui-project.xml`.
4. Ejecutar primero la suite `01 - Public and Security`.

También se puede regenerar una interfaz desde el contrato actual mediante
**File > New REST Project** y la URL `http://localhost:8000/openapi.json`.

## Configurar pruebas autenticadas

1. Copiar `soapui.properties.example` como `soapui.properties`.
2. Iniciar sesión en la aplicación con un usuario de cada rol.
3. En las herramientas de desarrollo del navegador, abrir **Network**, elegir una
   llamada a `/api/v1` y copiar únicamente el valor JWT que aparece después de
   `Bearer` en el encabezado `Authorization`.
4. Pegar cada token en su propiedad correspondiente.

Los tokens de Clerk expiran. Si una prueba autenticada devuelve `401`, reemplazar
el token. `soapui.properties` está ignorado por Git.

No se deben dejar los valores `PASTE_CLERK_...` del archivo de ejemplo ni incluir
el prefijo `Bearer`. El formato esperado es:

```properties
applicantToken=eyJ...
hrToken=eyJ...
authorityToken=eyJ...
```

El runner valida estas propiedades antes de iniciar la suite autenticada y muestra
un error claro cuando alguna falta o no tiene estructura de JWT.

## Ejecutar desde PowerShell

Suite pública:

```powershell
.\soapui\run-soapui.ps1 -Suite "01 - Public and Security"
```

Todas las suites, después de crear `soapui.properties`:

```powershell
.\soapui\run-soapui.ps1
```

Si SoapUI no está en la ruta habitual:

```powershell
.\soapui\run-soapui.ps1 -SoapUIHome "C:\ruta\SoapUI-5.7.2"
```

Si todavía no está instalado, descargar **SoapUI Open Source** desde la página
oficial: <https://www.soapui.org/downloads/soapui/>. No es necesario instalar
ReadyAPI para ejecutar este proyecto.

Después de instalarlo, el script detecta automáticamente cualquier carpeta
`SoapUI-*` bajo `C:\Program Files\SmartBear`. También se puede dejar configurado:

```powershell
$env:SOAPUI_HOME = "C:\Program Files\SmartBear\SoapUI-5.10.0"
.\soapui\run-soapui.ps1 -Suite "01 - Public and Security"
```

Los reportes JUnit se generan en `soapui/reports/`.

## Alcance y seguridad de datos

Estas pruebas son repetibles y de solo lectura. La creación de vacantes, envío de
CV y aprobaciones no se automatizan en esta suite porque cambiarían la base de
datos y podrían activar almacenamiento, análisis con IA, correo y notificaciones.
Esos flujos deben ejecutarse en una base de datos exclusiva de QA con fixtures y
credenciales de servicios de prueba.
