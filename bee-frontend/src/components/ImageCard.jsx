import React from "react";

const ImageCard = ({ analysis, imageName, onImageClick }) => {
  const formatImageName = (filename) => {
    return filename.split("_")[0];
  };

  return (
    <div className="image-card" onClick={() => onImageClick(analysis, imageName)}>
      <img
        src={`http://127.0.0.1:8000/image/${analysis}/${imageName}`}
        alt={imageName}
        className="image"
      />
      <p>{formatImageName(imageName)}</p>
    </div>
  );
};

export default ImageCard;