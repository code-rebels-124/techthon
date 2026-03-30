import { Activity, HeartPulse, Hospital, MapPinned, SearchCheck, Siren, Warehouse } from "lucide-react";

const navigationByRole = {
  hospital: [
    { to: "/hospital", label: "Dashboard", icon: HeartPulse },
    { to: "/hospitals", label: "Hospitals", icon: Hospital },
    { to: "/map", label: "Map", icon: MapPinned },
    { to: "/inventory", label: "Inventory", icon: Warehouse },
    { to: "/donors", label: "Donors", icon: SearchCheck },
    { to: "/emergency", label: "Emergency", icon: Siren },
  ],
  requester: [
    { to: "/consumer", label: "Request Desk", icon: Activity },
    { to: "/hospitals", label: "Hospitals", icon: Hospital },
    { to: "/map", label: "Map", icon: MapPinned },
    { to: "/emergency", label: "Emergency", icon: Siren },
  ],
};

export function getNavigationItems(role) {
  return navigationByRole[role] ?? navigationByRole.requester;
}
