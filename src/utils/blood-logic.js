export function getCriticalHospitals(hospitals) {
  return hospitals.filter((hospital) => hospital.status === "critical");
}

export function getNearestHospitals(hospitals, bloodGroup = "O-", origin = { lat: 17.4239, lng: 78.4348 }) {
  const toRad = (value) => (value * Math.PI) / 180;

  const haversineDistance = (a, b) => {
    const earthRadiusKm = 6371;
    const deltaLat = toRad(b.lat - a.lat);
    const deltaLng = toRad(b.lng - a.lng);
    const arc =
      Math.sin(deltaLat / 2) ** 2 +
      Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(deltaLng / 2) ** 2;

    return earthRadiusKm * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));
  };

  return hospitals
    .map((hospital) => {
      const bloodMatch = hospital.inventory.find((item) => item.group === bloodGroup);

      return {
        ...hospital,
        requestedUnits: bloodMatch?.units ?? 0,
        routeDistance: Number(haversineDistance(origin, hospital.coordinates).toFixed(1)),
      };
    })
    .filter((hospital) => hospital.requestedUnits > 0)
    .sort((a, b) => {
      if (b.requestedUnits !== a.requestedUnits) return b.requestedUnits - a.requestedUnits;
      return a.routeDistance - b.routeDistance;
    });
}

export function getTransferSuggestions(redistribution) {
  return redistribution.map((route) => ({
    ...route,
    label: `${route.group}: ${route.from} -> ${route.to}`,
  }));
}

export function getDemandSignalCards(demandSignals) {
  return [
    {
      id: "signal-1",
      title: "O- shortage expected in next 24 hrs",
      status: demandSignals["O-"],
      tone: "warning",
    },
    {
      id: "signal-2",
      title: "B+ demand rising",
      status: demandSignals["B+"],
      tone: "up",
    },
    {
      id: "signal-3",
      title: "A+ stable",
      status: demandSignals["A+"],
      tone: "stable",
    },
  ];
}
