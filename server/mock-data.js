const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const hospitals = [
  {
    id: "h1",
    name: "Apollo Central Hospital",
    city: "Hyderabad",
    type: "Hospital",
    distance: 4.2,
    coordinates: { lat: 17.4065, lng: 78.4772 },
    inventory: { "A+": 40, "A-": 14, "B+": 34, "B-": 10, "AB+": 12, "AB-": 5, "O+": 52, "O-": 9 },
  },
  {
    id: "h2",
    name: "RedCross Metro Blood Bank",
    city: "Secunderabad",
    type: "Blood Bank",
    distance: 8.8,
    coordinates: { lat: 17.4399, lng: 78.4983 },
    inventory: { "A+": 36, "A-": 18, "B+": 42, "B-": 15, "AB+": 14, "AB-": 7, "O+": 60, "O-": 22 },
  },
  {
    id: "h3",
    name: "CareLife Institute",
    city: "Gachibowli",
    type: "Hospital",
    distance: 12.1,
    coordinates: { lat: 17.4401, lng: 78.3489 },
    inventory: { "A+": 24, "A-": 9, "B+": 26, "B-": 7, "AB+": 10, "AB-": 4, "O+": 29, "O-": 6 },
  },
  {
    id: "h4",
    name: "Urban Pulse Medical Center",
    city: "Madhapur",
    type: "Hospital",
    distance: 10.3,
    coordinates: { lat: 17.4483, lng: 78.3915 },
    inventory: { "A+": 28, "A-": 8, "B+": 21, "B-": 6, "AB+": 11, "AB-": 3, "O+": 34, "O-": 5 },
  },
  {
    id: "h5",
    name: "LifeSpring Multi-Speciality",
    city: "Begumpet",
    type: "Hospital",
    distance: 6.5,
    coordinates: { lat: 17.4448, lng: 78.4666 },
    inventory: { "A+": 31, "A-": 11, "B+": 18, "B-": 5, "AB+": 9, "AB-": 3, "O+": 25, "O-": 4 },
  },
  {
    id: "h6",
    name: "State HemoCare Bank",
    city: "Kukatpally",
    type: "Blood Bank",
    distance: 15.7,
    coordinates: { lat: 17.4948, lng: 78.3996 },
    inventory: { "A+": 45, "A-": 19, "B+": 47, "B-": 17, "AB+": 16, "AB-": 8, "O+": 63, "O-": 24 },
  },
  {
    id: "h7",
    name: "Nova Emergency Hospital",
    city: "Banjara Hills",
    type: "Hospital",
    distance: 5.4,
    coordinates: { lat: 17.4239, lng: 78.4348 },
    inventory: { "A+": 19, "A-": 6, "B+": 15, "B-": 5, "AB+": 6, "AB-": 2, "O+": 18, "O-": 3 },
  },
];

const donorProfiles = [
  { id: "d1", name: "Anika Reddy", bloodGroup: "O-", distance: 2.6, city: "Hyderabad", availability: "Ready in 20 min" },
  { id: "d2", name: "Rahul Varma", bloodGroup: "B+", distance: 4.1, city: "Madhapur", availability: "Ready in 35 min" },
  { id: "d3", name: "Sana Khan", bloodGroup: "A+", distance: 5.3, city: "Begumpet", availability: "Ready in 45 min" },
  { id: "d4", name: "Kiran Teja", bloodGroup: "AB-", distance: 7.8, city: "Gachibowli", availability: "Ready in 50 min" },
  { id: "d5", name: "Meera Patel", bloodGroup: "O+", distance: 3.7, city: "Secunderabad", availability: "Ready in 30 min" },
  { id: "d6", name: "Aditya Rao", bloodGroup: "A-", distance: 6.2, city: "Banjara Hills", availability: "Ready in 40 min" },
  { id: "d7", name: "Neha Sharma", bloodGroup: "B-", distance: 8.1, city: "Kukatpally", availability: "Ready in 55 min" },
  { id: "d8", name: "Farhan Ali", bloodGroup: "AB+", distance: 4.9, city: "Hyderabad", availability: "Ready in 25 min" },
];

const thresholds = { "A+": 28, "A-": 10, "B+": 24, "B-": 8, "AB+": 10, "AB-": 4, "O+": 36, "O-": 12 };

const demandHistory = [
  { day: "Mon", demand: 114, "A+": 30, "B+": 20, "O-": 12 },
  { day: "Tue", demand: 121, "A+": 31, "B+": 21, "O-": 13 },
  { day: "Wed", demand: 119, "A+": 29, "B+": 22, "O-": 14 },
  { day: "Thu", demand: 128, "A+": 30, "B+": 24, "O-": 15 },
  { day: "Fri", demand: 133, "A+": 31, "B+": 25, "O-": 16 },
  { day: "Sat", demand: 142, "A+": 30, "B+": 27, "O-": 18 },
  { day: "Sun", demand: 138, "A+": 29, "B+": 28, "O-": 19 },
];

function getStatus(units, threshold) {
  if (units < threshold * 0.75) return "critical";
  if (units < threshold * 1.15) return "low";
  return "safe";
}

function getHospitalStatus(totalUnits) {
  if (totalUnits < 95) return "critical";
  if (totalUnits < 140) return "low";
  return "safe";
}

function haversineDistance(a, b) {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const deltaLat = toRad(b.lat - a.lat);
  const deltaLng = toRad(b.lng - a.lng);
  const arc =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(deltaLng / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));
}

function getHospitalsView() {
  return hospitals.map((hospital) => {
    const inventory = bloodGroups.map((group) => ({ group, units: hospital.inventory[group] }));
    const totalUnits = inventory.reduce((sum, item) => sum + item.units, 0);

    return {
      ...hospital,
      inventory,
      totalUnits,
      status: getHospitalStatus(totalUnits),
    };
  });
}

function getInventorySummary() {
  return bloodGroups.map((group, index) => {
    const units = hospitals.reduce((sum, hospital) => sum + hospital.inventory[group], 0);
    const threshold = thresholds[group];
    return {
      group,
      units,
      threshold,
      fillRate: Math.min(100, Math.round((units / (threshold * hospitals.length * 1.2)) * 100)),
      expiringSoon: 2 + (index % 5),
      status: getStatus(units, threshold * hospitals.length),
    };
  });
}

function getTomorrowProjection() {
  const latestThree = demandHistory.slice(-3).map((item) => item.demand);
  return Math.round(latestThree.reduce((sum, value) => sum + value, 0) / latestThree.length + 7);
}

function getTrends() {
  const projectedValue = getTomorrowProjection();
  return demandHistory.map((item, index) => ({
    day: item.day,
    demand: item.demand,
    projected: index === demandHistory.length - 1 ? projectedValue : null,
  }));
}

function detectTrend(metric) {
  const values = demandHistory.map((item) => item[metric]);
  const recent = values.slice(-3).reduce((sum, value) => sum + value, 0) / 3;
  const previous = values.slice(0, 3).reduce((sum, value) => sum + value, 0) / 3;
  const delta = recent - previous;

  if (delta >= 3) return "rising";
  if (delta <= -2) return "falling";
  return "stable";
}

function getCriticalHospitals(hospitalsView) {
  return hospitalsView.filter((hospital) => hospital.status === "critical");
}

function getTransferSuggestions(hospitalsView) {
  const suggestions = [
    {
      id: "r1",
      group: "O-",
      from: "State HemoCare Bank",
      to: "Nova Emergency Hospital",
      units: 6,
      timeline: "90 minutes",
    },
    {
      id: "r2",
      group: "B+",
      from: "RedCross Metro Blood Bank",
      to: "LifeSpring Multi-Speciality",
      units: 7,
      timeline: "2 hours",
    },
    {
      id: "r3",
      group: "A-",
      from: "Apollo Central Hospital",
      to: "Urban Pulse Medical Center",
      units: 4,
      timeline: "3 hours",
    },
  ];

  return suggestions.map((suggestion) => {
    const fromHospital = hospitalsView.find((hospital) => hospital.name === suggestion.from);
    const toHospital = hospitalsView.find((hospital) => hospital.name === suggestion.to);

    return {
      ...suggestion,
      fromId: fromHospital?.id,
      toId: toHospital?.id,
      fromCoordinates: fromHospital?.coordinates,
      toCoordinates: toHospital?.coordinates,
    };
  });
}

function getNearestHospitals(hospitalsView, bloodGroup = "O-", origin = { lat: 17.4239, lng: 78.4348 }) {
  return hospitalsView
    .filter((hospital) => hospital.inventory.some((item) => item.group === bloodGroup && item.units > 0))
    .map((hospital) => {
      const match = hospital.inventory.find((item) => item.group === bloodGroup);
      const routeDistance = haversineDistance(origin, hospital.coordinates);

      return {
        id: hospital.id,
        name: hospital.name,
        city: hospital.city,
        status: hospital.status,
        units: match?.units ?? 0,
        distance: Number(routeDistance.toFixed(1)),
        coordinates: hospital.coordinates,
      };
    })
    .sort((a, b) => {
      if (b.units !== a.units) return b.units - a.units;
      return a.distance - b.distance;
    });
}

function getAlerts(hospitalsView) {
  const criticalHospitals = getCriticalHospitals(hospitalsView);

  return [
    {
      id: "a1",
      title: "O- reserve below safety threshold",
      description: "Network reserve is 73 units, below the recommended emergency buffer of 84 units.",
      type: "shortage",
      priority: "high",
    },
    {
      id: "a2",
      title: `${criticalHospitals[0]?.name ?? "Nova Emergency Hospital"} requires urgent replenishment`,
      description: "Critical shortage detected in O-, A-, and AB- with projected overnight demand increase.",
      type: "shortage",
      priority: "high",
    },
    {
      id: "a3",
      title: "AB+ units nearing expiry at Apollo Central",
      description: "4 units expire within 36 hours and should be prioritized for outbound redistribution.",
      type: "expiry",
      priority: "medium",
    },
  ];
}

function getInsights(redistribution) {
  const oNegativeTrend = detectTrend("O-");
  const bPositiveTrend = detectTrend("B+");
  const aPositiveTrend = detectTrend("A+");

  return [
    {
      id: "i1",
      title: "O- shortage expected in next 24 hrs",
      description: `Trend model indicates O- demand is ${oNegativeTrend} while emergency reserve remains tight across trauma-linked sites.`,
      confidence: 92,
      bloodGroup: "O-",
      signal: "warning",
      recommendedAction: redistribution[0].from
        ? `Dispatch ${redistribution[0].units} O- units from ${redistribution[0].from} to ${redistribution[0].to} now.`
        : "Prioritize immediate regional balancing for O- units.",
    },
    {
      id: "i2",
      title: "B+ demand rising",
      description: `Historical usage shows B+ demand is ${bPositiveTrend}, with weekend admissions likely to increase utilization.`,
      confidence: 88,
      bloodGroup: "B+",
      signal: "up",
      recommendedAction: redistribution[1].from
        ? `Move ${redistribution[1].units} B+ units from ${redistribution[1].from} to ${redistribution[1].to} before midnight.`
        : "Hold B+ transfers for demand surge coverage.",
    },
    {
      id: "i3",
      title: "A+ stable",
      description: `A+ consumption remains ${aPositiveTrend}, and current reserve levels are healthy enough for scheduled demand.`,
      confidence: 84,
      bloodGroup: "A+",
      signal: "stable",
      recommendedAction: "Keep A+ reserve steady and avoid unnecessary redistribution unless local demand changes.",
    },
  ];
}

function getEmergencyBanks(hospitalsView) {
  return getNearestHospitals(hospitalsView, "O-").slice(0, 3).map((hospital, index) => ({
    id: `e${index + 1}`,
    name: hospital.name,
    city: hospital.city,
    distance: hospital.distance,
    oNegativeUnits: hospital.units,
    priority: index < 2,
  }));
}

export function buildMockPayload() {
  const hospitalsView = getHospitalsView();
  const inventory = getInventorySummary();
  const redistribution = getTransferSuggestions(hospitalsView);
  const insights = getInsights(redistribution);

  return {
    summary: {
      totalUnits: inventory.reduce((sum, item) => sum + item.units, 0),
      criticalCount: inventory.filter((item) => item.status === "critical").length + getCriticalHospitals(hospitalsView).length,
      predictedDemandTomorrow: getTomorrowProjection(),
      redistributionCount: redistribution.length,
    },
    inventory,
    trends: getTrends(),
    alerts: getAlerts(hospitalsView),
    redistribution,
    hospitals: hospitalsView,
    insights,
    emergencyBanks: getEmergencyBanks(hospitalsView),
    donors: donorProfiles,
    demandSignals: {
      "O-": detectTrend("O-"),
      "B+": detectTrend("B+"),
      "A+": detectTrend("A+"),
    },
  };
}
