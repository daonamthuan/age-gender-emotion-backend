import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import axios from "axios";

export default function WebcamComponent() {
    const [predictions, setPredictions] = useState([]);
    const webcamRef = useRef(null);
    const [isCapturing, setIsCapturing] = useState(true);
    const captureInterval = 2000; // Interval to capture and send image (in milliseconds)

    const capture = async () => {
        console.log("Webcam reference: ", webcamRef.current);
        if (webcamRef.current) {
            const imageSrc = await webcamRef.current.getScreenshot();
            if (imageSrc) {
                console.log("Captured image:", imageSrc); // Debug log
                const formData = new FormData();
                const blob = await fetch(imageSrc).then((res) => res.blob());
                formData.append("file", blob, "webcam.jpg");

                try {
                    const response = await axios.post(
                        "http://localhost:5000/predict",
                        formData,
                        {
                            headers: {
                                "Content-Type": "multipart/form-data",
                            },
                        }
                    );
                    setPredictions(response.data);
                } catch (error) {
                    console.error("Error uploading file:", error);
                } finally {
                    // Schedule the next capture after captureInterval milliseconds
                    if (isCapturing) {
                        setTimeout(capture, captureInterval);
                    }
                }
            }
            console.log("Capture failed! imageSrc: ", imageSrc);
        }
    };

    useEffect(() => {
        // Start capturing when component mounts
        if (isCapturing) {
            capture();
        }

        // Cleanup function to stop capturing
        return () => setIsCapturing(false);
    }, [isCapturing]);

    return (
        <div className="webcam-container">
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="webcam"
            />
            <div className="predictions-container">
                {predictions.map((prediction, index) => (
                    <div
                        key={index}
                        className="bounding-box"
                        style={{
                            top: prediction.y,
                            left: prediction.x,
                            width: prediction.width,
                            height: prediction.height,
                        }}
                    >
                        <p className="label-result">
                            {prediction.age +
                                " " +
                                prediction.gender +
                                " " +
                                prediction.emotion}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// import React, { useRef, useCallback, useEffect, useState } from "react";
// import Webcam from "react-webcam";
// import axios from "axios";

// export default function WebcamComponent() {
//     const webcamRef = useRef(null);
//     const canvasRef = useRef(null);
//     const [fps, setFps] = useState(0);
//     const [lastFrameTime, setLastFrameTime] = useState(Date.now());

//     const videoConstraints = {
//         width: 960,
//         height: 540,
//         facingMode: "user",
//         frameRate: { ideal: 30, max: 60 },
//     };

//     const capture = useCallback(() => {
//         const now = Date.now();
//         const elapsedTime = now - lastFrameTime;
//         const currentFps = 1000 / elapsedTime;
//         setFps(currentFps);
//         setLastFrameTime(now);

//         const imageSrc = webcamRef.current.getScreenshot();
//         predictAttributes(imageSrc);
//     }, [lastFrameTime]);

//     const predictAttributes = async (imageSrc) => {
//         try {
//             const response = await axios.post("http://localhost:5000/predict", {
//                 image: imageSrc,
//             });
//             drawPredictions(response.data);
//         } catch (error) {
//             console.error("Error during prediction:", error);
//         }
//     };

//     const drawPredictions = (predictions) => {
//         const canvas = canvasRef.current;
//         const context = canvas.getContext("2d");
//         const video = webcamRef.current.video;

//         if (canvas && context && video) {
//             context.clearRect(0, 0, canvas.width, canvas.height);
//             canvas.width = video.videoWidth;
//             canvas.height = video.videoHeight;

//             predictions.forEach((prediction) => {
//                 const { x, y, width, height, age, gender, emotion } =
//                     prediction;

//                 context.beginPath();
//                 context.rect(x, y, width, height);
//                 context.lineWidth = 2;
//                 context.strokeStyle = "red";
//                 context.stroke();

//                 context.fillStyle = "red";
//                 context.font = "16px Arial";
//                 context.fillText(`Age: ${age}`, x, y - 30);
//                 context.fillText(`Gender: ${gender}`, x, y - 10);
//                 context.fillText(`Emotion: ${emotion}`, x, y + 10);
//                 context.closePath();
//             });
//         }
//     };

//     useEffect(() => {
//         const interval = setInterval(() => {
//             capture();
//         }, 100); // 10 lần mỗi giây

//         return () => clearInterval(interval);
//     }, [capture]);

//     useEffect(() => {
//         console.log(`FPS: ${fps.toFixed(2)}`);
//     }, [fps]);

//     return (
//         <div className="webcam-container" style={{ position: "relative" }}>
//             <Webcam
//                 audio={false}
//                 ref={webcamRef}
//                 screenshotFormat="image/jpeg"
//                 videoConstraints={videoConstraints}
//                 style={{ position: "absolute" }}
//                 width={960}
//                 height={540}
//             />
//             <canvas
//                 ref={canvasRef}
//                 style={{ position: "absolute" }}
//                 width={960}
//                 height={540}
//             />
//         </div>
//     );
// }
