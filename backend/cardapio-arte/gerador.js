const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  templatePath: path.join(__dirname, 'template_base.png'),
  outputPath: path.join(__dirname, '..', 'public', 'cardapio_gerado.png'),
  // Area vermelha onde o texto pode ficar (em pixels)
  areaTexto: {
    yTopo: 290,       // limite superior (abaixo do "MENU DO DIA")
    yFundo: 680,      // limite inferior (acima do logo ELAS)
    largura: 600
  },
  fonte: {
    tamanhoMax: 36,   // fonte máxima (poucos itens)
    tamanhoMin: 20,   // fonte mínima (muitos itens)
    familia: 'Arial',
    cor: '#FFFFFF',
    peso: 'bold'
  },
  emoji: '\u{1F37D}\uFE0F '
};

async function gerarArte(itens) {
  const template = await loadImage(CONFIG.templatePath);
  const canvas = createCanvas(template.width, template.height);
  const ctx = canvas.getContext('2d');

  // Draw template background
  ctx.drawImage(template, 0, 0);

  // Calcular tamanho da fonte e espaçamento baseado na quantidade de itens
  const { yTopo, yFundo, largura } = CONFIG.areaTexto;
  const alturaDisponivel = yFundo - yTopo;
  const numItens = itens.length;

  // Calcular altura de linha ideal e limitar o tamanho da fonte
  const alturaLinhaIdeal = alturaDisponivel / numItens;
  let tamanhoFonte = Math.min(CONFIG.fonte.tamanhoMax, Math.floor(alturaLinhaIdeal * 0.7));
  tamanhoFonte = Math.max(CONFIG.fonte.tamanhoMin, tamanhoFonte);

  const alturaLinha = Math.min(alturaLinhaIdeal, tamanhoFonte * 1.6);

  // Calcular altura total do bloco de texto e centralizar verticalmente na area
  const alturaTotal = alturaLinha * (numItens - 1);
  const yInicio = yTopo + (alturaDisponivel - alturaTotal) / 2;

  // Configure text style
  ctx.font = `${CONFIG.fonte.peso} ${tamanhoFonte}px ${CONFIG.fonte.familia}`;
  ctx.fillStyle = CONFIG.fonte.cor;
  ctx.textAlign = 'center';

  // Add shadow for readability
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;

  // Draw each menu item centered in the area
  for (let i = 0; i < numItens; i++) {
    const y = yInicio + i * alturaLinha;
    ctx.fillText(CONFIG.emoji + itens[i], canvas.width / 2, y, largura);
  }

  const buffer = canvas.toBuffer('image/png');

  // Ensure public directory exists
  const outputDir = path.dirname(CONFIG.outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(CONFIG.outputPath, buffer);

  return buffer;
}

module.exports = { gerarArte, CONFIG };
