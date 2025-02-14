import React, { useEffect, useState } from "react";
import ImageCard from "./ImageCard";
import ImageAnalysis from "./ImageAnalysis";
import "../styles/gallery.css";

const ImageGallery = () => {
  const [imagesByAnalysis, setImagesByAnalysis] = useState({});
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/images")
      .then((res) => res.json())
      .then((data) => {
        if (data.analyses) {
          setImagesByAnalysis(data.analyses);
        }
      })
      .catch((err) => console.error("Erreur de connexion:", err));
  }, []);

  const formatAnalysisDate = (analysis) => {
    const match = analysis.match(/analysis_(\d{8})_(\d{4})/);
    if (match) {
      const date = match[1];
      const hour = match[2];
      return `${date.slice(6, 8)}/${date.slice(4, 6)}/${date.slice(0, 4)} à ${hour.slice(0, 2)}h${hour.slice(2)}`;
    }
    return analysis;
  };

  const handleImageClick = (analysis, imageName) => {
    setModalImage({ analysis, imageName });
  };

  const closeModal = () => {
    setModalImage(null);
  };

  return (
    <div className="gallery-container">
      <h1>🐝 Projet Polliconnect 🐝</h1>

      <div className="gallery-wrapper">
        {Object.keys(imagesByAnalysis).length > 0 ? (
          Object.entries(imagesByAnalysis).map(([analysis, imgs]) => (
            <div key={analysis} className="analysis-group">
              <h2>Analyse du {formatAnalysisDate(analysis)}</h2>
              <div className="gallery">
                {imgs.map((img, index) => (
                  <ImageCard
                    key={index}
                    analysis={analysis}
                    imageName={img}
                    onImageClick={handleImageClick}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <p>Chargement des images...</p>
        )}
      </div>

      <ImageAnalysis imagesByAnalysis={imagesByAnalysis} />

      {modalImage && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeModal}>×</button>
            <img
              src={`http://127.0.0.1:8000/image/${modalImage.analysis}/${modalImage.imageName}`}
              alt={modalImage.imageName}
              className="modal-image"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
