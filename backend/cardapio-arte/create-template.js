const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const canvas = createCanvas(900, 900);
const ctx = canvas.getContext('2d');

// Red background
ctx.fillStyle = '#D9261C';
ctx.fillRect(0, 0, 900, 900);

// Placeholder text
ctx.fillStyle = 'rgba(255,255,255,0.3)';
ctx.font = 'bold 24px Arial';
ctx.textAlign = 'center';
ctx.fillText('SUBSTITUA PELO SEU TEMPLATE', 450, 450);
ctx.font = '18px Arial';
ctx.fillText('(PNG exportado do Photoshop sem o texto)', 450, 490);

const outputPath = path.join(__dirname, 'template_base.png');
fs.writeFileSync(outputPath, canvas.toBuffer('image/png'));
console.log('Template placeholder criado:', outputPath);
