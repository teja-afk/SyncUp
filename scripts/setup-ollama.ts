#!/usr/bin/env tsx

/**
 * Ollama Setup Script
 *
 * This script helps set up Ollama for local AI processing.
 * Run with: npx tsx scripts/setup-ollama.ts
 */

import { execSync } from 'child_process'

async function checkOllamaInstallation(): Promise<boolean> {
    try {
        execSync('ollama --version', { stdio: 'pipe' })
        return true
    } catch {
        return false
    }
}

async function installOllama(): Promise<void> {
    console.log('🔄 Installing Ollama...')
    console.log('Please follow these steps:')
    console.log('')
    console.log('1. Go to: https://ollama.ai/download')
    console.log('2. Download and install Ollama for your operating system')
    console.log('3. Once installed, run: ollama serve')
    console.log('4. In another terminal, run: ollama pull llama2')
    console.log('5. Also run: ollama pull nomic-embed-text')
    console.log('')
    console.log('After completing these steps, your local AI will be ready!')
}

async function pullModels(): Promise<void> {
    console.log('🔄 Pulling AI models...')

    // First ensure embedding model is available
    try {
        console.log('Ensuring nomic-embed-text (embedding model) is available...')
        execSync('ollama pull nomic-embed-text', { stdio: 'inherit' })
        console.log('✅ nomic-embed-text ready!')
    } catch (error) {
        console.log('❌ Failed to pull nomic-embed-text. Please run: ollama pull nomic-embed-text')
    }

    // Try multiple chat models in order of preference
    const chatModels = ['mistral', 'codellama', 'vicuna', 'llama2']

    for (const model of chatModels) {
        try {
            console.log(`Trying to pull ${model} (chat model)...`)
            execSync(`ollama pull ${model}`, { stdio: 'inherit' })
            console.log(`✅ ${model} ready!`)
            break // Stop at first successful model
        } catch (error) {
            console.log(`❌ Failed to pull ${model}, trying next...`)
        }
    }

    console.log('')
    console.log('💡 Tip: If you want to try other models later, run:')
    console.log('   ollama pull mistral    # Good general purpose model')
    console.log('   ollama pull codellama  # Good for coding tasks')
    console.log('   ollama pull vicuna     # Another good alternative')
}

async function main() {
    console.log('🤖 Ollama Local AI Setup')
    console.log('======================')
    console.log('')

    const isInstalled = await checkOllamaInstallation()

    if (!isInstalled) {
        console.log('❌ Ollama is not installed.')
        await installOllama()
        return
    }

    console.log('✅ Ollama is installed!')

    // Check if Ollama is running
    try {
        execSync('curl -s http://localhost:11434/api/version > /dev/null', { stdio: 'pipe' })
        console.log('✅ Ollama is running!')
    } catch {
        console.log('⚠️  Ollama is installed but not running.')
        console.log('Please start it with: ollama serve')
        return
    }

    await pullModels()

    console.log('')
    console.log('🎉 Setup complete! Your local AI is ready.')
    console.log('The meeting search functionality should now work with Ollama.')
}

main().catch(console.error)
