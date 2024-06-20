import React, { useState } from "react";
import WebcamComponent from "./components/WebcamComponent";
import UploadComponent from "./components/UploadComponent";
import "./PredictionApp.css";

export default function PredictionApp() {
    const [mode, setMode] = useState("webcam");

    return (
        <div className="container">
            <h1>Age, Gender and Emotion <br/> Prediction</h1>
            <div className="btn-mode">
                <button onClick={() => setMode("webcam")}>Use Webcam</button>
                <button onClick={() => setMode("upload")}>Upload Image</button>
            </div>
            {mode === "webcam" ? <WebcamComponent /> : <UploadComponent />}
        </div>
    );
}
