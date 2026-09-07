export type Language = "en" | "ru";

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.projects": "Projects",
    "nav.about": "About",
    "nav.blog": "Rovnya Journal",
    "nav.order": "Make an Order",
    "nav.login": "Login",
    "nav.profile": "Profile",
    "nav.admin": "Admin Panel",
    "nav.logout": "Logout",
    "nav.language": "Language",

    // Hero
    "hero.title.part1": "The most",
    "hero.title.part2": "sharp:",
    "hero.order": "Make an Order",

    // Services
    "services.we_do": "We do...",
    "services.development": "Development",
    "services.motion": "3D & Motion",
    "services.promotion": "Promotion",
    "services.branding": "Branding",
    "services.dev_description": "We'll create a digital product of any complexity",
    "services.motion_description": "We'll create videos of any complexity",
    "services.promotion_description": "We'll do everything so they know about you",
    "services.branding_description": "We'll create a brand that will be recognized",

    // Footer
    "footer.agency": "Agency",
    "footer.projects": "Projects",
    "footer.about": "About us",
    "footer.careers": "Careers at Rovno.dev",
    "footer.services": "Services",
    "footer.webdev": "Web Development",
    "footer.uxui": "UX/UI Design",
    "footer.branding": "Branding",
    "footer.motion": "3D & Motion",
    "footer.other": "Other",
    "footer.media": "Media",
    "footer.journal": "Rovnya Journal",
    "footer.suggest": "Suggest an Article",
    "footer.copyright": "© 2023–{year} Full-cycle digital agency Rovno.dev, all rights reserved",
    "footer.privacy": "Privacy Policy",

    // Common
    "common.all": "All",
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.send": "Send",
    "common.submit": "Submit",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.close": "Close",
    "common.open": "Open",
    "common.back": "Back",
    "common.next": "Next",
    "common.previous": "Previous",
    "common.search": "Search",
    "common.more": "More",
    "common.view_all": "View All",

    // About page
    "about.title": "We create digital products that change the rules.",
    "about.subtitle": "Rovno.dev is a full-cycle agency where design meets cutting-edge technology. We don't just draw interfaces, we craft experiences that help brands grow in the world of large language models and digital transformation.",
    "about.experts_title": "Our Experts",
    "about.experts_subtitle": "A team of specialists united to create exceptional solutions.",
    "about.join_us": "Join Us",

    // Projects page
    "projects.title": "Projects",
    "projects.subtitle": "High-performance digital solutions.",
    "projects.all": "All",

    // Blog page
    "blog.title": "Blog",
    "blog.subtitle": "Articles about design, development, cases, and insights from our team.",
    "blog.read_more": "Read in Telegram",

    // Order page
    "order.title": "Make an Order",
    "order.subtitle": "Describe your task and we'll prepare an offer.",
    "order.submit": "Submit Request",

    // Home page sections
    "home.numbers_title": "Sharp Numbers",
    "home.stats_team_experience": "average experience among all Rovno.dev members in 2026",
    "home.stats_projects_done": "projects completed",
    "home.stats_happy_clients": "satisfied clients",
    "home.stats_spec_prep": "on average it takes to prepare technical specifications and documentation",
    "home.stats_team_btn": "Our team",
    "home.stats_projects_btn": "Our projects",
    "home.stats_clients_btn": "Client reviews",
    "home.stats_spec_btn": "See for yourself",
    "home.best_works_title": "Featured Projects",
    "home.view_all_projects": "All projects",
    "home.socials_title": "Our Addictive Media",
    "home.cta.title": "We'll find a solution",
    "home.cta.subtitle": "Write to us in DM — we'll reply within 3 hours*",
    "home.cta.note": "*from 8 to 22 MSK",
    "home.cta.max": "Message in Max",
    "home.cta.telegram": "Message in TG",
    // Service sub-items (add these)
    "services.dev_sub1": "Websites",
    "services.dev_sub2": "MCP",
    "services.dev_sub3": "Mobile Apps",
    "services.dev_sub4": "Telegram & Max Bots",
    "services.dev_sub5": "Telegram Mini Apps",
    "services.motion_sub1": "CGI Graphics",
    "services.motion_sub2": "Commercial Videos",
    "services.motion_sub3": "3D",
    "services.motion_sub4": "Editing",
    "services.motion_sub5": "Animation",
    "services.promotion_sub1": "Context Advertising",
    "services.promotion_sub2": "Targeting",
    "services.promotion_sub3": "Yandex Direct",
    "services.promotion_sub4": "SEO",
    "services.promotion_sub5": "UX Audit",
    "services.promotion_sub6": "SMM",
    "services.branding_sub1": "Logos",
    "services.branding_sub2": "Brandbook",
    "services.branding_sub3": "Corporate Identity",
    "services.branding_sub4": "Identity",
    "services.from": "From",
    "services.avg_label": "Rovno from:",

    // Order page extra
    "order.services_label": "Service type",
    "order.about_project": "About the project",
    "order.contacts": "Contacts",
    "order.company": "About the company",
    "order.files": "Additional files (max 10MB)",
    "order.agree": "I consent to the processing of my personal data",
  },
  ru: {
    // Навигация
    "nav.projects": "Проекты",
    "nav.about": "О нас",
    "nav.blog": "Журнал «Ровня»",
    "nav.order": "Оформить заказ",
    "nav.login": "Войти",
    "nav.profile": "Профиль",
    "nav.admin": "Админ-панель",
    "nav.logout": "Выйти",
    "nav.language": "Язык",

    // Hero
    "hero.title.part1": "Самые",
    "hero.title.part2": "ровные:",
    "hero.order": "Оформить заказ",

    // Услуги
    "services.we_do": "Мы делаем...",
    "services.development": "Разработку",
    "services.motion": "3D & Motion",
    "services.promotion": "Продвижение",
    "services.branding": "Брендинг",
    "services.dev_description": "Сделаем цифровой продукт любой сложности",
    "services.motion_description": "Сделаем видео любой сложности",
    "services.promotion_description": "Сделаем всё, чтобы о вас знали",
    "services.branding_description": "Сделаем бренд, который будут узнавать",

    // Футер
    "footer.agency": "Агентство",
    "footer.projects": "Проекты",
    "footer.about": "О нас",
    "footer.careers": "Карьера в Rovno.dev",
    "footer.services": "Услуги",
    "footer.webdev": "Веб-разработка",
    "footer.uxui": "UX/UI Дизайн",
    "footer.branding": "Айдентика",
    "footer.motion": "3D & Motion",
    "footer.other": "Другое",
    "footer.media": "Медиа",
    "footer.journal": "Журнал «Ровня»",
    "footer.suggest": "Предложить статью",
    "footer.copyright": "© 2023–{year} Цифровое агентство полного цикла Rovno.dev, все права защищены",
    "footer.privacy": "Политика конфиденциальности",

    // Общее
    "common.all": "Все",
    "common.loading": "Загрузка...",
    "common.error": "Ошибка",
    "common.send": "Отправить",
    "common.submit": "Отправить",
    "common.cancel": "Отмена",
    "common.save": "Сохранить",
    "common.edit": "Редактировать",
    "common.delete": "Удалить",
    "common.close": "Закрыть",
    "common.open": "Открыть",
    "common.back": "Назад",
    "common.next": "Далее",
    "common.previous": "Назад",
    "common.search": "Поиск",
    "common.more": "Ещё",
    "common.view_all": "Смотреть все",

    // Страница О нас
    "about.title": "Создаем цифровые продукты, которые меняют правила.",
    "about.subtitle": "Rovno.dev — это агентство полного цикла, где дизайн встречается с передовыми технологиями. Мы не просто рисуем интерфейсы, мы проектируем опыт, который помогает брендам расти в мире больших языковых моделей и цифровой трансформации.",
    "about.experts_title": "Наши эксперты",
    "about.experts_subtitle": "Команда специалистов, объединивших свои усилия для создания исключительных решений.",
    "about.join_us": "Присоединиться к нам",

    // Страница Проекты
    "projects.title": "Проекты",
    "projects.subtitle": "Высокопроизводительные цифровые решения.",
    "projects.all": "Все",

    // Страница Блог
    "blog.title": "Блог",
    "blog.subtitle": "Статьи о дизайне, разработке, кейсах и инсайтах нашей команды.",
    "blog.read_more": "Читать в Telegram",

    "services.from": "От",
    "services.avg_label": "Ровно от:",

    // Страница Заказ
    "order.title": "Сделать заказ",
    "order.subtitle": "Опишите вашу задачу и мы подготовим предложение.",
    "order.submit": "Отправить заявку",
  },
};
