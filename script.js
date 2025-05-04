if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js');
      });
    }

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    let points = [];
    let history = [];
    let redoStack = [];

    function drawPoint(x, y, label) {
      ctx.fillStyle = "blue";
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "black";
      ctx.font = "14px Arial";
      ctx.fillText(label, x + 8, y - 8);
    }

    function redraw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < points.length; i++) {
        drawPoint(points[i].x, points[i].y, i);
      }
      if (points.length >= 2) {
        for (let i = 1; i < points.length; i++) {
          ctx.beginPath();
          ctx.moveTo(points[i - 1].x, points[i - 1].y);
          ctx.lineTo(points[i].x, points[i].y);
          ctx.stroke();
        }
      }
      if (points.length === 3) {
        ctx.beginPath();
        ctx.moveTo(points[2].x, points[2].y);
        ctx.lineTo(points[0].x, points[0].y);
        ctx.stroke();
      }
    }

    canvas.addEventListener("click", (e) => {
      if (points.length >= 3) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      history.push([...points]);
      redoStack = [];
      points.push({ x, y });
      redraw();
    });

    function undo() {
      if (history.length > 0) {
        redoStack.push([...points]);
        points = history.pop();
        redraw();
      }
    }

    function redo() {
      if (redoStack.length > 0) {
        history.push([...points]);
        points = redoStack.pop();
        redraw();
      }
    }

    function resetCanvas() {
      points = [];
      history = [];
      redoStack = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      document.getElementById("result").textContent = "";
      document.getElementById("acres").textContent = "";
      document.getElementById("length01").value = "";
      document.getElementById("length12").value = "";
      document.getElementById("length20").value = "";
    }

    function drawLengthLabel(p1, p2, length, unit) {
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      ctx.fillStyle = "red";
      ctx.font = "12px Arial";
      ctx.fillText(`${length.toFixed(2)} ${unit}`, midX + 5, midY - 5);
    }

    function calculateArea() {
      if (points.length !== 3) {
        document.getElementById("result").textContent = "Please select 3 points on the canvas.";
        return;
      }

      const a = parseFloat(document.getElementById("length01").value);
      const b = parseFloat(document.getElementById("length12").value);
      const c = parseFloat(document.getElementById("length20").value);
      const unit = document.getElementById("unit").value;

      if (isNaN(a) || isNaN(b) || isNaN(c)) {
        document.getElementById("result").textContent = "Please enter all side lengths.";
        return;
      }

      const s = (a + b + c) / 2;
      const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
      document.getElementById("result").textContent = `Area: ${area.toFixed(2)} square ${unit}`;

      let acres = 0;
      switch (unit) {
        case 'm':
          acres = area / 4046.8564224;
          break;
        case 'ft':
          acres = area / 43560;
          break;
        case 'gl':
          acres = area / 100000; // ~1 acre = 100,000 square Gunter links
          break;
        case 'ml':
          acres = area / 100000; // similar for Metric links if needed
          break;
      }

      document.getElementById("acres").textContent = `Approx. ${acres.toFixed(2)} acres`;

      redraw();
      drawLengthLabel(points[0], points[1], a, unit);
      drawLengthLabel(points[1], points[2], b, unit);
      drawLengthLabel(points[2], points[0], c, unit);
    }
    // Scroll input into view on focus
    document.querySelectorAll('input').forEach(input => {
      input.addEventListener('focus', () => {
        setTimeout(() => {
          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      });
    });
