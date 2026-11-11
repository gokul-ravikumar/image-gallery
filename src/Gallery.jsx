import { useEffect, useRef, useState } from "react";
import { API_URL, request, postJson } from "./api.js";

function BrandMark() {
  return (
    <span className="auth-brand-mark" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.5-3.5L7 22" />
      </svg>
    </span>
  );
}

function UploadIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function Gallery({ user, onLogout }) {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  // Upload state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Initial fetch state
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Delete state (inside the preview modal)
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fileInputRef = useRef(null);

  // Keep the latest onLogout without re-running the fetch effect
  // every time the parent re-renders with a new callback.
  const onLogoutRef = useRef(onLogout);
  useEffect(() => {
    onLogoutRef.current = onLogout;
  }, [onLogout]);

  // Load the logged-in user's saved images when the Gallery mounts.
  // The backend decides ownership from the JWT cookie - we never send a user id.
  useEffect(() => {
    let cancelled = false;

    setFetching(true);
    setFetchError("");

    request("/images/my-images")
      .then((data) => {
        if (!cancelled) setImages(data.images ?? []);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 401) {
          onLogoutRef.current(); // session missing/expired -> back to login
          return;
        }
        setFetchError(err.message || "Could not load your images");
      })
      .finally(() => {
        if (!cancelled) setFetching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // Close the preview with the Escape key
  useEffect(() => {
    if (!selectedImage) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !deleting) closePreview();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedImage, deleting]);

  async function handleImageChange(event) {
    const files = Array.from(event.target.files);

    if (files.length === 0) return;

    setLoading(true);
    setError("");

    const uploadedImages = [];

    try {
      for (const file of files) {
        const formData = new FormData();

        formData.append("image", file);

        const response = await fetch(`${API_URL}/images/upload`, {
          method: "POST",
          body: formData,
          // Sends the HttpOnly JWT cookie so the protect middleware accepts us
          credentials: "include",
        });

        const data = await response.json();

        // Token missing/expired -> back to the login page
        if (response.status === 401) {
          onLogout();
          return;
        }

        if (!response.ok) {
          throw new Error(data.message || "Image upload failed");
        }

        // The saved MongoDB document (id, imageUrl, filename, createdAt)
        uploadedImages.push(data.image);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.message);
    } finally {
      // Add whatever was saved, even if a later file failed.
      // Newest first, matching the order returned by /images/my-images.
      if (uploadedImages.length > 0) {
        setImages((previousImages) => [
          ...uploadedImages.reverse(),
          ...previousImages,
        ]);
      }
      setLoading(false);
      event.target.value = "";
    }
  }

  async function handleLogout() {
    try {
      await postJson("/auth/logout"); // backend clears the cookie
    } catch {
      // ignore - we log out locally anyway
    }
    onLogout();
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function closePreview() {
    setSelectedImage(null);
    setDeleteError("");
  }

  async function handleDelete() {
    if (!selectedImage) return;
    if (!window.confirm("Delete this image? This cannot be undone.")) return;

    setDeleting(true);
    setDeleteError("");

    try {
      await request(`/images/${selectedImage.id}`, { method: "DELETE" });
      setImages((previousImages) =>
        previousImages.filter((image) => image.id !== selectedImage.id)
      );
      closePreview();
    } catch (err) {
      if (err.status === 401) {
        onLogout();
        return;
      }
      setDeleteError(err.message || "Failed to delete image");
    } finally {
      setDeleting(false);
    }
  }

  const initial = user.name?.trim()?.charAt(0)?.toUpperCase() || "?";
  const showEmptyState = !fetching && !fetchError && images.length === 0;

  return (
    <main className="gallery">
      <header className="gallery-header">
        <div className="gallery-header-inner">
          <h1 className="auth-brand gallery-brand">
            <BrandMark />
            Image Gallery
          </h1>

          <div className="gallery-user">
            <span className="avatar" aria-hidden="true">
              {initial}
            </span>
            <span className="gallery-welcome">
              Welcome, <strong>{user.name}</strong>
            </span>
            <button type="button" className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="gallery-container">
        {/* Shared hidden file input used by every "Upload Images" button */}
        <input
          ref={fileInputRef}
          id="gallery-upload-input"
          className="visually-hidden"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          disabled={loading}
          tabIndex={-1}
        />

        <section className="upload-panel" aria-labelledby="upload-title">
          <div className="upload-icon">
            <UploadIcon />
          </div>
          <div className="upload-text">
            <h2 id="upload-title" className="upload-title">
              Upload images
            </h2>
            <p className="upload-hint">
              Select one or more images. PNG, JPG, GIF or WebP up to 5 MB each.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={openFilePicker}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload Images"}
          </button>
        </section>

        {loading && (
          <p className="gallery-status" role="status">
            <span className="spinner" aria-hidden="true" />
            Uploading images...
          </p>
        )}

        {error && (
          <p className="auth-alert auth-alert--error" role="alert">
            {error}
          </p>
        )}

        <div className="gallery-section-header">
          <h2 className="gallery-section-title">Your images</h2>
          {!fetching && !fetchError && images.length > 0 && (
            <span className="gallery-count">
              {images.length} {images.length === 1 ? "image" : "images"}
            </span>
          )}
        </div>

        {fetching && (
          <p className="gallery-status" role="status">
            <span className="spinner" aria-hidden="true" />
            Loading your images...
          </p>
        )}

        {fetchError && (
          <div className="auth-alert auth-alert--error gallery-fetch-error" role="alert">
            <span>{fetchError}</span>
            <button
              type="button"
              className="auth-link"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Try again
            </button>
          </div>
        )}

        {showEmptyState && (
          <div className="empty-state">
            <div className="empty-state-icon" aria-hidden="true">
              <BrandMark />
            </div>
            <h3 className="empty-state-title">No images yet</h3>
            <p className="empty-state-text">Upload your first image to get started.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={openFilePicker}
              disabled={loading}
            >
              Upload Images
            </button>
          </div>
        )}

        {images.length > 0 && (
          <div className="image-grid">
            {images.map((image) => (
              <article className="image-card" key={image.id}>
                <img
                  src={image.imageUrl}
                  alt={image.filename || "Uploaded image"}
                  loading="lazy"
                  onClick={() => setSelectedImage(image)}
                />
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Modal is outside image-grid */}
      {selectedImage && (
        <div className="preview-overlay" onClick={() => !deleting && closePreview()}>
          <div
            className="preview-content"
            role="dialog"
            aria-modal="true"
            aria-label={selectedImage.filename || "Image preview"}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="close-button"
              aria-label="Close preview"
              onClick={closePreview}
              disabled={deleting}
            >
              &times;
            </button>

            <img
              src={selectedImage.imageUrl}
              alt={selectedImage.filename || "Uploaded image"}
            />

            {deleteError && (
              <p className="auth-alert auth-alert--error preview-error" role="alert">
                {deleteError}
              </p>
            )}

            <div className="preview-footer">
              <h2>{selectedImage.filename || "Untitled image"}</h2>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Gallery;
