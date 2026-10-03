// Shared content data (RU). Edit here; pages render from it where content repeats.
// Facts come from the old site and the company presentation — see README.md for the list to confirm.
window.FM_DATA = {
  contacts: {
    phone: '+998 55 513 04 40',
    phoneHref: 'tel:+998555130440',
    email: 'info@fairmetal.uz',
    address: 'Узбекистан, Ташкент, улица Махтумкули, 117',
    hours: 'Пн–Сб, 9:00–20:00',
    telegram: 'https://t.me/FAIRMETAL',
    instagram: 'https://www.instagram.com/fairmetal/',
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d24658.807621710148!2d69.31433340190434!3d41.30250116014565!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38aef50ae9ceda53%3A0x2ff593bd0a7ed3a6!2sFAIR%20METAL!5e0!3m2!1sru!2s!4v1759047486137!5m2!1sru!2s',
    mapLink: 'https://www.google.com/maps/search/?api=1&query=41.30250116,69.31433340',
    managers: [
      { name: 'Жавохир', phone: '+998 93 166 04 40', href: 'tel:+998931660440' },
      { name: 'Шохжахон', phone: '+998 93 129 04 40', href: 'tel:+998931290440' },
    ],
  },

  // Catalog: names only (specs will be added later). `art` picks the cross-section drawing.
  products: [
    { id: 'profile-tube', name: 'Профильная труба', short: 'Квадратное и прямоугольное сечение', img: { src: 'assets/img/products/profile-photo-630.webp', srcset: 'assets/img/products/profile-photo-480.webp 480w, assets/img/products/profile-photo-630.webp 630w', w: 630, h: 473 }, alt: 'Профильные трубы квадратного и прямоугольного сечения', art: 'square', icon: 'i-sec-square', gost: ['ГОСТ 8639-82', 'ГОСТ 8645-68', 'ГОСТ 30245-2003'], main: true,
      lead: 'Трубы квадратного и прямоугольного сечения для металлоконструкций, каркасов и ограждений.' },
    { id: 'round-tube', name: 'Круглая труба', short: 'Водогазопроводная и электросварная', img: { src: 'assets/img/products/round-photo-680.webp', srcset: 'assets/img/products/round-photo-480.webp 480w, assets/img/products/round-photo-680.webp 680w', w: 680, h: 510 }, alt: 'Круглые стальные трубы разного диаметра', art: 'round', icon: 'i-sec-round', gost: ['ГОСТ 3262-75', 'ГОСТ 10704-91', 'ГОСТ 10705-80'], main: true,
      lead: 'Электросварные прямошовные и водогазопроводные трубы для инженерных сетей и конструкций.' },
    { id: 'sheet', name: 'Лист г/к', short: 'Горячекатаный листовой прокат', img: { src: 'assets/img/products/sheet-photo-693.webp', srcset: 'assets/img/products/sheet-photo-480.webp 480w, assets/img/products/sheet-photo-693.webp 693w', w: 693, h: 520 }, alt: 'Стопка стальных листов', art: 'sheet', icon: 'i-sec-sheet', gost: ['ГОСТ 19903-2015'], main: true,
      lead: 'Горячекатаный стальной лист для машиностроения, строительства и производства.' },
    { id: 'rebar', page: false, name: 'Арматура', short: 'В наличии', img: { src: 'assets/img/products/rebar-photo-640.webp', srcset: 'assets/img/products/rebar-photo-320.webp 320w, assets/img/products/rebar-photo-640.webp 640w', w: 640, h: 480 }, alt: 'Арматура', art: 'rebar', icon: 'i-sec-rebar', main: false, lead: 'Арматурный прокат для железобетонных конструкций.' },
    { id: 'angle', page: false, name: 'Уголок', short: 'В наличии', img: { src: 'assets/img/products/angle-photo-640.webp', srcset: 'assets/img/products/angle-photo-320.webp 320w, assets/img/products/angle-photo-640.webp 640w', w: 640, h: 480 }, alt: 'Стальной уголок', art: 'angle', icon: 'i-sec-angle', main: false, lead: 'Равнополочный уголок для каркасов и усилений.' },
    { id: 'rod', page: false, name: 'Пруток', short: 'В наличии', img: { src: 'assets/img/products/rod-photo-640.webp', srcset: 'assets/img/products/rod-photo-320.webp 320w, assets/img/products/rod-photo-640.webp 640w', w: 640, h: 480 }, alt: 'Круглый стальной пруток', art: 'rod', icon: 'i-sec-rod', main: false, lead: 'Круглый стальной пруток для производства и строительства.' },
  ],

  // Clients (logo files live in assets/img/clients)
  clients: [
    { file: 'korzinka.svg', name: 'Korzinka' },
    { file: 'nkmk.svg', name: 'NKMK — Узбекский металлургический комбинат' },
    { file: 'okmk.webp', name: 'Алмалыкский ГМК' },
    { file: 'uzsuv.svg', name: 'O‘zsuvta’minot', showName: true },
    { file: 'temiryul.webp', name: 'O‘zbekiston temir yo‘llari' },
    { file: 'hududgaz.webp', name: 'Hududgaz ta’minot' },
    { file: 'mirankul.svg', name: 'Mirankul', invert: true },
    { file: 'discovery.svg', name: 'Discovery Invest' },
    { file: 'bi.svg', name: 'BI Group' },
    { file: 'nrg.svg', name: 'NRG' },
    { file: 'afsona.webp', name: 'Afsonalar vodiysi' },
  ],

  // Company numbers (old site + presentation). Presentation-only figures are listed in README.md for confirmation.
  facts: {
    since: 2022, tonsPerYear: 50000, clients: 500, regions: 12, countries: ['Узбекистан', 'Казахстан', 'Таджикистан'], locations: 2, defermentDays: 30,
  },

  // How the company is organised (from the presentation)
  structure: [
    { label: 'Команда', title: 'Менеджеры, логисты и аналитики внутри компании', text: 'Собственная структура из отделов менеджмента, логистики и аналитики цен.' },
    { label: 'Контроль', title: 'Системный контроль работы менеджеров', text: 'Отслеживаем скорость ответа, корректность оформления документов и выполнение стандартов обслуживания.' },
    { label: 'Технологичность', title: 'Машинная упаковка металла', text: 'Исключает ошибки, ускоряет отгрузку и сохраняет металл при транспортировке.' },
    { label: 'Скорость', title: 'Оперативная логистика и складские процессы', text: 'Оптимизированные складские маршруты и чёткая работа команды дают стабильные и быстрые поставки.' },
  ],

  // Strategic projects the presentation lists participation in (to be confirmed by the client)
  projects: ['АЭС в Джизаке', 'Аэропорт в Чирчике', 'Башни-близнецы в Новом Ташкенте'],

  // Partner factories (from the company presentation)
  factories: [
    { name: 'Pipe Metal', text: 'Завод по производству электросварных, водогазопроводных, профильных труб и стальных листов г/к, х/к.', img: 'assets/img/partners/factory-1-580.webp' },
    { name: 'Invest Zone', text: 'Производитель стальных труб круглого, квадратного и прямоугольного сечения, а также листового проката.', img: 'assets/img/partners/factory-2-580.webp' },
    { name: 'Tarle Plast', text: 'Производство ПЭТ-преформ, одно- и двухкомпонентных крышек и термоусадочной плёнки.', img: 'assets/img/partners/factory-3-580.webp' },
    { name: 'TTZ', text: 'Металлургический комплекс с полным циклом производственных процессов.', img: 'assets/img/partners/factory-4-580.webp' },
    { name: 'Steel Pipe', text: 'Завод по производству металлических газоводопроводных труб.', img: 'assets/img/partners/factory-5-580.webp' },
  ],
};
