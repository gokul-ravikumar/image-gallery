
import { useState } from "react";

function App() {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  function handleImageChange(event) {
    const files = Array.from(event.target.files);

    const newImages = files.map((file) => {
      const url = URL.createObjectURL(file);

      return {
        id: crypto.randomUUID(),
        url: url,
        name: file.name,
      };
    });

    setImages((previousImages) => {
      previousImages.forEach((image) => {
        URL.revokeObjectURL(image.url);
      });

      return newImages;
    });

    setSelectedImage(null);
    event.target.value = "";
  }

  return (
    <main className="gallery">
      <h1>Image Gallery</h1>

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageChange}
      />

      <div className="image-grid">
        {images.map((image) => (
          <article className="image-card" key={image.id}>
            <img
              src={image.url}
              alt={image.name}
              onClick={() => setSelectedImage(image)}
            />
          </article>
        ))}
      </div>

      {/* Modal is outside image-grid */}
      {selectedImage && (
        <div
          className="preview-overlay"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="preview-content"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="close-button"
              onClick={() => setSelectedImage(null)}
            >
              &times;
            </button>

            <img
              src={selectedImage.url}
              alt={selectedImage.name}
            />

            <h2>{selectedImage.name}</h2>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
