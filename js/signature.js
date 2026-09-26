// Obsługa podpisów na elementach Canvas
function setupSignatureCanvas(canvasId, clearBtnId) {
  const canvas = document.getElementById(canvasId);
  const clearBtn = document.getElementById(clearBtnId);
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let isDrawing = false;

  // Ustawienie wyższej rozdzielczości wewnętrznej dla płynniejszych linii
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width || 300;
  canvas.height = rect.height || 120;

  function getPos(e) {
    const currentRect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - currentRect.left,
      y: clientY - currentRect.top
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
    e.preventDefault(); // Zapobiega przewijaniu ekranu podczas podpisywania na telefonie
    const pos = getPos(e);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#002b66"; // Ciemnoniebieski kolor tuszu
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function stopDrawing() {
    isDrawing = false;
  }

  // Obsługa myszki (Komputer / Laptop)
  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDrawing);
  canvas.addEventListener("mouseleave", stopDrawing);

  // Obsługa dotyku (Smartfon / Tablet)
  canvas.addEventListener("touchstart", startDrawing, { passive: false });
  canvas.addEventListener("touchmove", draw, { passive: false });
  canvas.addEventListener("touchend", stopDrawing);

  // Przycisk czyszczenia pola podpisu
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
  }
}

// Inicjalizacja pól podpisów po załadowaniu drzewa DOM
document.addEventListener("DOMContentLoaded", () => {
  setupSignatureCanvas("client-signature", "clear-client-sig");
  setupSignatureCanvas("installer-signature", "clear-installer-sig");
});