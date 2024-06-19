import React, { useState } from "react";
import axios from "axios";

export default function UploadComponent() {
    const [file, setFile] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [predictions, setPredictions] = useState([]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setImageUrl(URL.createObjectURL(e.target.files[0]));
        setPredictions([]);
    };

    const handleUpload = async () => {
        const formData = new FormData();
        formData.append("file", file);

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
            console.log(response);
            setPredictions(response.data);
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    return (
        <div className="upload-container">
            <div className="file-btn-container">
                <input type="file" onChange={handleFileChange} />
                <button onClick={handleUpload}>Predict</button>
            </div>

            {imageUrl && (
                <div className="image-container">
                    <img
                        className="uploaded-image"
                        src={imageUrl}
                        alt="Uploaded"
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
            )}
        </div>
    );
}
