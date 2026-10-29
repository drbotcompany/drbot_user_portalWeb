# Portal web DRBOT

Portal web para que los pacientes consulten su espacio personal de DRBOT.

## Páginas

- **Inicio** (`index.html`): acceso a las secciones del portal.
- **Ayuda** (`static/help.html`): preguntas frecuentes y contacto de soporte.
- **Inicio de sesión** (`static/login.html`): autenticación con una cuenta DRBOT.
- **Datos administrativos** (`static/administrative.html`): estructura para datos personales, de contacto y coberturas.
- **Información clínica** (`static/clinicData.html`): apartados de recetas, informes médicos y enfermedades.

La portada y la página de ayuda son públicas. Las páginas administrativa y clínica comprueban la sesión con Firebase Authentication. Si no hay una sesión activa, redirigen al inicio de sesión y, después de autenticarse, vuelven a la página solicitada.

Las páginas administrativa y clínica contienen actualmente su estructura visual, pero todavía no cargan datos del paciente desde Firestore. La cuenta de paciente se crea desde la aplicación móvil DRBOT.

## Requisitos

- Un navegador moderno.
- Python 3 (solo para servir el sitio localmente) o cualquier servidor web estático.
- Conexión a Internet para cargar Firebase desde Google y usar sus servicios.
- Firebase Authentication configurado para el proyecto DRBOT.

## Ejecución local

Desde la carpeta raíz del proyecto, inicia un servidor estático:

```bash
python -m http.server 8000
```

Abre [http://localhost:8000](http://localhost:8000) en el navegador. La aplicación usa módulos JavaScript y no debe abrirse directamente con `file://`.

## Firebase

La inicialización de Firebase y las funciones de autenticación y Firestore están en `js/firebase-client.js`. La configuración actual apunta al proyecto `drbot-app`.

Las redirecciones de las páginas privadas se gestionan desde `js/require-session.js`; el inicio de sesión está en `js/auth-page.js`. La interfaz comprueba la sesión en el navegador. Para proteger datos reales, configura Firebase Authentication y las reglas de seguridad de Cloud Firestore según los permisos de cada paciente.

## Estructura del proyecto

```text
.
├── index.html
├── static/             # Páginas de ayuda, acceso y datos del paciente
├── css/                # Estilos compartidos y estilos por página
├── js/                 # Firebase, autenticación, sesión y tema
└── assets/             # Imágenes, iconos, fuentes y datos auxiliares
```

## Tecnologías

- HTML5 y CSS3.
- JavaScript con módulos ES.
- Firebase Authentication y Cloud Firestore.
- SDK de Firebase cargado desde `gstatic.com`.
