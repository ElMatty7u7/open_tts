# Twitch TTS

Aplicación web que convierte en voz, en tiempo real, los mensajes de un chat de
Twitch. Está pensada para streamers que quieren escuchar a su comunidad mientras
juegan o emiten con OBS.

La aplicación funciona completamente en el navegador: no necesita backend,
base de datos, cuenta de Twitch, token OAuth ni claves privadas.

> Estado del proyecto: **v0.1**. La lectura del chat y el TTS ya funcionan. El
> overlay para OBS es experimental; consulta sus [limitaciones](#overlay-para-obs).

## Características

- Conexión en tiempo real al chat público de cualquier canal de Twitch.
- Acceso anónimo y de solo lectura mediante IRC sobre WebSocket.
- Lectura secuencial de mensajes con una cola FIFO.
- Pausa, reanudación, eliminación de mensajes y vaciado de la cola.
- Selección de voz e idioma disponibles en el sistema.
- Control de volumen, velocidad y tono.
- Lectura opcional del nombre del usuario con una plantilla personalizable.
- Filtros para comandos, enlaces, longitud, usuarios y cooldown.
- Reconexión automática si se interrumpe el chat.
- Configuración guardada en el navegador mediante `localStorage`.
- Interfaz adaptable, oscura y en español.

## Tecnologías

- [Vue 3](https://vuejs.org/) y TypeScript
- [Vite](https://vite.dev/)
- [Vue Router](https://router.vuejs.org/)
- [Web Speech API](https://developer.mozilla.org/docs/Web/API/Web_Speech_API)
- Twitch IRC sobre WebSocket
- Vitest, ESLint y Prettier

## Requisitos

- [Node.js](https://nodejs.org/) **20.19 o superior** (se recomienda Node 22).
- npm, incluido con Node.js.
- Chrome, Edge o Safari reciente. Firefox tiene soporte limitado para
  `speechSynthesis`.
- Conexión a internet y un canal público de Twitch.

No es necesario crear un archivo `.env` ni configurar credenciales.

## Instalación

Clona el repositorio e instala sus dependencias:

```bash
git clone https://github.com/TU_USUARIO/twitch-tts.git
cd twitch-tts
npm install
```

Sustituye `TU_USUARIO` por tu nombre de usuario de GitHub.

Inicia el servidor de desarrollo:

```bash
npm run dev
```

Abre la dirección que muestra la terminal, normalmente
`http://localhost:5173`.

## Cómo usarlo

1. Escribe el nombre del canal de Twitch, sin `#` ni URL.
2. Pulsa **Conectar**.
3. En **Text-to-Speech**, elige una voz y ajusta volumen, velocidad y tono.
4. Pulsa **Probar voz** para comprobar el audio.
5. Configura los filtros según las necesidades de tu canal.
6. Los mensajes nuevos aparecerán en el feed y se leerán uno por uno.

Desde el panel de cola puedes pausar o reanudar el TTS, eliminar un mensaje
concreto o vaciar toda la cola. La configuración queda guardada localmente para
la siguiente visita.

> Algunos navegadores bloquean el audio hasta que el usuario interactúa con la
> página. Pulsar **Conectar** o **Probar voz** suele habilitarlo.

## Cómo funciona

```text
Chat público de Twitch
        │
        ▼
IRC mediante WebSocket
        │
        ▼
Filtros y cooldown ──► mensajes descartados
        │
        ▼
Cola FIFO
        │
        ▼
Web Speech API ──► voz del navegador o sistema operativo
```

La conexión usa un usuario anónimo `justinfan`, por lo que solamente puede leer
el chat. La aplicación no publica mensajes ni solicita permisos sobre una
cuenta de Twitch. Los mensajes se procesan en el dispositivo del usuario y no
se almacenan en un servidor.

La calidad y cantidad de voces dependen del navegador y del sistema operativo.

## Comandos disponibles

| Comando                | Descripción                                                       |
| ---------------------- | ----------------------------------------------------------------- |
| `npm run dev`          | Inicia el servidor local con recarga automática.                  |
| `npm run build`        | Comprueba los tipos y genera la versión de producción en `dist/`. |
| `npm run preview`      | Prueba localmente la versión generada.                            |
| `npm run type-check`   | Comprueba los tipos de TypeScript y Vue.                          |
| `npm run lint`         | Analiza el código con ESLint.                                     |
| `npm run lint:fix`     | Corrige automáticamente los problemas compatibles.                |
| `npm run format`       | Formatea el proyecto con Prettier.                                |
| `npm run format:check` | Comprueba el formato sin modificar archivos.                      |
| `npm run test`         | Ejecuta los tests una vez.                                        |
| `npm run test:watch`   | Ejecuta los tests en modo interactivo.                            |

Antes de publicar cambios se recomienda ejecutar:

```bash
npm run type-check
npm run lint
npm run test
npm run build
```

## Subir el código gratis a GitHub

1. Crea un repositorio público llamado `twitch-tts` en
   [GitHub](https://github.com/new). No marques las opciones para crear README,
   `.gitignore` o licencia, porque este proyecto ya incluye esos archivos.
2. Desde la carpeta del proyecto, ejecuta:

```bash
git init
git add .
git commit -m "feat: primera version de Twitch TTS"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/twitch-tts.git
git push -u origin main
```

GitHub permite alojar repositorios públicos gratuitamente. Nunca subas tokens,
contraseñas, archivos `.env` con secretos ni credenciales personales.

## Publicar la aplicación gratis con GitHub Pages

GitHub Pages puede servir esta aplicación estática sin contratar un servidor.
Antes de hacerlo, configura en `vite.config.ts` la ruta del repositorio:

```ts
export default defineConfig({
  base: '/twitch-tts/',
  // resto de la configuración...
})
```

Si el repositorio tiene otro nombre, sustituye `/twitch-tts/`. Si se publica en
`TU_USUARIO.github.io`, utiliza `base: '/'`.

Después puedes desplegar con GitHub Actions:

1. En GitHub abre **Settings → Pages**.
2. En **Build and deployment → Source**, selecciona **GitHub Actions**.
3. Crea el archivo `.github/workflows/deploy.yml` con este contenido:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - id: deployment
        uses: actions/deploy-pages@v4
```

4. Guarda el archivo, haz commit y súbelo:

```bash
git add vite.config.ts .github/workflows/deploy.yml
git commit -m "ci: publicar en GitHub Pages"
git push
```

Al terminar la acción, la aplicación estará disponible en:

```text
https://TU_USUARIO.github.io/twitch-tts/
```

El repositorio y GitHub Pages pueden usarse gratuitamente para un proyecto
público. La voz se genera en el equipo de cada visitante, así que el sitio no
necesita un servicio TTS de pago.

## Overlay para OBS

La ruta `/overlay` muestra el canal, el mensaje que se está leyendo y los
siguientes mensajes de la cola. Actualmente comparte datos con el panel mediante
`BroadcastChannel`, que funciona entre pestañas del mismo navegador y del mismo
origen.

Por esa razón, el overlay todavía no sincroniza de forma fiable con una fuente
de navegador de OBS, ya que OBS se ejecuta en otro proceso. Integrarlo mediante
un WebSocket o un servidor local forma parte del trabajo futuro.

En GitHub Pages, abrir directamente la ruta `/overlay` también requiere una
estrategia de fallback para aplicaciones SPA. El panel principal sí puede
usarse desde la URL publicada.

## Estructura del proyecto

```text
src/
├── components/         # Paneles y componentes de la interfaz
├── composables/        # Estado y conexión entre chat, cola y TTS
├── lib/                # Utilidades internas
├── router/             # Rutas del panel y del overlay
├── services/
│   ├── chat/           # Proveedor de Twitch IRC
│   ├── queue/          # Cola reutilizable de mensajes
│   ├── tts/            # Proveedor de Web Speech API
│   ├── cooldown.ts     # Límite por usuario
│   ├── filters.ts      # Reglas de filtrado
│   └── overlay.ts      # Comunicación con el overlay
├── stores/             # Ajustes persistentes
├── types/              # Tipos compartidos
├── views/              # Dashboard y overlay
├── App.vue
└── main.ts
```

`ChatProvider` y `TtsProvider` desacoplan la aplicación de Twitch y de la Web
Speech API. Esto permite añadir en el futuro otros chats o motores de voz sin
reescribir la cola y los filtros.

## Limitaciones actuales

- Solo se puede conectar un canal a la vez.
- El acceso IRC anónimo es únicamente de lectura.
- Twitch recomienda EventSub para integraciones nuevas; EventSub requiere OAuth.
- Las voces disponibles varían según el dispositivo.
- `speechSynthesis.pause()` puede fallar tras pausas largas en algunos navegadores.
- El overlay para OBS necesita todavía un transporte compartido.
- La configuración se guarda por navegador y no se sincroniza entre dispositivos.

## Próximas mejoras

- [ ] Integración con Twitch EventSub y OAuth.
- [ ] Overlay sincronizado con OBS.
- [ ] Proveedores de voz como ElevenLabs o Google TTS.
- [ ] Prioridad para suscriptores, moderadores o VIP.
- [ ] Limpieza de emotes antes de leer el mensaje.
- [ ] Soporte para YouTube y Kick.
- [ ] Interfaz en español e inglés.

## Contribuir

Las contribuciones son bienvenidas:

1. Haz un fork del repositorio.
2. Crea una rama: `git checkout -b feat/mi-mejora`.
3. Realiza y verifica tus cambios.
4. Envía la rama a tu fork y abre un Pull Request.

Procura mantener separados los proveedores de chat, la cola y el motor de voz.

## Licencia

Distribuido bajo la licencia [MIT](./LICENSE).

## Aviso legal

Este proyecto no está afiliado, patrocinado ni respaldado por Twitch
Interactive, Inc. Twitch es una marca registrada de Twitch Interactive, Inc.
