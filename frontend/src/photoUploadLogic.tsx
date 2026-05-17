export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("/upload", {
    method: "POST",
    body: formData,
  });
  return res.json();
}
