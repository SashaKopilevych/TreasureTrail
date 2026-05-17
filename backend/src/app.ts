import express from "express";
import pool from "./db.js";
import cors from "cors";
import { upload } from "./photoUpload.js";
import { Result } from "pg";

const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("Main page");
});

////// TREASURE ENDPOINTS

//Read endpoint
app.get("/treasures/list", async (req, res) => {
  const result = await pool.query("SELECT * FROM treasure");
  res.json(result.rows);
});

// Filter (by category_id) endpoint
app.get("/treasure/filter/:id", async (req, res) => {
  const id = req.params.id;
  const category_idNumb = Number(id);
  const result = await pool.query(
    "SELECT id, description, image_name, latitude, longitude, hint, category_id, is_found FROM treasure WHERE category_id=$1",
    [category_idNumb],
  );
  res.json(result.rows);
});

// Create endpoint
app.post("/treasure/create", upload.single("image_name"), async (req, res) => {
  try {
    const image_name = req.file ? req.file.filename : null;

    const { description, latitude, longitude, hint, category_id } = req.body;
    const latNumb = Number(latitude);
    const longNumb = Number(longitude);
    if (
      (latitude !== undefined && isNaN(latNumb)) ||
      (longitude !== undefined && isNaN(longNumb))
    ) {
      return res.status(400).json({
        code: "invalidCoordinates",
        message: "Latitude or Longitude is invalid",
      });
    }

    const category_idNumb = Number(category_id);

    const verifyCategoryID = await pool.query(
      "SELECT 1 FROM category WHERE category.id = $1",
      [category_idNumb],
    );

    if (verifyCategoryID.rowCount == 0)
      return res
        .status(400)
        .json({ code: "invalidCategoryId", message: "Invalid category_id" });
    const result = await pool.query(
      `INSERT INTO treasure (image_name, description, latitude, longitude, hint, category_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING*`,
      [image_name, description, latNumb, longNumb, hint, category_idNumb],
    );
    res.json({ message: "Treasure created!", data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

//Update endpoint
app.put(
  "/treasure/update/:id",
  upload.single("image_name"),
  async (req, res) => {
    const image_name = req.file ? req.file.filename : null;
    const { id } = req.params;
    const { description, latitude, longitude, hint, category_id, is_found } =
      req.body;

    const latNumb = Number(latitude);
    const longNumb = Number(longitude);
    if (
      (latitude !== undefined && isNaN(latNumb)) ||
      (longitude !== undefined && isNaN(longNumb))
    )
      return res.status(400).json({
        code: "invalidCoordinates",
        message: "Latitude or Longitude is invalid.",
      });

    const idNumb = Number(id);
    if (!idNumb)
      return res.status(400).json({
        code: "invalidId",
        message: "Invalid ID.",
      });

    let isFoundBool = null;

    if (is_found !== undefined) {
      if (is_found === "true") {
        isFoundBool = true;
      } else if (is_found === "false") {
        isFoundBool = false;
      } else {
        return res.status(400).json({
          code: "invalidIsFound",
          message: "is_found must be true/false",
        });
      }

      const result = await pool.query(
        "UPDATE treasure SET image_name = COALESCE($2, image_name), description = COALESCE($3, description), latitude = COALESCE($4, latitude), longitude = COALESCE($5, longitude), hint = COALESCE($6, hint), category_id = COALESCE($7, category_id), is_found = COALESCE($8, is_found) WHERE id = $1 RETURNING *",
        [
          idNumb,
          image_name,
          description,
          latNumb,
          longNumb,
          hint,
          category_id,
          isFoundBool,
        ],
      );
      if (result.rowCount === 1)
        res.json({ message: `Treasure #${id} updated!`, data: result.rows[0] });
    }
  },
);

// Delete endpoint
app.delete("/treasure/delete/:id", async (req, res) => {
  const id = req.params.id;
  const idNumb = Number(id);
  if (!Number.isInteger(idNumb)) {
    return res
      .status(400)
      .json({ code: "InvalidIdType", message: "ID must be a number." });
  }

  const result = await pool.query(
    "DELETE FROM treasure WHERE id=$1 AND is_found = true RETURNING *",
    [idNumb],
  );
  if (result.rowCount === 0) res.status(404).send("Deleting error.");
  if (result.rowCount === 1) res.send(`treasure #${idNumb} deleted!`);
});

//Read chosen treasure endpoint
app.get("/treasure/details/:id", async (req, res) => {
  const id = req.params.id;
  const idNumb = Number(id);

  if (Number.isNaN(idNumb)) {
    return res.status(404).json({
      code: "InvalidTreasureIdType",
      message: "Treasure ID must be a number",
    });
  }
  const result = await pool.query(
    `SELECT treasure.id, treasure.description, treasure.image_name, treasure.latitude, treasure.longitude, treasure.hint, treasure.category_id, category.name AS category_name, treasure.is_found FROM treasure JOIN category ON treasure.category_id = category.id WHERE treasure.id = $1`,
    [idNumb],
  );
  if (result.rows.length === 0) {
    return res
      .status(404)
      .json({ code: "TreasureNotFound", message: "Treasure not found" });
  }

  return res.json(result.rows[0]);
});

// (Update) Mark treasure as Found
app.put("/treasure/mark-as-found/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res
      .status(400)
      .json({ code: "InvalidId", message: "Treasure ID must be an integer" });
  }

  try {
    const result = await pool.query(
      `UPDATE treasure SET is_found = true WHERE id=$1 RETURNING*`,
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        code: "TreasureNotFound",
        message: "Treasure was not found.",
      });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.log(error);
    return res.status(500);
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

//////// CATEGORY ENDPOINTS

// Create endpoint
app.post("/category/create", async (req, res) => {
  try {
    const name = req.body.name;

    if (name !== undefined && name !== null) {
      const result = await pool.query(
        "INSERT INTO category (name) VALUES ($1) RETURNING *",
        [name],
      );
      res.json({ message: "Category created!", data: result.rows[0] });
    } else {
      res.json({
        code: "invalidCategoryName",
        message: "Category name is invalid.",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Read endpoint
app.get("/categories/list", async (req, res) => {
  const result = await pool.query("SELECT * from category");
  res.json(result.rows);
});

// Delete endpoint
app.delete("/category/delete/:id", async (req, res) => {
  const { id } = req.params;
  const idNumb = Number(id);
  if (!idNumb) {
    return res.status(400).json({
      code: "invalidId",
      message: "Invalid ID.",
    });
  }

  if (!Number.isInteger(idNumb)) {
    return res.status(400).json({
      code: "InvalidCategoryId",
      message: "Category Id must be an integer.",
    });
  }

  try {
    const categoryUnknown = await pool.query(
      `SELECT id FROM category WHERE name = $1`,
      ["unknown"],
    );
    if (categoryUnknown.rowCount === 0) {
      return res.status(500).json({
        code: "UnknownCategoryNotFound",
        message: "Category 'unknown' does not exist.",
      });
    }

    const idUnknown = categoryUnknown.rows[0].id;

    if (idNumb === idUnknown) {
      return res.status(400).json({
        code: "CannotDeleteUnknownCategory",
        message: "'Unknown' category cannot be deleted.",
      });
    }

    await pool.query(
      `UPDATE treasure SET category_id = $1 WHERE category_id = $2`,
      [idUnknown, idNumb],
    );

    const deletedCategory = await pool.query(
      `DELETE FROM category WHERE id=$1 RETURNING *`,
      [idNumb],
    );

    if (deletedCategory.rowCount === 0) {
      return res.status(404).json({
        code: "CategoryNotFound",
        message: "Category was not found",
      });
    }

    return res.json({
      message: "Category deleted successfully!",
      deletedCategory: deletedCategory.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      code: "InternalServerError",
      message: "Failed to delete category",
    });
  }
});

// Update endpoint
app.put("/category/update/:id", async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    const idNum = Number(id);
    if (!Number.isInteger(idNum)) {
      return res.status(400).json({
        code: "invalidIdType",
        message: "Id must be a number.",
      });
    }
    const result = await pool.query(
      `UPDATE category SET name = COALESCE($2, name) WHERE id = $1 RETURNING *`,
      [idNum, name],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        code: "updateError",
        message: "Update error. Updating wasn't complete.",
      });
    }
    if (result.rowCount === 1)
      res.json({ message: `category updated!`, data: result.rows[0] });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error." });
  }
});
