# 🧊 Monitoreo de Refrigeradores

Sistema de monitoreo de temperatura y humedad para refrigeradores, construido con **Next.js 16**, **Supabase** y **Tailwind CSS v4**.

Dashboard en tiempo real que clasifica automáticamente las lecturas en estados: **Normal**, **Pre-alerta**, **Alerta** y **Mantenimiento**.

---

## 📦 Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS v4, Recharts, Lucide |
| Backend | Next.js API Routes (server-side) |
| Base de datos | Supabase (PostgreSQL) |
| Tiempo real | Supabase Realtime (INSERT en `lecturas_refrigerador`) |

---

## 🚀 Inicio rápido

```bash
pnpm install
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000).

### Variables de entorno

Crear `.env` en la raíz:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Server-side (bypasea RLS)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...  # Client-side (Realtime)
```

> `.env*` está en `.gitignore` — las credenciales nunca se commitean.

### Scripts disponibles

| Comando | Descripción |
|---------|------------|
| `pnpm dev` | Servidor de desarrollo (Turbopack) |
| `pnpm build` | Compila, typecheck y genera páginas estáticas |
| `pnpm lint` | ESLint (core-web-vitals + typescript) |
| `pnpm start` | Servidor de producción |

---

## 🗄️ Base de datos

### Tablas

**`lecturas_refrigerador`** — lecturas de sensores

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | `BIGINT` (PK, identidad) | ID autogenerado |
| `created_at` | `TIMESTAMPTZ` | Fecha/hora de la lectura |
| `temperatura` | `NUMERIC(5,2)` | Temperatura en °C |
| `humedad` | `NUMERIC(5,2)` | Humedad en % |
| `dispositivo_id` | `TEXT` | Identificador del sensor |
| `estado` | `TEXT` | `normal`, `pre-alerta`, `alerta`, `mantenimiento` |
| `mensaje_estado` | `TEXT` | Mensaje descriptivo del estado |

**`historial_alertas`** — registro histórico de alertas

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | `BIGINT` (PK, identidad) | ID autogenerado |
| `created_at` | `TIMESTAMPTZ` | Fecha/hora de la alerta |
| `lectura_id` | `BIGINT` (FK) | Referencia a `lecturas_refrigerador.id` |
| `temperatura` | `NUMERIC(5,2)` | Temperatura en °C |
| `humedad` | `NUMERIC(5,2)` | Humedad en % |
| `dispositivo_id` | `TEXT` | Identificador del sensor |
| `mensaje` | `TEXT` | Descripción de la alerta |

### Rangos de estado

Los estados se calculan automáticamente en el backend según la temperatura:

| Estado | Rango (°C) | Color |
|--------|-----------|-------|
| ✅ Normal | 4.0 – 10.0 | Verde |
| 🟡 Pre-alerta | 2.0 – 3.9 o 10.1 – 12.0 | Ámbar |
| 🔴 Alerta | < 2.0 o > 12.0 | Rojo |
| 🔧 Mantenimiento | Manual (vía PATCH) | Azul |

---

## 🌐 API Endpoints

### `POST /api/lecturas`

Registra una nueva lectura de sensor.

**Body:**

```json
{
  "temperatura": 7.5,
  "humedad": 65.0,
  "dispositivo_id": "sensor-01"
}
```

**Response (201):**

```json
{
  "id": 1,
  "created_at": "2026-06-30T00:00:00Z",
  "temperatura": 7.5,
  "humedad": 65.0,
  "dispositivo_id": "sensor-01",
  "estado": "normal",
  "mensaje_estado": "Temperatura dentro del rango óptimo"
}
```

### `GET /api/lecturas`

Obtiene las últimas lecturas.

| Query param | Default | Máximo |
|------------|---------|--------|
| `limit` | 50 | 100 |

```
GET /api/lecturas
GET /api/lecturas?limit=10
```

**Response (200):**

```json
[
  { "id": 1, "temperatura": 7.5, "humedad": 65.0, "estado": "normal", ... },
  { "id": 2, "temperatura": 11.3, "humedad": 70.0, "estado": "pre-alerta", ... }
]
```

### `GET /api/lecturas/ultima`

Obtiene la lectura más reciente.

```
GET /api/lecturas/ultima
```

**Response (200):** un solo objeto, o `null` si no hay datos.

### `PATCH /api/lecturas/:id/mantenimiento`

Cambia el estado de una lectura a `mantenimiento`. Solo funciona si el estado actual **no** es `mantenimiento`.

```
PATCH /api/lecturas/1/mantenimiento
```

**Response (200):** lectura actualizada. **409** si ya está en mantenimiento.

### `GET /api/historial-alertas`

Obtiene las últimas 50 alertas registradas.

```
GET /api/historial-alertas
```

**Response (200):** array de alertas ordenadas por fecha descendente.

---

## 🔌 Consumo desde Arduino (ESP8266 / ESP32)

### Ejemplo con WiFi y sensor DHT11/DHT22

```cpp
#include <DHT.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

#define DHTPIN D4
#define DHTTYPE DHT11

const char* ssid = "TU_WIFI";
const char* password = "TU_CONTRASEÑA";
const char* serverUrl = "https://tu-proyecto.vercel.app/api/lecturas";

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi conectado");
}

void loop() {
  float temperatura = dht.readTemperature();
  float humedad = dht.readHumidity();

  if (isnan(temperatura) || isnan(humedad)) {
    Serial.println("Error leyendo sensor DHT");
    delay(5000);
    return;
  }

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<128> doc;
    doc["temperatura"] = temperatura;
    doc["humedad"] = humedad;
    doc["dispositivo_id"] = "sensor-01";

    String body;
    serializeJson(doc, body);

    int httpCode = http.POST(body);

    if (httpCode == 201) {
      Serial.println("Lectura enviada correctamente");
    } else {
      Serial.print("Error HTTP: ");
      Serial.println(httpCode);
    }

    http.end();
  }

  delay(60000);  // Enviar cada 60 segundos
}
```

### Ejemplo mínimo con `WiFiClient` (sin librerías externas JSON)

```cpp
#include <DHT.h>
#include <ESP8266WiFi.h>

#define DHTPIN D4
#define DHTTYPE DHT11

const char* ssid = "TU_WIFI";
const char* password = "TU_CONTRASEÑA";
const char* host = "tu-proyecto.vercel.app";

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);
}

void loop() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();

  if (!isnan(temp) && !isnan(hum) && WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    if (client.connect(host, 443)) {
      String body = "{\"temperatura\":" + String(temp) +
                    ",\"humedad\":" + String(hum) +
                    ",\"dispositivo_id\":\"sensor-01\"}";

      client.println("POST /api/lecturas HTTP/1.1");
      client.println("Host: " + String(host));
      client.println("Content-Type: application/json");
      client.print("Content-Length: ");
      client.println(body.length());
      client.println();
      client.println(body);

      while (client.connected()) {
        if (client.available()) {
          String line = client.readStringUntil('\n');
          if (line.startsWith("HTTP/1.1 201")) {
            Serial.println("Lectura enviada");
          }
          break;
        }
      }
      client.stop();
    }
  }
  delay(60000);
}
```

> **Nota para HTTPS (ESP8266):** Si usas HTTPS, necesitas incluir `ESP8266WiFi.h` y el certificado SSL. Para desarrollo local sin HTTPS usa `http://IP_LOCAL:3000/api/lecturas` con `WiFiClient` en puerto 80.

---

## 📁 Estructura del proyecto

```
├── app/
│   ├── api/
│   │   ├── lecturas/
│   │   │   ├── route.ts            # GET + POST lecturas
│   │   │   ├── ultima/route.ts     # GET última lectura
│   │   │   └── [id]/mantenimiento/route.ts  # PATCH mantenimiento
│   │   └── historial-alertas/route.ts       # GET alertas
│   ├── page.tsx                    # Dashboard principal
│   ├── layout.tsx                  # Root layout (dark mode)
│   └── globals.css                 # Tailwind v4 + tema
├── components/
│   ├── DashboardClient.tsx         # Orquestador + Realtime
│   ├── StatusBadge.tsx             # Badge de estado con color
│   ├── TemperatureCard.tsx         # Tarjeta temp/humedad actual
│   ├── TemperatureChart.tsx        # Gráfico de línea (Recharts)
│   ├── RecentReadings.tsx          # Lista de lecturas recientes
│   ├── AlertHistory.tsx            # Historial de alertas
│   └── MaintenanceButton.tsx       # Botón de mantenimiento
├── lib/
│   ├── supabase.ts                 # Cliente Supabase (server-side)
│   └── types.ts                    # Tipos TypeScript
├── sql/
│   └── 001_create_tables.sql       # Migración DDL
└── .env                            # Credenciales (gitignored)
```

---

## 🔧 Mantenimiento DB

Las operaciones de base de datos se realizan via las MCP tools de Supabase:

```bash
# Aplicar migración
supabase_apply_migration

# Consultas directas
supabase_execute_sql
```

Para seed data, ejecutar INSERTs SQL directos contra la base de datos.

---

## 📝 Licencia

Proyecto académico — Sistemas Digitales.
