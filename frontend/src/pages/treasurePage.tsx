import { useState, useEffect, useRef } from "react";
import type { Category, Treasure } from "../types";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Toast } from "primereact/toast";

function TreasurePage() {
  const [categories, setCategories] = useState<Category[]>([]); //list of all categories from backend
  const [image, setImage] = useState<File | null>(null);
  const [description, setDescription] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [hint, setHint] = useState<string>("");
  const [categoryId, setCategoryId] = useState("");
  const [is_found, setIsFound] = useState<boolean>(false);

  let navigate = useNavigate();

  const toast = useRef<Toast>(null);

  function showSuccess(message: string) {
    toast.current?.show({
      severity: "success",
      summary: "Success",
      detail: message,
      life: 4000,
      className:
        " whitespace-pre-line bg-green-300 text-green-900 border-2 border-green-500",
    });
  }

  function showError(message: string) {
    toast.current?.show({
      severity: "error",
      summary: "Error",
      detail: message,
      life: 4000,
      className: "bg-red-300 text-red-900 border-2 border-red-500",
    });
  }

  useEffect(() => {
    fetch("http://localhost:3000/categories/list")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
      })
      .catch((error) => {
        console.log("Failed to load categories: ", error);
      });
  }, []);

  //OutletContext
  const {
    selectedTreasure,
    setSelectedTreasure,
    selectedCategoryId,
    setSelectedCategoryId,
    setTreasures,
    setState,
    state,
    selectedFilter,
    setSelectedFilter,
    getTreasures,
  } = useOutletContext<{
    selectedTreasure: Treasure | null;
    setSelectedTreasure: React.Dispatch<React.SetStateAction<Treasure | null>>;
    treasures: Treasure[];
    setTreasures: React.Dispatch<React.SetStateAction<Treasure[]>>;
    setSelectedCategoryId: React.Dispatch<React.SetStateAction<string>>;
    selectedCategoryId: string;
    state: "default" | "create" | "update" | "delete";
    setState: React.Dispatch<
      React.SetStateAction<"default" | "create" | "update" | "delete">
    >;
    selectedFilter: string;
    setSelectedFilter: React.Dispatch<React.SetStateAction<string>>;
    getTreasures: () => Promise<void>;
  }>();

  // Filter categories
  useEffect(() => {
    const url =
      selectedCategoryId === "all"
        ? "http://localhost:3000/treasures/list"
        : `http://localhost:3000/treasure/filter/${selectedCategoryId}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => setTreasures(data));
  }, [selectedCategoryId, setTreasures]);

  //Create Treasure
  async function handleCreateTreasure() {
    const formData = new FormData();
    if (image) {
      formData.append("image_name", image);
    } else {
      alert("Please upload an image!");
      return;
    }
    formData.append("description", description);
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
    formData.append("hint", hint);
    formData.append("category_id", categoryId);

    const response = await fetch("http://localhost:3000/treasure/create", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      showSuccess("Treasure created successfully!");
    } else {
      showError("Error during creating treasure.");
    }

    await getTreasures();
  }
  // Return done form for updating
  useEffect(() => {
    if (!selectedTreasure) {
      return;
    }

    setDescription(selectedTreasure.description);
    setLatitude(String(selectedTreasure.latitude));
    setLongitude(String(selectedTreasure.longitude));
    setHint(selectedTreasure.hint ?? "");
    setCategoryId(selectedTreasure.category_id);
    setIsFound(selectedTreasure.is_found);
  }, [selectedTreasure]);

  //Update Treasure
  async function handleUpdateTreasure() {
    if (!selectedTreasure) {
      showError("Please choose a treasure.");
    }
    const formData = new FormData();

    if (image) {
      formData.append("image_name", image);
    }
    formData.append("description", description);
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
    formData.append("hint", hint);
    formData.append("category_id", String(categoryId));
    formData.append("is_found", String(is_found));

    const response = await fetch(
      `http://localhost:3000/treasure/update/${selectedTreasure?.id}`,
      {
        method: "PUT",
        body: formData,
      },
    );

    if (response.ok) {
      showSuccess("Treasure updated successfully!");
      setSelectedTreasure(null);
      setState("default");
    } else {
      showError("Error while treasure updating.");
    }
  }
  //Delete Treasure
  async function handleDeleteTreasure() {
    if (!selectedTreasure) {
      showError("Please choose a treasure DELETE!");
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:3000/treasure/delete/${selectedTreasure.id}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) {
        showError("Error during deleting treasure.");
      }

      showSuccess("Treasure deleted successfully!");

      navigate("/treasure");
      setSelectedTreasure(null);
    } catch (error) {
      console.log("Failed to delete treasure.", error);
      showError("Failed to delete treasure.");
    }
  }

  return (
    <>
      <Toast ref={toast} />
      {state === "default" && (
        <>
          <div>
            <button onClick={() => setState("create")}>Create +</button>
          </div>
          <br />
          <div>
            <button
              onClick={() => {
                (setSelectedTreasure(null), setState("update"));
              }}
            >
              Update
            </button>
          </div>
          <br />
          <div>
            <button
              onClick={() => {
                (setSelectedTreasure(null), setState("delete"));
              }}
            >
              Delete
            </button>
          </div>
          <br />
          <label htmlFor="category-select">Category</label>
          <select
            value={selectedCategoryId}
            onChange={(event) => setSelectedCategoryId(event.target.value)}
            id="category-select"
          >
            <option value="all">all</option>
            {categories.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {category.name}
              </option>
            ))}
          </select>
          <br />
          <label htmlFor="filter-select">Filter</label>
          <select
            id="filter-select"
            value={selectedFilter}
            onChange={(event) =>
              setSelectedFilter(
                event.target.value as "all" | "found" | "not-found",
              )
            }
          >
            <option value="all">All</option>
            <option value="found">Found</option>
            <option value="not-found">Not found</option>
          </select>
        </>
      )}
      {state === "create" && (
        <>
          <form action="">
            <div>
              <label htmlFor="image">Image</label>
              <input
                id="image"
                type="file"
                accept="image/jpeg, image/png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImage(file);
                  }
                }}
              />
            </div>
            <div>
              <label htmlFor="description">Description: </label>
              <input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="latitude">Latitude: </label>
              <input
                id="latitude"
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="longitude">Longitude: </label>
              <input
                id="longitude"
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="hint">Hint*: </label>
              <input
                id="hint"
                type="text"
                value={hint}
                onChange={(e) => setHint(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="category">Category: </label>
              <select
                id="category"
                name="category_id"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </form>
          <div>
            <button type="button" onClick={handleCreateTreasure}>
              Submit
            </button>
          </div>
          <div>
            <button onClick={() => setState("default")}>Back</button>
          </div>
        </>
      )}

      {state === "update" && selectedTreasure && !selectedTreasure.is_found && (
        <>
          <form action="">
            <label htmlFor="image"></label>
            <input
              id="image"
              type="file"
              accept="image/jpeg, image/png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setImage(file);
                }
              }}
            />
            <div>
              {selectedTreasure.image_name && (
                <img
                  src={`http://localhost:3000/uploads/${selectedTreasure.image_name}`}
                  className="w-full rounded"
                />
              )}
            </div>
            <div>
              <label htmlFor="description">Description: </label>
              <input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="latitude">Latitude: </label>
              <input
                id="latitude"
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="longitude">Longitude: </label>
              <input
                id="longitude"
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="category">Category: </label>
              <select
                id="category"
                name="category_id"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </form>
          <button type="button" onClick={handleUpdateTreasure}>
            Save changes
          </button>
          <button
            type="button"
            onClick={() => {
              setState("default");
              setSelectedTreasure(null);
            }}
          >
            Back
          </button>
        </>
      )}

      {state === "update" && selectedTreasure && selectedTreasure.is_found && (
        <>
          <p>This treasure is already found and cannot be updated.</p>
          <button
            type="button"
            onClick={() => {
              setState("default");
              setSelectedTreasure(null);
            }}
          >
            Back
          </button>
        </>
      )}

      {state === "update" && !selectedTreasure && (
        <>
          <div>Please choose a treasure.</div>
          <button
            onClick={() => {
              setState("default");
              setSelectedTreasure(null);
            }}
          >
            Back
          </button>
        </>
      )}

      {state === "delete" && selectedTreasure && selectedTreasure.is_found && (
        <>
          <form action="">
            <label htmlFor=""></label>
            <div></div>
          </form>
          <p className="bg-red-700 text-black">
            Are you sure you want to delete this treasure?
          </p>
          <button onClick={() => setState("default")}>Back</button>
          <button
            className="font-bold text-red-800"
            onClick={handleDeleteTreasure}
          >
            Delete
          </button>
        </>
      )}

      {state === "delete" && selectedTreasure && !selectedTreasure.is_found && (
        <>
          <p>You can delete only found treasures.</p>
          <br />
          <button onClick={() => setState("default")}>Back</button>
        </>
      )}

      {state === "delete" && !selectedTreasure && (
        <>
          <div>Please choose a treasure to delete.</div>
          <button
            onClick={() => {
              setState("default");
              setSelectedTreasure(null);
            }}
          >
            Back
          </button>
        </>
      )}
    </>
  );
}
export default TreasurePage;
