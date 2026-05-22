import { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import type { Category } from "../types";
import { Toast } from "primereact/toast";
import { IoMdCreate } from "react-icons/io";
import { GrUpdate } from "react-icons/gr";
import { MdDeleteForever, MdFormatListBulleted } from "react-icons/md";

function CategoryPage() {
  const toast = useRef<Toast>(null);

  const [name, setName] = useState<string>("");
  const [categoryState, setCategoryState] = useState<
    "default" | "show" | "create" | "update" | "delete"
  >("default");

  const {
    categories,
    setCategories,
    selectedCategory,
    setSelectedCategory,
    getTreasures,
  } = useOutletContext<{
    categories: Category[];
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
    selectedCategory: Category | null;
    setSelectedCategory: React.Dispatch<
      React.SetStateAction<Category | string | null>
    >;
    getTreasures: () => Promise<void>;
  }>();

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
    handleShowCategories();
  }, []);

  // Read all categories
  async function handleShowCategories() {
    try {
      const res = await fetch("http://localhost:3000/categories/list");

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.log("Failed to load categories.");
      showError("Failed to load categories.");
    }
  }
  //Create Category
  async function handleCreateCategory() {
    try {
      const res = await fetch("http://localhost:3000/category/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      showSuccess("Category created successfully!");
      setName(""); //clears input
      await handleShowCategories();
    } catch (error) {
      console.log("Failed to create category", error);
      showError("Failed to create category.");
    }
  }
  //Update Category
  async function handleUpdateCategory() {
    if (!selectedCategory) {
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/category/update/${selectedCategory.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name }),
        },
      );

      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`);
      }

      showSuccess("Category updated successfully!");

      setSelectedCategory(null);
      setName("");
      await handleShowCategories();
    } catch (error) {
      console.log("Failed to update the category", error);
      showError("Failed to update the category.");
    }
  }
  //Delete Category
  async function handleDeleteCategory() {
    if (!selectedCategory) {
      console.log("No category selected");
      return;
    }

    try {
      console.log("selected category:", selectedCategory);
      console.log("delete category id:", selectedCategory.id);
      const res = await fetch(
        `http://localhost:3000/category/delete/${selectedCategory.id}`,
        {
          method: "DELETE",
        },
      );

      if (!res.ok) {
        throw new Error(`HTTP error${res.status}`);
      }

      showSuccess("Category deleted successfully!");

      await handleShowCategories();
      await getTreasures();
      setSelectedCategory(null);
      setName("");
    } catch (error) {
      console.log("Failed to delete category: ", error);
      showError("Failed to delete a category.");
    }
  }

  const isUnknownCategory = selectedCategory?.name === "unknown";

  return (
    <>
      <Toast ref={toast} />
      {categoryState === "default" && (
        <>
          <div className="bg-color mt-5 flex flex-col gap-10 py-5 pl-2">
            <button
              className="btn-state"
              onClick={() => setCategoryState("show")}
            >
              <span>Show all</span>
              <MdFormatListBulleted />
            </button>

            <button
              className="btn-state"
              onClick={() => {
                setCategoryState("create");
              }}
            >
              Create
              <IoMdCreate className="h-5 w-5" />
            </button>

            <button
              className="btn-state"
              onClick={() => {
                setCategoryState("update");
              }}
            >
              Update
              <GrUpdate className="h-5 w-5" />
            </button>

            <button
              className="btn-state"
              onClick={() => setCategoryState("delete")}
            >
              <span>Delete</span>
              <MdDeleteForever className="h-6 w-6" />
            </button>
          </div>
        </>
      )}
      {categoryState === "show" && (
        <>
          <div className="bg-color my-3 flex flex-col gap-5 py-2">
            <p
              className="mx-3 w-fit rounded bg-[#5a33ad] px-3 text-2xl text-white"
              onClick={handleShowCategories}
            >
              All categories:
            </p>
            {categories.map((category) => (
              <div
                className="mx-3 w-fit rounded bg-[#b69dee] px-3 text-lg"
                key={category.id}
              >
                {" "}
                {category.name}{" "}
              </div>
            ))}

            <button
              className="btn-back mt-5 ml-5"
              onClick={() => {
                setCategoryState("default");
              }}
            >
              Back
            </button>
          </div>
        </>
      )}
      {categoryState === "create" && (
        <>
          <form action="" className="bg-color mt-5 py-3">
            <label htmlFor="category-name" className="text ml-4">
              Category name:{" "}
            </label>
            <input
              className="input"
              id="category-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="mt-10 flex gap-35">
              <button
                className="btn-back ml-5"
                type="button"
                onClick={() => {
                  setCategoryState("default");
                }}
              >
                Back
              </button>

              <button
                type="button"
                className="btn-confirm"
                onClick={handleCreateCategory}
              >
                <span>Submit</span>
              </button>
            </div>
          </form>
        </>
      )}
      {categoryState === "update" && (
        <>
          <form action="" className="bg-color mt-5 py-2">
            <div className="flex flex-col">
              <div>
                <label htmlFor="category" className="text mt-2 ml-2">
                  Choose a category:{" "}
                </label>
                <select
                  className="input"
                  value={selectedCategory ? String(selectedCategory.id) : ""}
                  onChange={(e) => {
                    const selectedId = Number(e.target.value);

                    const category = categories.find(
                      (category) => category.id === selectedId,
                    );

                    if (!category) {
                      setSelectedCategory(null);
                      setName("");
                      return;
                    }

                    setSelectedCategory(category);
                    setName(category.name);
                  }}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={String(category.id)}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="category-name" className="text mt-3 ml-2">
                  New category name:{" "}
                </label>
                <input
                  className="input"
                  id="category-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <p className="mx-1.5 mt-5 mb-3 flex items-center justify-center border-2 border-[#260077] bg-[#d0c4eb] px-1 py-1 text-lg font-medium">
                Note: you can't change the 'Unknown' category.
              </p>
            </div>
            <div className="mt-9 ml-2 flex gap-40">
              <button
                className="btn-back"
                type="button"
                onClick={() => {
                  setCategoryState("default");
                }}
              >
                <span>Back</span>
              </button>
              <button
                className="btn-confirm"
                type="button"
                onClick={handleUpdateCategory}
                disabled={!selectedCategory || isUnknownCategory}
              >
                <span>Save changes</span>
              </button>
            </div>
          </form>
        </>
      )}
      {categoryState === "delete" && (
        <>
          <form action="" className="bg-color mt-5 py-2">
            <label htmlFor="category" className="text mt-5 ml-2">
              Choose a category:{" "}
            </label>
            <select
              className="input"
              value={selectedCategory ? String(selectedCategory.id) : ""}
              onChange={(e) => {
                const selectedId = Number(e.target.value);

                const category = categories.find(
                  (category) => category.id === selectedId,
                );

                if (!category) {
                  setSelectedCategory(null);
                  setName("");
                  return;
                }

                setSelectedCategory(category);
                setName(category.name);
              }}
            >
              <option value="">select category</option>
              {categories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.name}
                </option>
              ))}
            </select>
            <p className="mx-1.5 mt-5 mb-3 flex items-center justify-center border-2 border-[#260077] bg-[#d0c4eb] px-1 py-1 text-lg font-medium">
              Are you sure you want to delete this category?
            </p>
            <div className="mt-5 ml-2 flex gap-50">
              <button
                className="btn-back"
                type="button"
                onClick={() => {
                  setCategoryState("default");
                }}
              >
                Back
              </button>
              <button
                type="button"
                className="btn-confirm"
                onClick={handleDeleteCategory}
              >
                Delete
              </button>
            </div>
          </form>
        </>
      )}
    </>
  );
}

export default CategoryPage;
