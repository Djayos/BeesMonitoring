import React, { useEffect, useState, useRef } from "react";
import ImageCard from "./ImageCard";
import ImageAnalysis from "./ImageAnalysis";
import "../styles/gallery.css";

const ImageGallery = () => {
  const [imagesByAnalysis, setImagesByAnalysis] = useState({});
  const [modalImage, setModalImage] = useState(null);
  const [selectedAnalyses, setSelectedAnalyses] = useState([]);
  const [filteredImages, setFilteredImages] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/images")
      .then((res) => res.json())
      .then((data) => {
        if (data.analyses) {
          const sortedAnalyses = Object.keys(data.analyses).sort((a, b) => b.localeCompare(a));
          const sortedData = Object.fromEntries(sortedAnalyses.map((key) => [key, data.analyses[key]]));
          setImagesByAnalysis(sortedData);
          setFilteredImages(sortedData);
        }
      })
      .catch((err) => console.error("Erreur de connexion:", err));
  }, []);

  useEffect(() => {
    if (selectedAnalyses.length === 0) {
      setFilteredImages(imagesByAnalysis);
    } else {
      const filtered = selectedAnalyses.reduce((acc, analysis) => {
        if (imagesByAnalysis[analysis]) {
          acc[analysis] = imagesByAnalysis[analysis];
        }
        return acc;
      }, {});
      setFilteredImages(filtered);
    }
  }, [selectedAnalyses, imagesByAnalysis]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatAnalysisDate = (analysis) => {
    const match = analysis.match(/analysis_(\d{8})_(\d{4})/);
    if (match) {
      const date = match[1];
      let hour = parseInt(match[2].slice(0, 2), 10) + 1;
      const minutes = match[2].slice(2);
      return `${date.slice(6, 8)}/${date.slice(4, 6)}/${date.slice(0, 4)} à ${hour.toString().padStart(2, '0')}h${minutes}`;
    }
    return analysis;
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleCheckboxChange = (analysis) => {
    setSelectedAnalyses((prev) =>
      prev.includes(analysis) ? prev.filter((a) => a !== analysis) : [...prev, analysis]
    );
  };

  const selectAll = () => {
    setSelectedAnalyses(Object.keys(imagesByAnalysis));
  };

  const deselectAll = () => {
    setSelectedAnalyses([]);
  };

  return (
    <div className="gallery-container">
      <h1>🐝 Bee's Monitoring 🐝</h1>
      
      <div className="custom-dropdown" ref={dropdownRef}>
        <button className="dropdown-button" onClick={toggleDropdown}>Sélectionner des analyses ▼</button>
        {dropdownOpen && (
          <div className="dropdown-content">
            <div className="dropdown-actions">
              <button className="dropdown-action" onClick={selectAll}>Tout sélectionner</button>
              <button className="dropdown-action" onClick={deselectAll}>Tout désélectionner</button>
            </div>
            {Object.keys(imagesByAnalysis).map((analysis) => (
              <label key={analysis} className="dropdown-item">
                <input
                  type="checkbox"
                  checked={selectedAnalyses.includes(analysis)}
                  onChange={() => handleCheckboxChange(analysis)}
                />
                {formatAnalysisDate(analysis)}
              </label>
            ))}
          </div>
        )}
      </div>
      
      <div className="gallery-wrapper">
        {Object.keys(filteredImages).length > 0 ? (
          Object.entries(filteredImages).map(([analysis, imgs]) => (
            <div key={analysis} className="analysis-group">
              <h2>Analyse du {formatAnalysisDate(analysis)}</h2>
              <div className="gallery">
                {imgs.map((img, index) => (
                  <ImageCard key={index} analysis={analysis} imageName={img} onImageClick={() => setModalImage({ analysis, imageName: img })} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <p>Aucune analyse sélectionnée ou chargement des images...</p>
        )}
      </div>

      <ImageAnalysis imagesByAnalysis={filteredImages} />
    </div>
  );
};

export default ImageGallery;
