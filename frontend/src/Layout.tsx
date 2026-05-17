import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { GiOpenTreasureChest } from "react-icons/gi";
import { TbCategoryFilled } from "react-icons/tb";
import { IconContext } from "react-icons";
import MapClickHandler from "./mapEvents";
import type { Treasure, Category } from "./types";
import { Toast } from "primereact/toast";

function Layout() {
  let navigate = useNavigate();
  const toast = useRef<Toast>(null);

  const [treasures, setTreasures] = useState<Treasure[]>([]);
  const [selectedTreasure, setSelectedTreasure] = useState<Treasure | null>(
    null,
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "found" | "not-found"
  >("all");

  const [state, setState] = useState<
    "default" | "create" | "update" | "delete" | "show"
  >("default");

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  async function getTreasures(): Promise<void> {
    try {
      const res = await fetch("http://localhost:3000/treasures/list");

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data: Treasure[] = await res.json();
      setTreasures(data);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    getTreasures();
  }, []);

  //test to see which treasures are chosen/filtered
  useEffect(() => {
    console.log("Treasures in Layout:", treasures);
  }, [treasures]);

  const filteredTreasure = treasures.filter((treasure) => {
    if (selectedFilter === "all") {
      return true;
    }

    if (selectedFilter === "found") {
      return treasure.is_found === true;
    }

    if (selectedFilter === "not-found") {
      return treasure.is_found === false;
    }

    return true;
  });

  return (
    <>
      <Toast ref={toast} />
      <div className="grid grid-cols-[25%_75%]">
        <div className="bg-amber-600">
          <div className="flex flex-row">
            <div className="basis-64">
              <IconContext.Provider value={{ color: "black", size: "4em" }}>
                <GiOpenTreasureChest onClick={() => navigate("/treasure")} />
              </IconContext.Provider>
            </div>
            <div className="basis-64">
              <IconContext.Provider value={{ color: "black", size: "3em" }}>
                <TbCategoryFilled onClick={() => navigate("/category")} />
              </IconContext.Provider>
            </div>
          </div>

          <Outlet
            context={{
              state,
              setState,
              selectedTreasure,
              setSelectedTreasure,
              getTreasures,
              setSelectedCategoryId,
              selectedCategoryId,
              userLocation,
              setUserLocation,
              treasures,
              setTreasures,
              selectedFilter,
              setSelectedFilter,
              categories,
              setCategories,
              selectedCategory,
              setSelectedCategory,
            }}
          />
        </div>

        <MapContainer
          className="h-dvh w-full"
          center={[50.0867273, 14.4282]}
          zoom={13}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler
            onClear={() => {
              setSelectedTreasure(null);
            }}
          />
          {filteredTreasure.map((t) => (
            <Marker
              key={t.id}
              position={[Number(t.latitude), Number(t.longitude)]}
              eventHandlers={{
                click: () => {
                  setSelectedTreasure(t);
                  if (state === "update") {
                    setSelectedTreasure(t);
                    return;
                  }
                  if (state === "delete") {
                    setSelectedTreasure(t);
                    return;
                  }
                  setSelectedTreasure(t);
                  navigate(`/treasure/details/${t.id}`);
                },
              }}
            ></Marker>
          ))}
        </MapContainer>
      </div>
    </>
  );
}
export default Layout;
