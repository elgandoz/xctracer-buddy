const { writeFileSync, mkdirSync } = require('fs')
const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
const buf = Buffer.from(base64, 'base64')
mkdirSync('public/icons', { recursive: true })
writeFileSync('public/icons/icon-192.png', buf)
writeFileSync('public/icons/icon-512.png', buf)
console.log('Icons written')
