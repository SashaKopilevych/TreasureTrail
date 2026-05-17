import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { UploadPhotos } from "./photoUploadForm";

function createTreasure() {
  const [createdTreasure, setCreatedTreasure] = useState({
    description: "",
    latitude: "",
    longitude: "",
    hint: "",
  });

  const { getTreasures } = useOutletContext<{ getTreasures: () => null }>();

  const handleSubmit = async () => {
    await fetch("http://localhost:3000/treasure", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createdTreasure),
    }).then(() => {
      getTreasures();
    });
    console.log("Data sent!");
  };
  return (
    <>
      <div className="bg-blue-400">
        <div>
          <UploadPhotos />
        </div>
        <div>
          Description:
          <input
            name="description"
            value={createdTreasure.description}
            onChange={(e) =>
              setCreatedTreasure({
                ...createdTreasure,
                [e.target.name]: e.target.value,
              })
            }
          />
        </div>
        <div>
          Latitude:
          <input
            name="latitude"
            value={createdTreasure.latitude}
            onChange={(e) =>
              setCreatedTreasure({
                ...createdTreasure,
                [e.target.name]: e.target.value,
              })
            }
          />
        </div>
        <div>
          Longitude:
          <input
            name="longitude"
            value={createdTreasure.longitude}
            onChange={(e) =>
              setCreatedTreasure({
                ...createdTreasure,
                [e.target.name]: e.target.value,
              })
            }
          />
        </div>
        <div>
          Hint:
          <input
            name="hint"
            value={createdTreasure.hint}
            onChange={(e) =>
              setCreatedTreasure({
                ...createdTreasure,
                [e.target.name]: e.target.value,
              })
            }
          />
        </div>
      </div>
      <div className="bg-amber-50">
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </>
  );
}

export default createTreasure;
