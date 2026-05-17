import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import type { Treasure } from "./types";
import { Toast } from "primereact/toast";

function TreasureDetails() {
  const toast = useRef<Toast>(null);

  const { id } = useParams();

  const [treasure, setTreasure] = useState<Treasure | null>(null);
  const [hintVisible, setHintVisible] = useState<boolean>(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [isCloseEnough, setIsCloseEnough] = useState<boolean>(false);
  const [isCheckingLocation, setIsCheckingLocation] = useState<boolean>(false);

  const allowedDistance = 30;

  useEffect(() => {
    fetch(`http://localhost:3000/treasure/details/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setTreasure(data);
      })
      .catch((error) => {
        console.log("Failed to load treasure.", error);
      });
  }, [id]);

  function showError(message: string) {
    toast.current?.show({
      severity: "error",
      summary: "Error",
      detail: message,
      life: 4000,
      className: "bg-red-300 text-red-900 border-2 border-red-500",
    });
  }

  function showSuccess(message: string) {
    toast.current?.show({
      severity: "success",
      summary: "Success",
      detail: message,
      life: 5000,
      className:
        "whitespace-pre-line bg-green-300 text-green-900 border-2 border-green-500",
    });
  }

  function showWarning(message: string) {
    toast.current?.show({
      severity: "warn",
      summary: "Warning",
      detail: message,
      life: 5000,
      className:
        "whitespace-pre-line bg-amber-300 text-amber-800 border-2 border-amber-500",
    });
  }

  function showInfo(message: string) {
    toast.current?.show({
      severity: "info",
      summary: "Location",
      detail: message,
      life: 2000,
      className: "bg-blue-300 text-blue-900 border-2 border-blue-500",
    });
  }

  function calculateDistanceInMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) {
    const earthRadius = 6371000;

    const toRadians = (degrees: number) => {
      return degrees * (Math.PI / 180);
    };

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c;
  }

  function getCurrentPositionWithTimeout(
    timeoutMs: number,
  ): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser."));
        return;
      }

      const timeoutId = setTimeout(() => {
        reject(new Error("Location request timed out."));
      }, timeoutMs);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          resolve(position);
        },
        (error) => {
          clearTimeout(timeoutId);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: timeoutMs,
        },
      );
    });
  }

  async function handleProveLocation() {
    if (!treasure) {
      showError("Treasure data is not loaded yet.");
      return;
    }

    setIsCheckingLocation(true);

    const maxAttempts = 3;
    const timeoutMs = 5000;

    try {
      let position: GeolocationPosition | null = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          showInfo(`Checking location... Attempt ${attempt}/${maxAttempts}`);

          position = await getCurrentPositionWithTimeout(timeoutMs);
          break;
        } catch (error) {
          console.log(`Location attempt ${attempt} failed:`, error);

          if (attempt === maxAttempts) {
            throw new Error("Failed to get location after 3 attempts.");
          }
        }
      }

      if (!position) {
        throw new Error("Location is unavailable.");
      }

      const userLatitude = position.coords.latitude;
      const userLongitude = position.coords.longitude;

      const distanceToTreasure = calculateDistanceInMeters(
        userLatitude,
        userLongitude,
        Number(treasure.latitude),
        Number(treasure.longitude),
      );

      setDistance(distanceToTreasure);

      if (distanceToTreasure <= allowedDistance) {
        setIsCloseEnough(true);
        setHintVisible(true);
        showSuccess("You are close enough! Hint is unlocked!");
        console.log("you are close");
      } else {
        setIsCloseEnough(false);
        setHintVisible(false);
        showWarning(
          `You are too far. Treasure is ${Math.round(
            distanceToTreasure,
          )}m away. You need to be within ${allowedDistance}m from treasure.`,
        );
        console.log("you are far");
      }
    } catch (error) {
      console.log("Location check failed:", error);

      setIsCloseEnough(false);
      setHintVisible(false);

      showError(
        "Failed to get your location after 3 attempts. Please check GPS and browser permissions.",
      );
    } finally {
      setIsCheckingLocation(false);
    }
  }

  async function markAsFound() {
    if (!treasure) {
      return;
    }

    if (!isCloseEnough) {
      showWarning("You need to be close to the treasure to mark as found!");
    }
    try {
      const res = await fetch(
        `http://localhost:3000/treasure/mark-as-found/${treasure.id}`,
        {
          method: "PUT",
        },
      );
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const updatedTreasure = await res.json();
      setTreasure(updatedTreasure);
      showSuccess("Treasure marked as found!");
    } catch (error) {
      console.log("Failed to mark treasure as found: ", error);
      showError("Failed to mark treasure as found.");
    }
  }

  if (!treasure) {
    return <p>Select treasure</p>;
  }

  return (
    <>
      <Toast ref={toast} />

      <div className="bg-amber-50">
        <div>
          {treasure.image_name && (
            <img
              src={`http://localhost:3000/uploads/${treasure.image_name}`}
              className="w-full rounded"
            />
          )}
        </div>

        <div>Description: {treasure.description}</div>
        <div>Latitude: {treasure.latitude}</div>
        <div>Longitude: {treasure.longitude}</div>

        {!treasure.is_found && (
          <div>
            <label>Hint*: </label>
            {hintVisible ? (
              <p>{treasure.hint}</p>
            ) : (
              <p>Hint is locked. Prove your location first.</p>
            )}
          </div>
        )}

        {!treasure.is_found && (
          <button
            className="bg-amber-900"
            onClick={handleProveLocation}
            disabled={isCheckingLocation}
          >
            {isCheckingLocation
              ? "Checking your location..."
              : "Prove location"}
          </button>
        )}
        {!treasure.is_found && distance !== null && distance !== null && (
          <div>Distance: {Math.round(distance)}m</div>
        )}
        <div>Category: {treasure.category_name}</div>

        <label>
          Found: {treasure.is_found ? "Yes" : "No"}
          {treasure.is_found ? (
            <p>This treasure is already found.</p>
          ) : (
            <label>
              <input
                type="checkbox"
                checked={false}
                disabled={!isCloseEnough}
                onChange={markAsFound}
              />
              Mark as found
            </label>
          )}
          <br />
          {!isCloseEnough && !treasure.is_found && (
            <p>Prove your location before marking as found.</p>
          )}
        </label>
      </div>
    </>
  );
}

export default TreasureDetails;
