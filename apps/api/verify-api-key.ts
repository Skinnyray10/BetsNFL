#!/usr/bin/env tsx
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Load environment variables from root .env
config({ path: resolve(fileURLToPath(new URL('.', import.meta.url)), '../../.env') });

console.log('🔍 Verificando configuración del LLM...\n');

// Check for any API key
const groqKey = process.env.GROQ_API_KEY ||
  (process.env.CLAUDE_API_KEY?.startsWith('gsk_') ? process.env.CLAUDE_API_KEY : undefined);
const anthropicKey =
  (process.env.CLAUDE_API_KEY?.startsWith('sk-ant-') ? process.env.CLAUDE_API_KEY : undefined) ||
  (process.env.ANTHROPIC_API_KEY?.startsWith('sk-ant-') ? process.env.ANTHROPIC_API_KEY : undefined);
const ollamaModel = process.env.OLLAMA_MODEL;

if (!groqKey && !anthropicKey && !ollamaModel) {
  console.error('❌ ERROR: No se encontró ningún proveedor de LLM configurado');
  console.log('\n📝 Configura uno de estos en tu archivo .env:');
  console.log('   Opción 1 - Groq (recomendado, gratis):');
  console.log('     GROQ_API_KEY=gsk_tu-key-aqui');
  console.log('     # o usa CLAUDE_API_KEY si tu key es de Groq');
  console.log('\n   Opción 2 - Anthropic Claude:');
  console.log('     ANTHROPIC_API_KEY=sk-ant-tu-key-aqui');
  console.log('\n   Opción 3 - Ollama (local):');
  console.log('     OLLAMA_MODEL=llama3');
  console.log('     OLLAMA_BASE_URL=http://localhost:11434  # opcional');
  process.exit(1);
}

// Detect provider
let providerType: 'groq' | 'anthropic' | 'ollama';
let providerKey: string | undefined;
let providerModel: string;

if (groqKey) {
  providerType = 'groq';
  providerKey = groqKey;
  providerModel = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
  console.log('✓ Proveedor detectado: Groq');
  console.log(`✓ API key: ${groqKey.substring(0, 10)}...`);
  console.log(`✓ Longitud: ${groqKey.length} caracteres`);
  console.log(`✓ Modelo: ${providerModel}`);
} else if (anthropicKey) {
  providerType = 'anthropic';
  providerKey = anthropicKey;
  providerModel = process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929';
  console.log('✓ Proveedor detectado: Anthropic Claude');
  console.log(`✓ API key: ${anthropicKey.substring(0, 10)}...`);
  console.log(`✓ Longitud: ${anthropicKey.length} caracteres`);
  console.log(`✓ Modelo: ${providerModel}`);
} else if (ollamaModel) {
  providerType = 'ollama';
  providerModel = ollamaModel;
  const ollamaURL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  console.log('✓ Proveedor detectado: Ollama (local)');
  console.log(`✓ URL: ${ollamaURL}`);
  console.log(`✓ Modelo: ${providerModel}`);
} else {
  console.error('❌ ERROR: No se pudo detectar el proveedor');
  process.exit(1);
}

console.log('\n🧪 Probando conexión con el LLM...');

try {
  if (providerType === 'groq') {
    const Groq = (await import('groq-sdk')).default;
    const client = new Groq({ apiKey: providerKey });

    const response = await client.chat.completions.create({
      model: providerModel,
      messages: [{ role: 'user', content: 'Say hello in one word' }],
      max_tokens: 10,
    });

    console.log('✅ ¡Conexión exitosa con Groq!');
    console.log(`   Respuesta: ${response.choices[0]?.message?.content || 'N/A'}`);
    console.log(`   Modelo usado: ${response.model}`);

  } else if (providerType === 'anthropic') {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey: providerKey });

    const message = await client.messages.create({
      model: providerModel,
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hello' }],
    });

    console.log('✅ ¡Conexión exitosa con Anthropic!');
    console.log(`   Respuesta recibida: ${message.content[0].type}`);

  } else if (providerType === 'ollama') {
    const baseURL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

    // Test connection
    const healthResponse = await fetch(`${baseURL}/api/tags`);
    if (!healthResponse.ok) {
      throw new Error(`No se puede conectar a Ollama en ${baseURL}`);
    }

    // Test generation
    const response = await fetch(`${baseURL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: providerModel,
        prompt: 'Say hello in one word',
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    console.log('✅ ¡Conexión exitosa con Ollama!');
    console.log(`   Modelo: ${providerModel}`);
  }

  console.log('\n✨ Todo está configurado correctamente. Puedes ejecutar:');
  console.log('   pnpm dev');
  console.log('\n📊 Para probar las predicciones, visita:');
  console.log('   http://localhost:3001/api/predictions');

} catch (error: unknown) {
  console.error('\n❌ Error al conectar con el LLM:');
  console.error(error);

  const err = error as { status?: number; message?: string; error?: { type?: string; message?: string } };

  if (providerType === 'groq') {
    if (err.status === 401) {
      console.error('\n   El API key de Groq es inválido');
      console.error('   Obtén uno nuevo en: https://console.groq.com');
    } else if (err.error) {
      console.error(`\n   ${err.error.type}: ${err.error.message}`);
    } else if (err.message) {
      console.error(`\n   ${err.message}`);
    }
  } else if (providerType === 'anthropic') {
    if (err.status === 401) {
      console.error('\n   El API key de Anthropic es inválido');
      console.error('   Verifica tu key en: https://console.anthropic.com');
    } else if (err.error) {
      console.error(`\n   ${err.error.type}: ${err.error.message}`);
    } else if (err.message) {
      console.error(`\n   ${err.message}`);
    }
  } else if (providerType === 'ollama') {
    console.error('\n   No se puede conectar a Ollama');
    console.error('   Asegúrate de que Ollama esté corriendo:');
    console.error('     ollama serve');
    console.error(`   Y que el modelo ${providerModel} esté instalado:`);
    console.error(`     ollama pull ${providerModel}`);
  }

  process.exit(1);
}
