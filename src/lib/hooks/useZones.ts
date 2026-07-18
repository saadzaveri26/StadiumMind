import { useEffect, useState } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../firebase";

import { Zone } from "../zoneData";

export type { Zone };

/**
 * React hook that establishes a real-time Firestore listener for stadium zones.
 * Automatically cleans up the listener on unmount.
 * @returns The array of zones and a loading indicator.
 */
export function useZones() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const q = query(collection(db, "zones"), orderBy("zoneId", "asc"));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const zonesList: Zone[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          zonesList.push({
            zoneId: data.zoneId,
            name: data.name || "",
            gate: data.gate || "",
            occupancyPercent: typeof data.occupancyPercent === "number" ? data.occupancyPercent : 0,
            capacity: typeof data.capacity === "number" ? data.capacity : 1000,
            status: data.status || "NOMINAL",
          });
        });
        setZones(zonesList);
        setLoading(false);
      },
      (error) => {
        // Silently catch or handle error in UI
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { zones, loading };
}
