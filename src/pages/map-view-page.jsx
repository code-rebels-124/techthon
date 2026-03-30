import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { MapView } from "../components/map/map-view";
import { fetchHospitals } from "../services/api";

export function MapViewPage() {
  const { hospitals, isLoading } = useOutletContext();
  const [items, setItems] = useState(hospitals ?? []);

  useEffect(() => {
    setItems(hospitals ?? []);
  }, [hospitals]);

  useEffect(() => {
    let active = true;
    fetchHospitals()
      .then((payload) => {
        if (active) {
          setItems(payload.items ?? []);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return <MapView hospitals={items ?? []} isLoading={isLoading && !items?.length} />;
}
