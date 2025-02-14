import React, { useEffect, useState } from "react";
import "../styles/gallery.css";

const ImageAnalysis = ({ imagesByAnalysis }) => {
  const [speciesCount, setSpeciesCount] = useState({});

  useEffect(() => {
    countSpecies(imagesByAnalysis);
  }, [imagesByAnalysis]);

  const countSpecies = (analyses) => {
    if (!analyses || Object.keys(analyses).length === 0) return;

    const counts = {};
    Object.values(analyses).flat().forEach((imageName) => {
      const species = imageName.split("_")[0]; // Récupère ce qui est avant "_"
      if (species) counts[species] = (counts[species] || 0) + 1;
    });

    setSpeciesCount(counts);
  };

  return (
    <div className="analysis-section">
      <h2>📊 Analyse des Images</h2>
      <ul className="analysis-list">
        {Object.entries(speciesCount)
          .filter(([species]) => species.trim() !== "") // ✅ Ignore les noms vides
          .map(([species, count]) => (
            <li key={species}>
              <strong>{species}</strong> : {count} images
            </li>
          ))}
      </ul>
    </div>
  );
};

export default ImageAnalysis;
