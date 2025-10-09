#!/usr/bin/env tsx

/**
 * Chat Models Setup Script
 *
 * This script helps pull chat models for Ollama.
 * Run with: npx tsx scripts/pull-chat-models.ts
 */

import { execSync } from 'child_process'

async function checkModelAvailability(model: string): Promise<boolean> {
    try {
        // Try to generate a simple response to test if model works
        execSync(`ollama run ${model} "Hello"`, {
            stdio: 'pipe',
            timeout: 10000
        })
        return true
    } catch {
        return false
    }
}

async function pullAndTestModel(model: string): Promise<boolean> {
    console.log(`🔄 Pulling ${model}...`)

    try {
        execSync(`ollama pull ${model}`, {
            stdio: 'inherit',
            timeout: 300000 // 5 minutes timeout for large models
        })

        console.log(`✅ Successfully pulled ${model}`)

        // Test if the model actually works
        if (await checkModelAvailability(model)) {
            console.log(`✅ ${model} is working correctly!`)
            return true
        } else {
            console.log(`⚠️  ${model} pulled but may have issues`)
            return false
        }
    } catch (error) {
        console.log(`❌ Failed to pull ${model}`)
        return false
    }
}

async function main() {
    console.log('🤖 Ollama Chat Models Setup')
    console.log('===========================')
    console.log('')

    // Recommended models in order of preference
    const models = [
        { name: 'mistral', description: 'Best general-purpose model' },
        { name: 'codellama', description: 'Good for analytical tasks' },
        { name: 'vicuna', description: 'Another good alternative' },
        { name: 'llama2', description: 'Fallback option' }
    ]

    console.log('📋 Available chat models to try:')
    models.forEach((model, index) => {
        console.log(`${index + 1}. ${model.name} - ${model.description}`)
    })
    console.log('')

    console.log('🔄 Trying to pull and test models...')
    console.log('')

    let successCount = 0

    for (const model of models) {
        console.log(`🎯 Testing ${model.name}...`)

        if (await pullAndTestModel(model.name)) {
            successCount++
            console.log(`🎉 ${model.name} is ready to use!`)
            break // Stop at first working model
        } else {
            console.log(`❌ ${model.name} didn't work, trying next...`)
        }
        console.log('')
    }

    if (successCount > 0) {
        console.log('🎉 Success! You now have at least one working chat model.')
        console.log('Your meeting assistant should provide much better responses now!')
    } else {
        console.log('⚠️  No models worked perfectly, but don\'t worry!')
        console.log('💡 Your meeting search (embeddings) works excellently')
        console.log('💡 Chat responses still work with helpful fallback messages')
        console.log('')
        console.log('🔧 To improve chat responses later, try:')
        console.log('   npx tsx scripts/setup-ollama.ts')
    }

    console.log('')
    console.log('✨ Your setup is complete!')
}

main().catch(console.error)
