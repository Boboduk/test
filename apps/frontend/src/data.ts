export const categories = [
  "Все",
  "Путешествия",
  "Дизайн",
  "Музыка",
  "Технологии",
  "Природа",
  "Кино",
  "Наука",
] as const;
export type Category = (typeof categories)[number];

export interface Video {
  id: string;
  title: string;
  channel: string;
  handle: string;
  color: string;
  category: Category;
  tags: string[];
  views: string;
  date: string;
  ageDays: number;
  duration: string;
  cover: string;
  description: string;
}

export const videos: Video[] = [
  {
    id: "mountains",
    title: "Туда, где тише. Один день в горах",
    channel: "За горизонтом",
    handle: "horizon",
    color: "#668578",
    category: "Путешествия",
    tags: ["горы", "поход", "отдых"],
    views: "24 тыс.",
    date: "2 дня назад",
    ageDays: 2,
    duration: "0:08",
    cover: "mountains",
    description:
      "Иногда, чтобы услышать себя, нужно оказаться подальше от города. История о маленьких открытиях, больших горах и умении замедляться.",
  },
  {
    id: "design",
    title: "Меньше, но лучше: искусство простых вещей",
    channel: "Форма и смысл",
    handle: "forma",
    color: "#a283b3",
    category: "Дизайн",
    tags: ["минимализм", "предметы", "интерьер"],
    views: "8,2 тыс.",
    date: "1 день назад",
    ageDays: 1,
    duration: "0:08",
    cover: "design",
    description:
      "Разбираемся, почему простые формы так хорошо работают. Цвет, пространство и детали, которые делают повседневность красивее.",
  },
  {
    id: "music",
    title: "Музыка для тех, кто никуда не спешит",
    channel: "Тихая частота",
    handle: "frequency",
    color: "#b87c60",
    category: "Музыка",
    tags: ["лоуфай", "джаз", "винил"],
    views: "42 тыс.",
    date: "3 дня назад",
    ageDays: 3,
    duration: "0:08",
    cover: "music",
    description:
      "Поставьте дела на паузу. Немного тепла, мягкого света и вдохновения для спокойного вечера.",
  },
  {
    id: "ocean",
    title: "Океан ближе, чем кажется",
    channel: "За горизонтом",
    handle: "horizon",
    color: "#668578",
    category: "Природа",
    tags: ["океан", "вода", "волны"],
    views: "17 тыс.",
    date: "4 дня назад",
    ageDays: 4,
    duration: "0:08",
    cover: "ocean",
    description:
      "Место, где горизонт никогда не заканчивается. Наблюдаем за ритмом воды и учимся замечать красоту природы.",
  },
  {
    id: "space",
    title: "А что, если мы не одни во Вселенной?",
    channel: "Просто космос",
    handle: "cosmos",
    color: "#7774c7",
    category: "Наука",
    tags: ["космос", "планеты", "астрономия"],
    views: "63 тыс.",
    date: "5 дней назад",
    ageDays: 5,
    duration: "0:08",
    cover: "space",
    description:
      "Большие вопросы простыми словами. Почему нас так притягивают далёкие миры и что наука уже знает о них.",
  },
  {
    id: "city",
    title: "Город после заката: другой ритм жизни",
    channel: "Другой ракурс",
    handle: "angle",
    color: "#608c99",
    category: "Кино",
    tags: ["город", "съёмка", "архитектура"],
    views: "12 тыс.",
    date: "6 дней назад",
    ageDays: 6,
    duration: "0:08",
    cover: "city",
    description:
      "Короткая визуальная история о городе, который просыпается, когда заходит солнце. Свет, геометрия и движение.",
  },
  {
    id: "creative",
    title: "Как найти свой стиль и не потерять себя",
    channel: "Форма и смысл",
    handle: "forma",
    color: "#a283b3",
    category: "Дизайн",
    tags: ["творчество", "цвет", "вдохновение"],
    views: "9,6 тыс.",
    date: "1 неделю назад",
    ageDays: 7,
    duration: "0:08",
    cover: "creative",
    description:
      "Небольшие упражнения, которые помогут выйти из творческого тупика. Экспериментируем с формой и цветом.",
  },
  {
    id: "future",
    title: "Технологии, которые уже меняют наш день",
    channel: "Завтра сегодня",
    handle: "tomorrow",
    color: "#648574",
    category: "Технологии",
    tags: ["будущее", "инновации", "техника"],
    views: "31 тыс.",
    date: "1 неделю назад",
    ageDays: 7,
    duration: "0:08",
    cover: "future",
    description:
      "Знакомимся с идеями, которые делают сложное понятным, а привычные задачи — немного проще.",
  },
  {
    id: "forest",
    title: "Прогулка без маршрута. Навстречу лесу",
    channel: "За горизонтом",
    handle: "horizon",
    color: "#668578",
    category: "Путешествия",
    tags: ["лес", "поход", "прогулка"],
    views: "6,4 тыс.",
    date: "2 недели назад",
    ageDays: 14,
    duration: "0:08",
    cover: "forest",
    description:
      "Необязательно знать точку назначения, чтобы отправиться в путь. Просто следуем за светом сквозь деревья.",
  },
];

export function filterVideos(
  source: Video[],
  query: string,
  category: Category,
) {
  const normalized = query.trim().toLocaleLowerCase("ru");
  return source.filter(
    (video) =>
      (category === "Все" || video.category === category) &&
      `${video.title} ${video.channel} ${video.tags.join(" ")}`
        .toLocaleLowerCase("ru")
        .includes(normalized),
  );
}
