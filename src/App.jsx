import { useEffect, useRef, useState } from "react";

function App() {
  const canvasref = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [linewidth, setLineWidth] = useState(3);
  const [strokeColor, setStrokeColor] = useState("white");

  useEffect(() => {
    const canvas = canvasref.current;
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

  const startDrawing = (e) => {
    const canvas = canvasref.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        setIsDrawing(true);
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasref.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = linewidth;
        ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        ctx.stroke();
      }
    }
  };
  return (
    <>
      <canvas
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onMouseMove={draw}
        ref={canvasref}
        className="w-full h-full bg-black"
      ></canvas>
      <div className="fixed top-5 left-5 p-5 bg-gray-800 rounded-lg shadow-lg">
        <h3 className="text-white mb-3">Choose a color : </h3>
        <div className="flex mb-4">
          <button
            onClick={() => {
              setStrokeColor("yellow");
            }}
            className="rounded-full bg-yellow-400 mx-2 h-10 w-10"
          ></button>
          <button
            onClick={() => {
              setStrokeColor("blue");
            }}
            className="rounded-full bg-blue-400 mx-2 h-10 w-10"
          ></button>
          <button
            onClick={() => {
              setStrokeColor("green");
            }}
            className="rounded-full bg-green-400 mx-2 h-10 w-10"
          ></button>
          <button
            onClick={() => {
              setStrokeColor("red");
            }}
            className="rounded-full bg-red-400 mx-2 h-10 w-10"
          ></button>
          <button
            onClick={() => {
              setStrokeColor("white");
            }}
            className="rounded-full bg-white mx-2 h-10 w-10"
          ></button>
          <button
            onClick={() => {
              setStrokeColor("purple");
            }}
            className="rounded-full bg-purple-400 mx-2 h-10 w-10"
          ></button>
        </div>
        <p className='text-white mt-2'>Current Stoke Color: {strokeColor.toUpperCase()}</p>
        <h3 className="text-white mb-2">Brush Size:</h3>
        <input
          type="range"
          name=""
          id=""
          min={1}
          max={20}
          value={linewidth}
          onChange={(e) => {
            setLineWidth(e.target.value);
          }}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <p className="text-white mt-2">Current linewidth : {linewidth}px</p>
      </div>
    </>
  );
}

export default App;
