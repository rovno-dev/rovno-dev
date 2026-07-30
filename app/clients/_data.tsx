export interface Client {
  id: string;
  name: string;
  logotype?: string; // optional path to logo image/SVG
}

export const CLIENTS: Record<string, Client> = {
  alx: {
    id: "alx",
    name: "ALX",
    // logotype: "/images/clients/alx-logo.svg", // uncomment when you have the logo
  },
  sadovod: {
    id: "sadovod",
    name: "Садовод",
  },
  vanguard: {
    id: "vanguard",
    name: "Vanguard FinTech",
  },
  courtElegance: {
    id: "courtElegance",
    name: "Court Elegance",
  },
};
