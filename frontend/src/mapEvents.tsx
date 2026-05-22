import { useMapEvents } from "react-leaflet";
import { useNavigate } from "react-router-dom";

function MapClickHandler({ onClear }: { onClear: () => void }) {
  const navigate = useNavigate();

  useMapEvents({
    click: () => {
      onClear();
      navigate("/");
    },
  });
  return null;
}

export default MapClickHandler;
