export interface Client {
  id: string;
  name: string;
  logotype?: string;
}

export const CLIENTS: Record<string, Client> = {
  "1": {
    id: "1",
    name: "Vanguard",
  },
  "2": {
    id: "2",
    name: "ALX",
  },
  "3": {
    id: "3",
    name: "Садовод",
  },
  "4": {
    id: "4",
    name: "Court Elegance",
  },
  "5": {
    id: "5",
    name: "БКК",
  },
  "6": {
    id: "6",
    name: "Concord Construction",
  },
};
