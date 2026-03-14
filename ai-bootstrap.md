# AI Framework Bootstrap 🚀

¡Felicidades! Has inicializado el sistema de ingeniería de IA en tu proyecto. Aquí tienes los pasos para empezar a trabajar con tu equipo de agentes.

## Pasos Iniciales

1.  **Abre tu Terminal:** Asegúrate de estar en la raíz de tu proyecto.
2.  **Inicia Claude Code:** Ejecuta el comando `claude` (o tu alias preferido para el asistente).
3.  **Primer Análisis:** Pide a **Jorge** (Project Manager) que analice el repositorio:
    > "Jorge, analiza este repositorio y preséntame al equipo."
4.  **Diseño de Arquitectura:** Antes de tocar código, pide a **Angelica** (Architect) que proponga el plan:
    > "Angelica, basándote en el análisis de Jorge, propón el plan de arquitectura para mi primera tarea."
5.  **Aprobación:** Revisa el plan y dale tu aprobación antes de dejar que los ingenieros (Ismael/Luan/Romina) comiencen la ejecución.

---

## Cómo hacer `ai-init` Global

Para no tener que copiar el archivo `.ps1` a cada proyecto, puedes añadirlo a tu perfil de PowerShell como una función global.

1.  Abre tu perfil de PowerShell:
    ```powershell
    notepad $PROFILE
    ```
2.  Añade el siguiente alias/función al final del archivo:
    ```powershell
    function ai-init {
        & "$HOME\Desktop\AI-FRAMEWORK\ai-init.ps1"
    }
    ```
3.  Guarda el archivo y reinicia PowerShell (o ejecuta `. $PROFILE`).
4.  ¡Ahora puedes escribir `ai-init` en cualquier carpeta para instalar tu framework!

---

## Reglas de Oro
- **No modifiques `.env` directamente.**
- **Siempre verifica los planes de Angelica.**
- **Deja que Paula haga la revisión final antes de cerrar un task.**
