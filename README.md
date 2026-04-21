# PartesDiarios — Guía de despliegue en Railway

## Estructura del proyecto

```
partes-trabajo/
├── server/
│   ├── index.js       # Servidor Express
│   ├── db.js          # Conexión PostgreSQL + creación de tabla
│   └── routes.js      # API REST /api/partes
├── public/
│   ├── index.html     # Frontend completo
│   └── js/api.js      # Cliente de la API
├── package.json
└── .env.example
```

## Despliegue en Railway (10 minutos)

### 1. Crear cuenta y proyecto
1. Ve a [railway.app](https://railway.app) y regístrate con GitHub
2. Haz clic en **New Project**

### 2. Añadir la base de datos PostgreSQL
1. En el proyecto, haz clic en **Add a service → Database → PostgreSQL**
2. Railway crea la base de datos automáticamente
3. Copia la variable `DATABASE_URL` desde la pestaña **Variables** de la base de datos

### 3. Subir el código
```bash
# En tu máquina local, dentro de la carpeta partes-trabajo:
git init
git add .
git commit -m "initial commit"
```
1. En Railway, haz clic en **Add a service → GitHub Repo**
2. Conecta tu repositorio (o usa **Deploy from local** si no quieres GitHub)

### 4. Configurar variables de entorno
En la pestaña **Variables** del servicio Node.js, añade:
```
DATABASE_URL  →  (pegar el valor copiado del paso 2, Railway lo inyecta automáticamente si usas el mismo proyecto)
NODE_ENV      →  production
PORT          →  3000
```

> Railway detecta automáticamente el `DATABASE_URL` si el servicio PostgreSQL está en el mismo proyecto.

### 5. Verificar el despliegue
Railway ejecuta automáticamente `npm start`. En los logs deberías ver:
```
✓ Base de datos lista
✓ Servidor en http://localhost:3000
```

Tu app estará disponible en la URL pública que Railway genera, del tipo:
`https://partes-trabajo-production.up.railway.app`

---

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env
# Edita .env con tu DATABASE_URL local (necesitas PostgreSQL instalado)

# Arrancar en modo desarrollo (con auto-reload)
npm run dev
```

## API endpoints

| Método | Ruta                     | Descripción                        |
|--------|--------------------------|------------------------------------|
| GET    | /api/partes              | Listar partes (soporta filtros)    |
| GET    | /api/partes/:id          | Obtener un parte por ID            |
| POST   | /api/partes              | Crear nuevo parte                  |
| PUT    | /api/partes/:id          | Actualizar parte existente         |
| DELETE | /api/partes/:id          | Eliminar parte                     |
| GET    | /api/partes/stats/resumen| Estadísticas globales              |

### Filtros disponibles en GET /api/partes
- `?search=texto` — busca en cliente, operario y descripción
- `?tipo=fontaneria|calefaccion|clima` — filtra por tipo
- `?fecha_desde=YYYY-MM-DD` — filtra desde fecha
- `?fecha_hasta=YYYY-MM-DD` — filtra hasta fecha

## Alternativas de despliegue
- **Render.com** — similar a Railway, tier gratuito disponible
- **Fly.io** — más control, requiere instalar su CLI
- **Google Cloud Run** — serverless, se paga solo lo que se usa (~0€ para poco tráfico)
