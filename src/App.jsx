import { useEffect, useRef, useState } from "react";
import axios from 'axios';

function App() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [linewidth, setLineWidth] = useState(3);
  const [strokeColor, setStrokeColor] = useState("white");
  const [dictOfVars, setDictOfVars] = useState({});
  const [result, setResult] = useState();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - canvas.offsetTop;
        ctx.lineCap = "round";
        canvas.style.background = "black";
      }
    }
  }, []);

  const getPosition = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      };
    }
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const { x, y } = getPosition(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const { x, y } = getPosition(e);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = linewidth;
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  };

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const runRoute = async () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const response = await axios({
        method: 'post',
        url: `${import.meta.env.VITE_API_URL}/calculate`,
        data: {
          image: canvas.toDataURL('image/png'),
          dict_of_vars: dictOfVars,
        },
      });

      const resp = await response.data;
      console.log('Response', resp);
      resp.data.forEach((data) => {
        if (data.assign === true) {
          setDictOfVars({
            ...dictOfVars,
            [data.expr]: data.result,
          });
        }
      });

      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let minX = canvas.width,
        minY = canvas.height,
        maxX = 0,
        maxY = 0;

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4;
          if (imageData.data[i + 3] > 0) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }

      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;

      resp.data.forEach((data) => {
        setTimeout(() => {
          setResult({
            expression: data.expr,
            answer: data.result,
          });
        }, 1000);
      });
    }
  };

  return (
    <>
      <canvas
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onMouseMove={draw}
        onTouchStart={startDrawing}
        onTouchEnd={stopDrawing}
        onTouchMove={draw}
        ref={canvasRef}
        className="w-full h-full bg-black"
      ></canvas>

      <div className="fixed top-5 left-5 p-5 bg-gray-800 rounded-lg shadow-lg">
        <h3 className="text-white mb-3">Choose a color:</h3>
        <div className="flex mb-4">
          <button
            onClick={() => setStrokeColor("yellow")}
            className="rounded-full bg-yellow-400 mx-2 h-10 w-10"
          ></button>
          <button
            onClick={() => setStrokeColor("blue")}
            className="rounded-full bg-blue-400 mx-2 h-10 w-10"
          ></button>
          <button
            onClick={() => setStrokeColor("green")}
            className="rounded-full bg-green-400 mx-2 h-10 w-10"
          ></button>
          <button
            onClick={() => setStrokeColor("red")}
            className="rounded-full bg-red-400 mx-2 h-10 w-10"
          ></button>
          <button
            onClick={() => setStrokeColor("white")}
            className="rounded-full bg-white mx-2 h-10 w-10"
          ></button>
          <button
            onClick={() => setStrokeColor("purple")}
            className="rounded-full bg-purple-400 mx-2 h-10 w-10"
          ></button>
        </div>

        <p className="text-white mt-2">Current Stroke Color: {strokeColor.toUpperCase()}</p>

        <h3 className="text-white mb-2">Brush Size:</h3>
        <input
          type="range"
          min={1}
          max={20}
          value={linewidth}
          onChange={(e) => setLineWidth(e.target.value)}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <p className="text-white mt-2">Current Line Width: {linewidth}px</p>

        {/* Add buttons for Reset and Run API */}
        <button
          onClick={resetCanvas}
          className="bg-red-500 text-white px-4 py-2 rounded mt-4"
        >
          Reset Canvas
        </button>

        <button
          onClick={runRoute}
          className="bg-green-500 text-white px-4 py-2 rounded mt-4 ml-4"
        >
          Run API
        </button>
      </div>
    </>
  );
}

export default App;
