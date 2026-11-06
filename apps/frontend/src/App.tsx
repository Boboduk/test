import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Bookmark,
  Check,
  ChevronRight,
  Compass,
  Heart,
  History,
  Home,
  Menu,
  Moon,
  Search,
  Sparkles,
  Sun,
  Upload,
  Users,
  X,
} from "lucide-react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { videos } from "./data";
import { useStoredList } from "./storage";
import { Avatar } from "./components/VideoCard";
import Dialog from "./components/Dialog";
import FeedPage from "./pages/FeedPage";
import WatchPage from "./pages/WatchPage";

export interface Library {
  saved: ReturnType<typeof useStoredList>;
  history: ReturnType<typeof useStoredList>;
  likes: ReturnType<typeof useStoredList>;
  dislikes: ReturnType<typeof useStoredList>;
  subscriptions: ReturnType<typeof useStoredList>;
}

const navItems = [
  { to: "/", label: "Главная", icon: Home },
  { to: "/subscriptions", label: "Подписки", icon: Users },
  { to: "/history", label: "История", icon: History },
  { to: "/watch-later", label: "Смотреть позже", icon: Bookmark },
  { to: "/liked", label: "Понравившиеся", icon: Heart },
];

function initialTheme() {
  try {
    return localStorage.getItem("lumo:theme") === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export default function App() {
  const library: Library = {
    saved: useStoredList("lumo:saved"),
    history: useStoredList("lumo:history"),
    likes: useStoredList("lumo:likes"),
    dislikes: useStoredList("lumo:dislikes"),
    subscriptions: useStoredList("lumo:subscriptions"),
  };
  const [theme, setTheme] = useState(initialTheme);
  const [menu, setMenu] = useState(false);
  const [mobile, setMobile] = useState(
    () => window.matchMedia?.("(max-width: 760px)").matches ?? false,
  );
  const [dialog, setDialog] = useState<"about" | "upload" | null>(null);
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const navigate = useNavigate();
  const location = useLocation();
  const [localFile, setLocalFile] = useState<{
    name: string;
    url: string;
  } | null>(null);
  const [fileError, setFileError] = useState("");
  const [apiStatus, setApiStatus] = useState<
    "idle" | "loading" | "ok" | "error"
  >("idle");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("lumo:theme", theme);
    } catch {
      /* Тема работает и без сохранения. */
    }
  }, [theme]);
  useEffect(() => {
    setQuery(params.get("q") ?? "");
  }, [params]);
  useEffect(() => {
    const media = window.matchMedia?.("(max-width: 760px)");
    if (!media) return;
    const onChange = () => {
      setMobile(media.matches);
      if (!media.matches) setMenu(false);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);
  useEffect(() => {
    setMenu(false);
    window.scrollTo({ top: 0 });
  }, [location.pathname, location.search]);
  useEffect(() => {
    if (!menu) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [menu]);
  useEffect(
    () => () => {
      if (localFile) URL.revokeObjectURL(localFile.url);
    },
    [localFile],
  );
  const search = (event: FormEvent) => {
    event.preventDefault();
    navigate(query.trim() ? `/?q=${encodeURIComponent(query.trim())}` : "/");
  };
  const closeDialog = () => {
    setDialog(null);
    setLocalFile(null);
    setFileError("");
  };
  const channels = videos.filter(
    (video, index, all) =>
      all.findIndex((other) => other.handle === video.handle) === index &&
      library.subscriptions.items.includes(video.handle),
  );

  return (
    <>
      <a className="skip-link" href="#main">
        Перейти к содержимому
      </a>
      <header className="header">
        <div className="brand-group">
          <button
            className="icon-button mobile-menu"
            aria-label={menu ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={menu}
            aria-controls="sidebar"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Link className="brand" to="/" aria-label="Lumo — главная">
            <span className="brand-mark">
              <PlayMark />
            </span>
            lumo<span className="brand-period">.</span>
          </Link>
        </div>
        <form className="search" onSubmit={search}>
          <Search size={19} />
          <label className="sr-only" htmlFor="search">
            Поиск видео
          </label>
          <input
            id="search"
            type="search"
            autoComplete="off"
            list="search-suggestions"
            placeholder="Что вас вдохновляет?"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <datalist id="search-suggestions">
            {query.trim().length >= 2 &&
              videos
                .filter((v) =>
                  `${v.title} ${v.tags.join(" ")}`
                    .toLocaleLowerCase("ru")
                    .includes(query.toLocaleLowerCase("ru")),
                )
                .slice(0, 5)
                .map((v) => <option value={v.title} key={v.id} />)}
          </datalist>
          <button type="submit" aria-label="Найти видео">
            <ChevronRight size={19} />
          </button>
        </form>
        <div className="header-actions">
          <button
            className="icon-button theme-toggle"
            aria-label={
              theme === "light"
                ? "Включить тёмную тему"
                : "Включить светлую тему"
            }
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
          </button>
          <button
            className="button upload-button"
            aria-label="Добавить видео"
            onClick={() => setDialog("upload")}
          >
            <Upload size={17} />
            <span>Добавить видео</span>
          </button>
          <button
            className="profile-button"
            aria-label="О демо-профиле"
            onClick={() => setDialog("about")}
          >
            В
          </button>
        </div>
      </header>
      {menu && (
        <button
          className="menu-backdrop"
          aria-label="Закрыть боковое меню"
          onClick={() => setMenu(false)}
        />
      )}
      <aside
        className={`sidebar ${menu ? "sidebar-open" : ""}`}
        id="sidebar"
        aria-label="Основное меню"
        inert={mobile && !menu}
        aria-hidden={mobile && !menu ? true : undefined}
      >
        <nav>
          {navItems.map(({ to, label, icon: Icon }, index) => (
            <div key={to}>
              {index === 2 && <p className="sidebar-label">ВАША БИБЛИОТЕКА</p>}
              <NavLink
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "nav-active" : ""}`
                }
              >
                <Icon size={19} />
                <span>{label}</span>
                {to === "/watch-later" && library.saved.items.length > 0 && (
                  <span className="nav-count">
                    {library.saved.items.length}
                  </span>
                )}
                {to === "/" && <span className="nav-active-dot" />}
              </NavLink>
            </div>
          ))}
        </nav>
        <div className="sidebar-channels">
          <p className="sidebar-label">
            ВАШИ АВТОРЫ <span>{channels.length || ""}</span>
          </p>
          {channels.length ? (
            channels.map((channel) => (
              <Link
                key={channel.handle}
                className="sidebar-channel"
                to={`/channel/${channel.handle}`}
              >
                <Avatar name={channel.channel} color={channel.color} small />
                <span>{channel.channel}</span>
                <i />
              </Link>
            ))
          ) : (
            <p className="sidebar-hint">
              Подпишитесь на любимые каналы — они появятся здесь.
            </p>
          )}
        </div>
        <div className="sidebar-bottom">
          <div className="discovery-note">
            <span className="discovery-icon">
              <Sparkles size={19} />
            </span>
            <strong>Вдохновение рядом</strong>
            <p>
              У каждого видео — своя история.
              <br />
              Найдите ту, что откликнется.
            </p>
            <button className="text-button" onClick={() => setDialog("about")}>
              Знакомьтесь, Lumo
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="sidebar-footnote">
            <span className="status-dot" />
            Демо-коллекция
            <button
              className="icon-button"
              aria-label="Подробнее о демо"
              onClick={() => setDialog("about")}
            >
              <Compass size={15} />
            </button>
          </div>
        </div>
      </aside>
      <main className="main" id="main">
        <Routes>
          <Route
            path="/watch/:id"
            element={<WatchPage key={location.pathname} library={library} />}
          />
          {[
            "/",
            "/subscriptions",
            "/history",
            "/watch-later",
            "/liked",
            "/channel/:handle",
          ].map((path) => (
            <Route
              key={path}
              path={path}
              element={<FeedPage library={library} />}
            />
          ))}
          <Route
            path="*"
            element={
              <section className="empty-state">
                <h1>Такой страницы нет</h1>
                <p>Но на главной ещё много интересного.</p>
                <Link to="/" className="button button-dark">
                  На главную
                </Link>
              </section>
            }
          />
        </Routes>
      </main>
      {dialog === "about" && (
        <Dialog title="Привет, это Lumo" onClose={closeDialog}>
          <div className="about-symbol">
            <Sparkles size={30} />
          </div>
          <p className="dialog-lead">
            Место для историй, идей и маленьких открытий.
          </p>
          <p>
            Сейчас вы в демонстрационной версии. Все иллюстрации и короткие
            анимации созданы для проекта. Каналы, названия и статистика —
            примеры.
          </p>
          <ul className="about-list">
            <li>
              <Check size={17} />
              Поиск, категории и просмотр видео
            </li>
            <li>
              <Check size={17} />
              Сохранённые видео, подписки и история в браузере
            </li>
            <li>
              <Check size={17} />
              Светлая и тёмная тема
            </li>
          </ul>
          <p className="muted small">
            Регистрация, публикации, синхронизация между устройствами и реальные
            комментарии появятся после реализации серверных API.
          </p>
          <div className="api-check">
            <span>Подключение к backend</span>
            <button
              className="button button-neutral"
              disabled={apiStatus === "loading"}
              onClick={async () => {
                setApiStatus("loading");
                try {
                  const response = await fetch("/api/v1/health/ready", {
                    signal: AbortSignal.timeout(5000),
                  });
                  const data = await response.json();
                  setApiStatus(
                    response.ok && data.database === "connected"
                      ? "ok"
                      : "error",
                  );
                } catch {
                  setApiStatus("error");
                }
              }}
            >
              {apiStatus === "loading" ? "Проверяем…" : "Проверить"}
            </button>
          </div>
          {apiStatus === "ok" && (
            <p role="status" className="inline-feedback">
              Backend доступен, база подключена.
            </p>
          )}
          {apiStatus === "error" && (
            <p role="status" className="notice">
              Backend недоступен. Интерфейс работает автономно; для API
              запустите npm run dev:backend.
            </p>
          )}
        </Dialog>
      )}
      {dialog === "upload" && (
        <Dialog title="Ваше видео — ваша история" onClose={closeDialog}>
          <p>Откройте видео с компьютера, чтобы посмотреть его в Lumo.</p>
          <p className="muted small">
            Файл останется на вашем устройстве. Публикация и загрузка на сервер
            пока недоступны.
          </p>
          <label className="file-drop">
            <Upload size={32} />
            <strong>Выберите видео</strong>
            <span>MP4, WebM и другие форматы браузера · до 500 МБ</span>
            <input
              ref={fileInput}
              type="file"
              accept="video/*"
              aria-label="Выбрать видео с компьютера"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                if (!file.type.startsWith("video/")) {
                  setFileError("Выберите видеофайл.");
                  return;
                }
                if (file.size > 500 * 1024 * 1024) {
                  setFileError("Размер файла превышает 500 МБ.");
                  return;
                }
                setFileError("");
                setLocalFile({
                  name: file.name,
                  url: URL.createObjectURL(file),
                });
              }}
            />
          </label>
          {fileError && (
            <p className="notice" role="alert">
              {fileError}
            </p>
          )}
          {localFile && (
            <div className="local-preview">
              <h3>{localFile.name}</h3>
              <video
                key={localFile.url}
                controls
                playsInline
                src={localFile.url}
                onError={() =>
                  setFileError(
                    "Браузер не поддерживает кодек этого файла. Попробуйте MP4 с H.264.",
                  )
                }
              />
              <span className="inline-feedback">
                Локальный просмотр — файл не отправляется на сервер.
              </span>
            </div>
          )}
        </Dialog>
      )}
    </>
  );
}

function PlayMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
    </svg>
  );
}
