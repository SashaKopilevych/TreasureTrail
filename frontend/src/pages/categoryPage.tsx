import { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import type { Category } from "../types";
import { Toast } from "primereact/toast";

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
      //   showSuccess("categories loaded!");
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
      showSuccess("Successfully created category!");
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

      console.log("Deleted category successfully");

      if (!res.ok) {
        throw new Error(`HTTP error${res.status}`);
      }

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
          <div onClick={() => setCategoryState("show")}> Show all</div>
          <br />
          <div>
            <button
              onClick={() => {
                setCategoryState("create");
              }}
            >
              Create +
            </button>
          </div>
          <br />
          <div>
            <button
              onClick={() => {
                setCategoryState("update");
              }}
            >
              Update
            </button>
          </div>
          <br />
          <div>
            <button onClick={() => setCategoryState("delete")}>Delete -</button>
          </div>
          <br />
        </>
      )}
      {categoryState === "show" && (
        <>
          <button className="bg-amber-800" onClick={handleShowCategories}>
            Show all categories
          </button>
          {categories.map((category) => (
            <div key={category.id}> {category.name} </div>
          ))}
          <br />
          <button
            onClick={() => {
              setCategoryState("default");
            }}
          >
            Back
          </button>
        </>
      )}
      {categoryState === "create" && (
        <>
          <form action=""></form>
          <label htmlFor="category-name" className="bg-amber-900">
            Category name:{" "}
          </label>
          <input
            id="category-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <br />
          <button onClick={handleCreateCategory}>Submit</button>
          <br />
          <button
            onClick={() => {
              setCategoryState("default");
            }}
          >
            Back
          </button>
        </>
      )}
      {categoryState === "update" && (
        <>
          <form action="">
            <div>
              <label htmlFor="category">Choose a category: </label>
              <select
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
            <label htmlFor="category-name" className="bg-amber-700">
              New category name:{" "}
            </label>
            <input
              id="category-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <br />
            <p className="font-bold text-red-800">
              Note: you can't change the 'Unknown' category.
            </p>
            <br />
            <button
              onClick={handleUpdateCategory}
              disabled={!selectedCategory || isUnknownCategory}
            >
              Save changes
            </button>
            <br />
            <button
              onClick={() => {
                setCategoryState("default");
              }}
            >
              Back
            </button>
          </form>
        </>
      )}
      {categoryState === "delete" && (
        <>
          <form action="">
            <label htmlFor="category">Choose a category: </label>
            <select
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
            <br />
            <p className="bg-red-700 text-black">
              Are you sure you want to delete this category?
            </p>
            <button
              type="button"
              className="font-bold text-red-800"
              onClick={handleDeleteCategory}
            >
              Delete
            </button>
            <br />
            <button
              onClick={() => {
                setCategoryState("default");
              }}
            >
              Back
            </button>
          </form>
        </>
      )}
    </>
  );
}

export default CategoryPage;
