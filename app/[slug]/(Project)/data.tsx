export interface Project {
  id: number;
  title: string;
  image: string;
  category?: string;
  href?: string;
}

export const PROJECTS: Record<string, Project> = {
  courtElegance: { id: 4, title: "The Court Elegance - Теннисный клуб", image: "/images/projects/court.png", category: "Проекты", href: "https://dprofile.ru/case/160100/the-court-elegance-tennisnyi-klub" },
  alx: { id: 3, title: "Чужой | ALX-9 - ИИ выставка", image: "/images/projects/alx.png", category: "Проекты", href: "https://dprofile.ru/case/124174/cuzoi-alx-9-ii-vystavka" },
  sadovod: { id: 2, title: "Sadovod - Интернет магазин", image: "/images/projects/sadovod.png", category: "Проекты", href: "https://dprofile.ru/case/162985/sadovod-internet-magazin" },
  vanguard: { id: 1, title: "Vanguard: интернет-магазин электроники", image: "/images/projects/vanguard.png", category: "Проекты", href: "https://dprofile.ru/case/116595/vanguard-internet-magazin-elektroniki" },
}
