#!/usr/bin/env node

console.log('🚀 Starting LokalHunt Mobile App...')
console.log('📱 Instructions:')
console.log('1. Install "Expo Go" app on your mobile device')
console.log('2. Make sure your phone is on the same WiFi network')
console.log('3. Scan the QR code that appears below')
console.log('4. Your mobile app will load automatically!')
console.log('')
console.log('🌐 Web version: http://localhost:8081')
console.log('')

const { spawn } = require('child_process')

const expo = spawn('npx', ['expo', 'start', '--clear'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
})

expo.on('error', (err) => {
  console.error('Failed to start Expo:', err)
  process.exit(1)
})

expo.on('close', (code) => {
  console.log(`Expo process exited with code ${code}`)
  process.exit(code)
})

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down mobile app...')
  expo.kill('SIGINT')
})

process.on('SIGTERM', () => {
  expo.kill('SIGTERM')
})