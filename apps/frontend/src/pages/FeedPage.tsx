import {
  ArrowDownWideNarrow,
  ArrowRight,
  Bookmark,
  Compass,
  Play,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useState } from "react";
import { categories, filterVideos, videos, type Category } from "../data";
import VideoCard, { Avatar } from "../components/VideoCard";
import type { Library } from "../App";

export default function FeedPage({ library }: { library: Library }) {
  const { pathname } = useLocation();
  const { handle } = useParams();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const rawCategory = params.get("category");
  const category: Category =
    categories.find((item) => item === rawCategory) ?? "Все";
  const [sort, setSort] = useState("recommended");
  const isHome = pathname === "/";
  const channel = handle
    ? videos.find((item) => item.handle === handle)
    : undefined;
  const title = handle
    ? (channel?.channel ?? "Канал не найден")
    : query
      ? `Результаты поиска`
      : ({
          "/watch-later": "Смотреть позже",
          "/history": "История просмотров",
          "/subscriptions": "Ваши подписки",
          "/liked": "Понравившиеся",
        }[pathname] ?? "Рекомендовано вам");
  let source = videos;
  if (handle) source = videos.filter((video) => video.handle === handle);
  if (pathname === "/watch-later")
    source = library.saved.items.flatMap(
      (id) => videos.find((v) => v.id === id) ?? [],
    );
  if (pathname === "/history")
    source = library.history.items.flatMap(
      (id) => videos.find((v) => v.id === id) ?? [],
    );
  if (pathname === "/subscriptions")
    source = videos.filter((v) =>
      library.subscriptions.items.includes(v.handle),
    );
  if (pathname === "/liked")
    source = videos.filter((v) => library.likes.items.includes(v.id));
  let results = filterVideos(source, query, category);
  if (sort === "popular")
    results = [...results].sort(
      (a, b) =>
        parseFloat(b.views.replace(",", ".")) -
        parseFloat(a.views.replace(",", ".")),
    );
  if (sort === "recent")
    results = [...results].sort((a, b) => a.ageDays - b.ageDays);

  return (
    <>
      {isHome && !query && category === "Все" && (
        <>
          <div className="page-intro">
            <div>
              <p className="eyebrow">ВАШЕ ПРОСТРАНСТВО ВДОХНОВЕНИЯ</p>
              <h1>
                Смотри шире<span>.</span>
              </h1>
            </div>
            <span className="intro-note">
              <Sparkles size={16} />
              Каждый день — что-то новое
            </span>
          </div>
          <section className="hero" aria-label="Выбор редакции">
            <img
              className="hero-art"
              src="/covers/mountains.svg"
              alt="Иллюстрация горного пейзажа в лучах солнца"
            />
            <div className="hero-shade" />
            <div className="hero-content">
              <span className="hero-label">
                <span />
                ВЫБОР РЕДАКЦИИ · ДЕМО
              </span>
              <h2>
                Иногда нужно
                <br />
                просто выдохнуть.
              </h2>
              <p>
                Большие горы. Маленькие открытия.
                <br />И немного времени для себя.
              </p>
              <Link className="button button-lime" to="/watch/mountains">
                <Play size={16} fill="currentColor" />
                Смотреть видео
                <ArrowRight size={17} />
              </Link>
              <div className="hero-author">
                <Avatar name="За горизонтом" color="#74978b" small />
                <span>За горизонтом</span>
                <span className="hero-dot">·</span>
                <span>Анимированная история</span>
              </div>
            </div>
            <div className="hero-caption">
              <span>LUMO ORIGINALS</span>
              <div>
                <i />
              </div>
              <span>МЕНЯЙТЕ ПЕРСПЕКТИВУ</span>
            </div>
          </section>
        </>
      )}
      {channel && (
        <section className="channel-banner">
          <div className="channel-banner-art" />
          <Avatar name={channel.channel} color={channel.color} />
          <div>
            <p className="eyebrow">ДЕМОНСТРАЦИОННЫЙ КАНАЛ</p>
            <h1>{channel.channel}</h1>
            <p>
              @{channel.handle} · {source.length} видео
            </p>
          </div>
          <button
            className={`button ${library.subscriptions.items.includes(handle!) ? "button-neutral" : "button-dark"}`}
            onClick={() => library.subscriptions.toggle(handle!)}
          >
            {library.subscriptions.items.includes(handle!)
              ? "Вы подписаны"
              : "Подписаться"}
          </button>
        </section>
      )}
      {(isHome || channel) && (
        <nav className="category-bar" aria-label="Категории видео">
          {categories.map((item) => (
            <button
              key={item}
              aria-pressed={category === item}
              className={`category-chip ${category === item ? "selected" : ""}`}
              onClick={() => {
                const next = new URLSearchParams(params);
                item === "Все"
                  ? next.delete("category")
                  : next.set("category", item);
                setParams(next);
              }}
            >
              {item === "Все" && <Compass size={15} />}
              {item}
            </button>
          ))}
        </nav>
      )}
      <section className="feed-section">
        <div className="section-heading">
          <div>
            <h2>
              {title}
              {isHome && !query && <span className="heading-dot" />}
            </h2>
            <p>
              {query
                ? `По запросу «${query}» · найдено: ${results.length}`
                : pathname === "/history"
                  ? "Видео, которые вы запускали в этом браузере"
                  : !isHome && !handle
                    ? "Ваша коллекция в этом браузере"
                    : "Новые идеи, интересные истории и любимые авторы"}
            </p>
          </div>
          {pathname === "/history" && source.length > 0 ? (
            <button className="text-button" onClick={library.history.clear}>
              <Trash2 size={15} />
              Очистить историю
            </button>
          ) : (
            <label className="sort-control">
              <ArrowDownWideNarrow size={16} />
              <span className="sr-only">Сортировка</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="recommended">Для вас</option>
                <option value="recent">Сначала новые</option>
                <option value="popular">По популярности</option>
              </select>
            </label>
          )}
        </div>
        {results.length ? (
          <div className="video-grid">
            {results.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                saved={library.saved.items.includes(video.id)}
                onSave={() => library.saved.toggle(video.id)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">
              {pathname === "/watch-later" ? (
                <Bookmark size={28} />
              ) : (
                <Compass size={28} />
              )}
            </span>
            <h3>
              {query
                ? "Пока ничего не нашли"
                : "Здесь начинается ваша коллекция"}
            </h3>
            <p>
              {query
                ? "Попробуйте другой запрос или сбросьте категорию."
                : pathname === "/subscriptions"
                  ? "Откройте видео и подпишитесь на канал, который вам интересен."
                  : "Находите интересные видео и возвращайтесь к ним в любое время."}
            </p>
            <Link className="button button-dark" to="/">
              Открыть все видео
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </section>
      <footer className="page-footer">
        <span>Хорошие истории объединяют.</span>
        <span>
          Lumo © {new Date().getFullYear()}{" "}
          <span className="footer-dot">·</span> Сделано для любопытных
        </span>
      </footer>
    </>
  );
}
