import { useState } from "react";

export function UploadPhotos() {
  const [files, setFiles] = useState<File | null>(null);

  const handleSubmit = async () => {
    const formData = new FormData();
    // formData.append("image", files);

    await fetch("/upload", {
      method: "POST",
      body: formData,
    });
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => {
          if (e.target.files) {
            setFiles(e.target.files[0]);
          }
        }}
      />
      <button onClick={handleSubmit}>Upload photo</button>
    </div>
  );
}
