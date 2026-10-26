# Proveedores de LLM - Configuración

El sistema ahora soporta múltiples proveedores de LLM para generar predicciones de NFL. Puedes usar Groq (gratis), Anthropic Claude, o Ollama (local).

## Proveedores Disponibles

### 1. Groq (Recomendado - Gratis y Rápido)

**Configuración en `.env`:**
```bash
CLAUDE_API_KEY=gsk_tu-key-de-groq-aqui
# o alternativamente:
GROQ_API_KEY=gsk_tu-key-de-groq-aqui

# Opcional: especifica el modelo (por defecto: openai/gpt-oss-120b)
GROQ_MODEL=openai/gpt-oss-120b
```

**Modelos disponibles (octubre 2026):**
- `openai/gpt-oss-120b` (por defecto, más potente)
- `openai/gpt-oss-20b` (más rápido)
- `qwen/qwen3.8-27b` (alternativa)
- `allam-2-7b` (modelo más pequeño)

**Cómo obtener tu API key:**
1. Ve a https://console.groq.com
2. Crea una cuenta (gratis, sin tarjeta de crédito)
3. Genera un API key
4. Copia el key que empieza con `gsk_`

### 2. Anthropic Claude

**Configuración en `.env`:**
```bash
ANTHROPIC_API_KEY=sk-ant-tu-key-aqui
# o:
CLAUDE_API_KEY=sk-ant-tu-key-aqui

# Opcional: especifica el modelo
CLAUDE_MODEL=claude-sonnet-4-5-20250929
```

**Modelos disponibles:**
- `claude-sonnet-4-5-20250929` (por defecto)
- `claude-opus-4-5-20251101` (más potente, más caro)

**Cómo obtener tu API key:**
1. Ve a https://console.anthropic.com
2. Crea una cuenta
3. Genera un API key
4. El key debe empezar con `sk-ant-`

### 3. Ollama (Local - Gratis)

**Configuración en `.env`:**
```bash
OLLAMA_MODEL=llama3
# Opcional: si Ollama está en otro puerto/servidor
OLLAMA_BASE_URL=http://localhost:11434
```

**Requisitos:**
1. Instalar Ollama: https://ollama.com
2. Ejecutar: `ollama serve`
3. Descargar un modelo: `ollama pull llama3`

**Modelos sugeridos:**
- `llama3` (recomendado)
- `mistral`
- `qwen`
- `gemma`

## Detección Automática

El sistema detecta automáticamente qué proveedor usar basándose en las variables de entorno disponibles:

1. **Groq** tiene prioridad si encuentra:
   - `GROQ_API_KEY` configurado, o
   - `CLAUDE_API_KEY` que comienza con `gsk_`

2. **Anthropic** si encuentra:
   - `CLAUDE_API_KEY` que comienza con `sk-ant-`, o
   - `ANTHROPIC_API_KEY` configurado

3. **Ollama** si encuentra:
   - `OLLAMA_MODEL` configurado

## Verificación

Antes de ejecutar el servidor, puedes verificar tu configuración:

```bash
# En la raíz del proyecto:
pnpm --filter @bets/api verify
```

Este comando te dirá:
- Qué proveedor se detectó
- Si el API key es válido
- Si el modelo configurado existe
- Hace una prueba de conexión

## Uso

Una vez configurado, simplemente inicia el servidor:

```bash
pnpm dev
```

El sistema automáticamente:
1. Detecta qué proveedor usar
2. Se conecta con el LLM
3. Genera predicciones
4. Registra en consola qué proveedor y modelo está usando

## Logs

Al ejecutar predicciones, verás logs como:

```
Using LLM provider: groq with model: openai/gpt-oss-120b
Generated predictions using groq (openai/gpt-oss-120b)
```

## Cambiar de Proveedor

Para cambiar de proveedor, simplemente modifica tu archivo `.env`:

**De Groq a Anthropic:**
```bash
# Comenta o elimina:
# CLAUDE_API_KEY=gsk_...

# Agrega:
ANTHROPIC_API_KEY=sk-ant-tu-key-aqui
```

**De Anthropic a Ollama:**
```bash
# Comenta o elimina:
# ANTHROPIC_API_KEY=sk-ant-...

# Agrega:
OLLAMA_MODEL=llama3
```

Reinicia el servidor y automáticamente usará el nuevo proveedor.

## Troubleshooting

### Error: "No LLM API key found"
- Asegúrate de tener al menos una de estas variables configuradas:
  - `GROQ_API_KEY` o `CLAUDE_API_KEY` (para Groq)
  - `ANTHROPIC_API_KEY` (para Anthropic)
  - `OLLAMA_MODEL` (para Ollama)

### Error: "The model X does not exist"
- Para Groq: verifica modelos disponibles con tu key ejecutando:
  ```bash
  curl https://api.groq.com/openai/v1/models \
    -H "Authorization: Bearer $GROQ_API_KEY"
  ```
- Para Ollama: verifica que el modelo esté instalado: `ollama list`

### Error: "invalid x-api-key" o autenticación 401
- Verifica que tu API key sea correcto
- Para Groq: debe empezar con `gsk_`
- Para Anthropic: debe empezar con `sk-ant-`
- Regenera tu API key si es necesario

### Predicciones usando fallback
Si ves `[FALLBACK]` en las predicciones, significa que el LLM falló y se usó un sistema de respaldo básico. Esto puede pasar si:
- El API key alcanzó su límite de uso
- Hay problemas de red
- El servicio está caído

## Costos

| Proveedor | Modelo | Costo |
|-----------|--------|-------|
| Groq | openai/gpt-oss-120b | **Gratis** |
| Groq | qwen/qwen3.8-27b | **Gratis** |
| Anthropic | claude-sonnet-4-5 | ~$3 / 1M tokens de entrada |
| Ollama | Todos | **Gratis** (local) |

Para uso personal/desarrollo, **Groq es la mejor opción**: gratis, rápido, y con buenos modelos.
