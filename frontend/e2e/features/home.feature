# language: es
Característica: Página pública de ATS-UCE
  Como visitante
  Quiero abrir la plataforma
  Para conocer el sistema e iniciar mi registro

  Escenario: La portada muestra la información principal
    Dado que abro la página principal
    Entonces debería ver el título "ATS-UCE"
    Y debería ver el texto "Academic talent, managed with clarity and efficiency."

  Escenario: El visitante puede ir al registro
    Dado que abro la página principal
    Cuando hago clic en "Explore Platform"
    Entonces la ruta debería ser "/sign-up"

  Escenario: El formulario exige los campos obligatorios
    Dado que abro la página de registro
    Cuando hago clic en "Create account"
    Entonces debería ver el texto "First name is required"
    Y debería ver el texto "Last name is required"
    Y debería ver un error en el campo "role"

  Escenario: El formulario rechaza contraseñas diferentes
    Dado que abro la página de registro
    Cuando completo los datos de registro como postulante
    Y ingreso la contraseña "Password123" y la confirmación "Password456"
    Y hago clic en "Create account"
    Entonces debería ver el texto "Passwords do not match"

  Escenario: Los roles institucionales requieren correo UCE
    Dado que abro la página de registro
    Cuando completo los datos de registro como recursos humanos con correo "usuario@gmail.com"
    Y ingreso la contraseña "Password123" y la confirmación "Password123"
    Y hago clic en "Create account"
    Entonces debería ver el texto "This role requires an institutional email (@uce.edu.ec)"
