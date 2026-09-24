const canvases = {};

function initCanvas(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  
  // Ustawienie rozdzielczości kanwy do faktycznych wymiarów z CSS
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
  }
  
  resizeCanvas();

  let isDrawing = false;

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function startDrawing(e) {
    isDrawing = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(e) {
    if (!isDrawing) return;
    if (e.cancelable) e.preventDefault(); // Zapobiega przewijaniu strony podczas rysowania
    
    const pos = getPos(e);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
  }

  // Zdarzenia Myszki
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  window.addEventListener('mouseup', stopDrawing);

  // Zdarzenia Ekrany Dotykowe (Mobile)
  canvas.addEventListener('touchstart', startDrawing, { passive: false });
  canvas.addEventListener('touchmove', draw, { passive: false });
  canvas.addEventListener('touchend', stopDrawing);

  canvases[canvasId] = { canvas, ctx };
}

function clearCanvas(canvasId) {
  const item = canvases[canvasId];
  if (item) {
    item.ctx.clearRect(0, 0, item.canvas.width, item.canvas.height);
  }
}

function getCanvasDataURL(canvasId) {
  const item = canvases[canvasId];
  if (!item) return '';

  const pixelBuffer = new Uint32Array(
    item.ctx.getImageData(0, 0, item.canvas.width, item.canvas.height).data.buffer
  );
  const isCanvasBlank = !pixelBuffer.some(color => color !== 0);

  return isCanvasBlank ? '' : item.canvas.toDataURL('image/png');
}