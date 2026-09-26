// Obsługa podpisów na elementach Canvas
function setupSignatureCanvas(canvasId, clearBtnId) {
  const canvas = document.getElementById(canvasId);
  const clearBtn = document.getElementById(clearBtnId);
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let isDrawing = false;

  // Poprawne ustawienie rozdzielczości z uwzględnieniem ekranów Retina/DPI
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Zapamiętanie dotychczasowej zawartości przed zmianą rozmiaru
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");

    if (tempCtx && canvas.width > 0 && canvas.height > 0) {
      tempCtx.drawImage(canvas, 0, 0);
    }

    // Ustawienie fizycznych wymiarów płótna w pikselach
    canvas.width = Math.floor((rect.width || 300) * dpr);
    canvas.height = Math.floor((rect.height || 120) * dpr);

    // Reset transformacji i ponowne przeskalowanie kontekstu
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    // Domyślne parametry pędzla
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#002b66"; // Ciemnoniebieski kolor tuszu

    // Przerysowanie zapisanej zawartości
    if (tempCanvas.width > 0 && tempCanvas.height > 0) {
      ctx.drawImage(tempCanvas, 0, 0, canvas.width / dpr, canvas.height / dpr);
    }
  }

  resizeCanvas();

  // Aktualizacja wymiarów przy zmianie orientacji lub rozmiaru ekranu
  window.addEventListener("resize", resizeCanvas);

  function getPos(e) {
    const currentRect = canvas.getBoundingClientRect();
    const touch = e.touches && e.touches[0];
    const clientX = touch ? touch.clientX : e.clientX;
    const clientY = touch ? touch.clientY : e.clientY;

    return {
      x: clientX - currentRect.left,
      y: clientY - currentRect.top
    };
  }

  function startDrawing(e) {
    if (e.type === "touchstart") e.preventDefault();

    isDrawing = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);

    // Umożliwia stawianie kropek przy pojedynczym dotknięciu/kliknięciu
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault(); // Zapobiega przewijaniu strony podczas podpisywania

    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function stopDrawing() {
    if (isDrawing) {
      ctx.closePath();
      isDrawing = false;
    }
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
      // Wyczyszczenie całego obszaru niezależnie od skali dpr
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    });
  }
}

// Helper: Pobieranie czystego DataURL do zapisu w bazie / PDF
function getSignatureDataURL(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return "";

  const ctx = canvas.getContext("2d");
  const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  // Sprawdzenie czy w kanale Alpha (przezroczystości) są jakiekolwiek piksele > 0
  let isBlank = true;
  for (let i = 3; i < pixelData.length; i += 4) {
    if (pixelData[i] !== 0) {
      isBlank = false;
      break;
    }
  }

  return isBlank ? "" : canvas.toDataURL("image/png");
}

// Inicjalizacja pól podpisów po załadowaniu drzewa DOM
document.addEventListener("DOMContentLoaded", () => {
  setupSignatureCanvas("client-signature", "clear-client-sig");
  setupSignatureCanvas("installer-signature", "clear-installer-sig");
});