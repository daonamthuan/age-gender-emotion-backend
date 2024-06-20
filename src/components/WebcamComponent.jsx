import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

socket.on("connect", () => {
    console.log("Connected to server");
});

socket.on("disconnect", () => {
    console.log("Disconnected from server");
});

export default function WebcamComponent() {
    const webcamRef = useRef(null);
    const [predictions, setPredictions] = useState([]);
    const [isRequestInProgress, setIsRequestInProgress] = useState(false);

    useEffect(() => {
        socket.on("prediction", (data) => {
            setPredictions(data);
            setIsRequestInProgress(false);
        });

        socket.on("error", (error) => {
            console.error("Prediction error:", error);
            setIsRequestInProgress(false);
        });

        const interval = setInterval(() => {
            if (!isRequestInProgress && webcamRef.current) {
                capture();
            }
        }, 100);

        return () => {
            clearInterval(interval);
            socket.off("result");
            socket.off("error");
        };
    }, [isRequestInProgress]);

    const capture = async () => {
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) {
            console.error("Failed to capture image from webcam.");
            return;
        }
        try {
            const blob = await fetch(imageSrc).then((res) => res.blob());
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = reader.result.split(",")[1];
                socket.emit("image", { image: base64data });
                setIsRequestInProgress(true);
            };
            reader.readAsDataURL(blob);
        } catch (error) {
            console.error("Error capturing image:", error);
        }
    };

    return (
        <div className="outer-webcam-container">
            <div className="webcam-container">
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="webcam"
                />
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
