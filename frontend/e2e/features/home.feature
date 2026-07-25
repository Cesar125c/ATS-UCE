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
