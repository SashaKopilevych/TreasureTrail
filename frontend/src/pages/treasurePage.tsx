import { useState, useEffect, useRef } from "react";
import type { Category, Treasure } from "../types";
import { useNavigate, useOutletContext } from "react-router-dom";
import { IoMdCreate } from "react-icons/io";
import { GrUpdate } from "react-icons/gr";
import { MdDeleteForever } from "react-icons/md";
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
          <div className="flex w-full gap-1 pt-12">
            <div className="min-w-0 flex-1 px-2 py-1">
              <div className="inline-flex items-center rounded bg-gray-200 px-2 py-1.5 text-lg">
                <label
                  className="text-lg font-semibold"
                  htmlFor="filter-select"
                >
                  Filter:{" "}
                </label>
                <select
                  className="min-w-0"
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
              </div>
            </div>
            <div className="min-w-0 flex-1 px-3 py-1">
              <div className="inline-flex items-center rounded bg-gray-200 px-2 py-1.5 text-lg">
                <label
                  className="text-lg font-semibold"
                  htmlFor="category-select"
                >
                  Category:{" "}
                </label>
                <select
                  className="min-w-0"
                  value={selectedCategoryId}
                  onChange={(event) =>
                    setSelectedCategoryId(event.target.value)
                  }
                  id="category-select"
                >
                  <option value="all">all</option>
                  {categories.map((category) => (
                    <option key={category.id} value={String(category.id)}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {/* //////////////////////////// */}
          <div className="flex w-fit flex-col gap-15 pt-20 pl-2">
            <button onClick={() => setState("create")} className="btn-state">
              <span>Create</span>
              <IoMdCreate className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                (setSelectedTreasure(null), setState("update"));
              }}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border-3 border-gray-400 bg-gray-300 px-3 py-2 text-xl font-semibold hover:bg-gray-400"
            >
              <span>Update</span>
              <GrUpdate className="h-5 w-5" />
            </button>

            <button
              className="flex cursor-pointer items-center gap-3 rounded-2xl border-3 border-gray-400 bg-gray-300 px-3 py-2 text-xl font-semibold hover:bg-gray-400 active:border-gray-600 active:bg-gray-600"
              onClick={() => {
                {
                  setSelectedTreasure(null);
                  setState("delete");
                }
              }}
            >
              <span> Delete </span>
              <MdDeleteForever className="h-6 w-6" />
            </button>
          </div>
        </>
      )}
      {state === "create" && (
        <>
          <div className="flex flex-col gap-12">
            <form className="flex flex-col gap-4 px-2 pt-5" action="">
              <div className="w-fit text-lg font-medium">
                <label htmlFor="image">Image: </label>
                <input
                  className="rounded bg-gray-200"
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
              <div className="w-fit text-lg font-medium">
                <label htmlFor="description">Description: </label>
                <input
                  className="rounded bg-gray-200"
                  id="description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="w-fit text-lg font-medium">
                <label htmlFor="latitude">Latitude: </label>
                <input
                  className="rounded bg-gray-200"
                  id="latitude"
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                />
              </div>
              <div className="w-fit text-lg font-medium">
                <label htmlFor="longitude">Longitude: </label>
                <input
                  className="rounded bg-gray-200"
                  id="longitude"
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                />
              </div>
              <div className="w-fit text-lg font-medium">
                <label htmlFor="hint">Hint*: </label>
                <input
                  className="rounded bg-gray-200"
                  id="hint"
                  type="text"
                  value={hint}
                  onChange={(e) => setHint(e.target.value)}
                />
              </div>
              <div className="w-fit text-lg font-medium">
                <label htmlFor="category">Category: </label>
                <select
                  className="rounded bg-gray-200"
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
            {/* ////////////////////////////////// */}
            <div className="flex">
              <div className="flex flex-1 items-center justify-start px-6">
                <button
                  className="btn-back"
                  onClick={() => setState("default")}
                >
                  Back
                </button>
              </div>
              <div className="flex flex-1 items-center justify-start px-6">
                <button
                  className="btn-submit"
                  type="button"
                  onClick={handleCreateTreasure}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {state === "update" && selectedTreasure && !selectedTreasure.is_found && (
        <>
          <div className="flex flex-col gap-7 py-7">
            <form action="">
              <label htmlFor="image"></label>
              <input
                className="flex items-start px-4 text-lg font-semibold"
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
              <p className="flex items-start px-4 pt-2 text-lg font-medium">
                Previous photo:
              </p>
              <div className="px-4 py-2">
                {selectedTreasure.image_name && (
                  <img
                    src={`http://localhost:3000/uploads/${selectedTreasure.image_name}`}
                    className="w-full rounded border-5 border-amber-700"
                  />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex">
                  <label
                    className="flex items-center px-4 text-lg font-semibold"
                    htmlFor="description"
                  >
                    Description:{" "}
                  </label>
                  <input
                    className="w-fit rounded bg-gray-200 text-base"
                    id="description"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="flex">
                  <label
                    className="flex items-center px-4 text-lg font-semibold"
                    htmlFor="latitude"
                  >
                    Latitude:{" "}
                  </label>
                  <input
                    className="w-fit rounded bg-gray-200"
                    id="latitude"
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                  />
                </div>
                <div className="flex">
                  <label
                    className="flex items-center px-4 text-lg font-semibold"
                    htmlFor="longitude"
                  >
                    Longitude:{" "}
                  </label>
                  <input
                    className="w-fit rounded bg-gray-200"
                    id="longitude"
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                  />
                </div>
                <div className="flex">
                  <label
                    className="flex items-center px-4 text-lg font-semibold"
                    htmlFor="category"
                  >
                    Category:{" "}
                  </label>
                  <select
                    className="w-fit rounded bg-gray-200"
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
              </div>
            </form>
            <div className="flex gap-7">
              <div className="flex flex-1 items-center justify-start px-5">
                <button
                  className="btn-back"
                  type="button"
                  onClick={() => {
                    setState("default");
                    setSelectedTreasure(null);
                  }}
                >
                  Back
                </button>
              </div>
              <div className="flex flex-1 items-center justify-start py-1">
                <button
                  className="btn-submit"
                  type="button"
                  onClick={handleUpdateTreasure}
                >
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {state === "update" && selectedTreasure && selectedTreasure.is_found && (
        <>
          <div className="flex flex-col gap-8 pt-7">
            <p className="flex items-center justify-center border-4 border-red-500 bg-gray-200 px-3 py-3 text-xl font-semibold text-red-700">
              This treasure is already found and cannot be updated.
            </p>
            <div className="flex items-center justify-start px-3">
              <button
                className="btn-back"
                onClick={() => {
                  setState("default");
                  setSelectedTreasure(null);
                }}
              >
                Back
              </button>
            </div>
          </div>
        </>
      )}

      {state === "update" && !selectedTreasure && (
        <>
          <div className="flex flex-col gap-7 pt-7">
            <div className="notSelected">
              Please select a treasure to update.
            </div>
            <div className="flex items-center justify-start px-3">
              <button
                className="btn-back"
                type="button"
                onClick={() => {
                  setState("default");
                  setSelectedTreasure(null);
                }}
              >
                Back
              </button>
            </div>
          </div>
        </>
      )}

      {state === "delete" && selectedTreasure && selectedTreasure.is_found && (
        <>
          <div className="flex flex-col gap-3 px-2 pt-7">
            <p className="w-fit border-5 border-red-800 bg-gray-300 px-7 text-xl font-bold text-red-800">
              Are you sure you want to delete this treasure?
            </p>
            <div className="flex gap-5">
              <button className="btn-delete" onClick={handleDeleteTreasure}>
                Delete
              </button>
              <div className="flex-1 items-center justify-start px-3">
                <button
                  className="btn-back"
                  type="button"
                  onClick={() => {
                    setState("default");
                    setSelectedTreasure(null);
                  }}
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {state === "delete" && selectedTreasure && !selectedTreasure.is_found && (
        <>
          <div className="flex flex-col gap-7 pt-7">
            <p className="flex items-center justify-center border-4 border-red-500 bg-gray-200 px-3 py-3 text-xl font-semibold text-red-700">
              You can delete only found treasures.
            </p>
            <button className="btn-back" onClick={() => setState("default")}>
              Back
            </button>
          </div>
        </>
      )}

      {state === "delete" && !selectedTreasure && (
        <>
          <div className="flex flex-col gap-7 pt-7">
            <div className="notSelected">
              Please select a treasure to delete.
            </div>
            <button
              className="btn-back w-fit"
              onClick={() => {
                setState("default");
                setSelectedTreasure(null);
              }}
            >
              <span>Back</span>
            </button>
          </div>
        </>
      )}
    </>
  );
}
export default TreasurePage;
