import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Draggable from 'react-draggable';
import { SWATCHES } from './constants';

export default function Home() {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('rgb(255, 255, 255)');
    const [reset, setReset] = useState(false);
    const [strokeSize, setStrokeSize] = useState(3);
    const [dictOfVars, setDictOfVars] = useState({});
    const [result, setResult] = useState(null);
    const [latexPosition, setLatexPosition] = useState({ x: 10, y: 200 });
    const [latexExpression, setLatexExpression] = useState([]);
    const [showMenu, setShowMenu] = useState(false);
    const [isEraser, setIsEraser] = useState(false);

    useEffect(() => {
        if (latexExpression.length > 0 && window.MathJax) {
            setTimeout(() => {
                window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
            }, 0);
        }
    }, [latexExpression]);

    useEffect(() => {
        if (result) {
            renderLatexToCanvas(result.expression, result.answer);
        }
    }, [result]);

    useEffect(() => {
        if (reset) {
            resetCanvas();
            setLatexExpression([]);
            setResult(null);
            setDictOfVars({});
            setReset(false);
        }
    }, [reset]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight - canvas.offsetTop;
                ctx.lineCap = 'round';
                ctx.lineWidth = strokeSize;
            }
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML';
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
            window.MathJax.Hub.Config({
                tex2jax: { inlineMath: [['$', '$'], ['\\(', '\\)']] },
            });
        };

        return () => {
            document.head.removeChild(script);
        };
    }, [strokeSize]);

    const renderLatexToCanvas = (expression, answer) => {
        const latex = `\\(\\LARGE{${expression} = ${answer}}\\)`;
        setLatexExpression([...latexExpression, latex]);

        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    const resetCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.beginPath();
                const { offsetX, offsetY } = getMousePos(canvas, e);
                ctx.moveTo(offsetX, offsetY);
                setIsDrawing(true);
            }
        }
    };

    const draw = (e) => {
        if (!isDrawing) {
            return;
        }
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const { offsetX, offsetY } = getMousePos(canvas, e);
                ctx.strokeStyle = color;
                ctx.lineWidth = strokeSize;
                ctx.lineTo(offsetX, offsetY);
                ctx.stroke();
            }
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const getMousePos = (canvas, event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        return { offsetX: x, offsetY: y };
    };

    const handleTouchStart = (e) => {
        e.preventDefault();
        startDrawing(e.touches[0]);
    };

    const handleTouchMove = (e) => {
        e.preventDefault();
        draw(e.touches[0]);
    };

    const toggleMenu = () => setShowMenu(!showMenu);

    const runRoute = async () => {
        const canvas = canvasRef.current;

        if (canvas) {
            const response = await axios({
                method: 'post',
                url: `${import.meta.env.VITE_API_URL}/calculate`,
                data: {
                    image: canvas.toDataURL('image/png'),
                    dict_of_vars: dictOfVars
                }
            });

            const resp = await response.data;
            resp.data.forEach((data) => {
                if (data.assign === true) {
                    setDictOfVars({
                        ...dictOfVars,
                        [data.expr]: data.result
                    });
                }
            });

            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;

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

            setLatexPosition({ x: centerX, y: centerY });
            resp.data.forEach((data) => {
                setTimeout(() => {
                    setResult({
                        expression: data.expr,
                        answer: data.result
                    });
                }, 200);
            });
        }
    };

    const activateEraser = () => {
        setColor('rgb(0, 0, 0)');
        setIsEraser(true);
    };

    const deactivateEraser = () => {
        setIsEraser(false);
    };

    return (
        <div className="relative w-full h-screen bg-gray-900 text-white overflow-hidden">
            <div className="absolute top-4 left-4 z-20 flex items-center space-x-4">
                <button
                    onClick={toggleMenu}
                    className="bg-black text-white py-2 px-4 rounded hover:bg-gray-700 transition"
                >
                    {showMenu ? 'Close Menu' : 'Open Menu'}
                </button>

                <button
                    onClick={runRoute}
                    className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-800 transition"
                >
                    Run
                </button>
            </div>

            {showMenu && (
                <div className="absolute top-16 left-4 z-20 bg-gray-800 rounded p-4 mt-2 space-y-4 transition transform duration-500">
                    <button
                        onClick={() => setReset(true)}
                        className="w-full bg-red-600 py-2 rounded hover:bg-red-800 transition"
                    >
                        Reset
                    </button>
                    <div className="w-full space-y-2">
                        <label htmlFor="strokeSize">Stroke Size</label>
                        <input
                            type="range"
                            id="strokeSize"
                            min="1"
                            max="20"
                            value={strokeSize}
                            onChange={(e) => setStrokeSize(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <button
                        onClick={activateEraser}
                        onMouseEnter={activateEraser}
                        onMouseLeave={deactivateEraser}
                        className="w-full bg-white text-black py-2 rounded hover:bg-gray-300 transition"
                    >
                        Eraser
                    </button>
                    <div className="grid grid-cols-5 gap-2">
                        {SWATCHES.map((swatch) => (
                            <div
                                key={swatch}
                                className="w-8 h-8 rounded-full cursor-pointer hover:scale-110 transition"
                                style={{ backgroundColor: swatch }}
                                onClick={() => {
                                    setColor(swatch);
                                    deactivateEraser();
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            <canvas
                ref={canvasRef}
                id="canvas"
                className={`absolute top-0 left-0 w-full h-full bg-black ${isEraser ? 'cursor-pointer' : 'cursor-crosshair'}`}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={stopDrawing}
            />

            {latexExpression.map((latex, index) => (
                <Draggable
                    key={index}
                    defaultPosition={latexPosition}
                    onStop={(e, data) => setLatexPosition({ x: data.x, y: data.y })}
                >
                    <div className="absolute p-2 text-white rounded shadow-md">
                        <div className="latex-content">{latex}</div>
                    </div>
                </Draggable>
            ))}
        </div>
    );
}
