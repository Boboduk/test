import { useEffect, useRef, useState } from "react";
import {
  Bookmark,
  Check,
  ChevronDown,
  Copy,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { videos } from "../data";
import VideoCard, { Avatar } from "../components/VideoCard";
import type { Library } from "../App";

interface Comment {
  id: string;
  body: string;
  createdAt: string;
}
function readComments(key: string): Comment[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(value)
      ? value.filter(
          (c): c is Comment =>
            c &&
            typeof c.id === "string" &&
            typeof c.body === "string" &&
            typeof c.createdAt === "string",
        )
      : [];
  } catch {
    return [];
  }
}

export default function WatchPage({ library }: { library: Library }) {
  const { id } = useParams();
  const video = videos.find((item) => item.id === id);
  const player = useRef<HTMLVideoElement>(null);
  const [speed, setSpeed] = useState("1");
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const commentKey = `lumo:comments:${id}`;
  const [comments, setComments] = useState(() => readComments(commentKey));
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setComments(readComments(commentKey));
    setDraft("");
    setSpeed("1");
    setExpanded(false);
    setMediaError(false);
    setCopied(false);
    setCopyError(false);
  }, [commentKey]);
  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2500);
    return () => clearTimeout(timeout);
  }, [copied]);

  if (!video)
    return (
      <section className="empty-state">
        <h1>Видео не найдено</h1>
        <p>Возможно, ссылка устарела.</p>
        <Link className="button button-primary" to="/">
          На главную
        </Link>
      </section>
    );
  const subscribed = library.subscriptions.items.includes(video.handle);
  const liked = library.likes.items.includes(video.id);
  const disliked = library.dislikes.items.includes(video.id);
  const saveComments = (next: Comment[]) => {
    setComments(next);
    try {
      localStorage.setItem(commentKey, JSON.stringify(next));
    } catch {
      /* Комментарий останется до закрытия страницы. */
    }
  };

  return (
    <div className="watch-layout">
      <section className="watch-main">
        <div className="player-wrap">
          <video
            key={video.id}
            ref={player}
            controls
            playsInline
            preload="metadata"
            poster={`/covers/${video.cover}.svg`}
            src={`/media/${video.cover}.mp4`}
            onPlay={() => library.history.addFirst(video.id)}
            onError={() => setMediaError(true)}
          />
        </div>
        <div className="player-tools">
          <span className="demo-pill">Демо</span>
          <span>Авторская анимация · 8 секунд · 720p</span>
          <label>
            Скорость{" "}
            <select
              aria-label="Скорость воспроизведения"
              value={speed}
              onChange={(event) => {
                setSpeed(event.target.value);
                if (player.current)
                  player.current.playbackRate = Number(event.target.value);
              }}
            >
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((value) => (
                <option key={value} value={value}>
                  {value}×
                </option>
              ))}
            </select>
          </label>
        </div>
        {mediaError && (
          <p role="alert" className="notice">
            Не удалось воспроизвести ролик. Попробуйте обновить страницу или
            другой браузер с поддержкой MP4.
          </p>
        )}
        <h1 className="watch-title">{video.title}</h1>
        <div className="watch-actions">
          <Link className="author" to={`/channel/${video.handle}`}>
            <Avatar name={video.channel} color={video.color} />
            <span>
              <strong>{video.channel}</strong>
              <small>Демонстрационный канал</small>
            </span>
          </Link>
          <button
            className={`button ${subscribed ? "button-neutral" : "button-dark"}`}
            onClick={() => library.subscriptions.toggle(video.handle)}
          >
            {subscribed ? <Check size={16} /> : null}
            {subscribed ? "Вы подписаны" : "Подписаться"}
          </button>
          <div className="reaction-group">
            <button
              aria-label="Нравится"
              aria-pressed={liked}
              className={liked ? "active" : ""}
              onClick={() => {
                library.likes.toggle(video.id);
                if (disliked) library.dislikes.toggle(video.id);
              }}
            >
              <ThumbsUp size={18} />
              <span>{liked ? 1 : 0}</span>
            </button>
            <button
              aria-label="Не нравится"
              aria-pressed={disliked}
              className={disliked ? "active" : ""}
              onClick={() => {
                library.dislikes.toggle(video.id);
                if (liked) library.likes.toggle(video.id);
              }}
            >
              <ThumbsDown size={18} />
            </button>
          </div>
          <button
            className="button button-neutral"
            aria-pressed={library.saved.items.includes(video.id)}
            onClick={() => library.saved.toggle(video.id)}
          >
            <Bookmark size={17} />
            {library.saved.items.includes(video.id) ? "Сохранено" : "Сохранить"}
          </button>
          <button
            className="icon-button share-button"
            aria-label="Скопировать ссылку"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setCopyError(false);
              } catch {
                setCopyError(true);
              }
            }}
          >
            <Copy size={18} />
          </button>
        </div>
        {copied && (
          <p role="status" className="inline-feedback">
            Ссылка скопирована
          </p>
        )}
        {copyError && (
          <p role="status" className="notice">
            Скопируйте ссылку из адресной строки браузера.
          </p>
        )}
        <div className="description-panel">
          <strong>
            {video.views} просмотров · {video.date}
          </strong>
          <p>{video.description}</p>
          {expanded && (
            <p>
              Это демонстрационная карточка Lumo. Название, канал и статистика —
              примеры. В плеере воспроизводится оригинальная анимированная
              иллюстрация. Реальные публикации и серверное хранение появятся
              после подключения API видео.
            </p>
          )}
          <div className="tag-list">
            {video.tags.map((tag) => (
              <Link to={`/?q=${encodeURIComponent(tag)}`} key={tag}>
                #{tag}
              </Link>
            ))}
          </div>
          <button
            className="text-button"
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Свернуть" : "Подробнее"}
            <ChevronDown size={15} />
          </button>
        </div>
        <section className="comments-section">
          <h2>
            Обсуждение <span>{comments.length}</span>
          </h2>
          <p className="muted small">
            Комментарии сохраняются только в этом браузере.
          </p>
          <form
            className="comment-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (!draft.trim()) return;
              saveComments([
                {
                  id: crypto.randomUUID(),
                  body: draft.trim(),
                  createdAt: new Date().toISOString(),
                },
                ...comments,
              ]);
              setDraft("");
            }}
          >
            <Avatar name="Вы" color="#6a8b78" />
            <div>
              <label className="sr-only" htmlFor="comment">
                Ваш комментарий
              </label>
              <textarea
                id="comment"
                placeholder="Поделитесь впечатлением…"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                maxLength={2000}
                rows={2}
              />
              <button className="button button-dark" disabled={!draft.trim()}>
                Отправить
              </button>
            </div>
          </form>
          {!comments.length && (
            <p className="comment-empty">
              Хорошие разговоры начинаются с первого комментария.
            </p>
          )}
          {comments.map((comment) => (
            <article className="comment" key={comment.id}>
              <Avatar name="Вы" color="#6a8b78" />
              <div>
                <strong>
                  Вы{" "}
                  <span>
                    {new Date(comment.createdAt).toLocaleDateString("ru")}
                  </span>
                </strong>
                <p>{comment.body}</p>
              </div>
              <button
                className="icon-button"
                aria-label="Удалить свой комментарий"
                onClick={() =>
                  saveComments(
                    comments.filter((item) => item.id !== comment.id),
                  )
                }
              >
                <Trash2 size={15} />
              </button>
            </article>
          ))}
        </section>
      </section>
      <aside className="watch-recommendations">
        <h2>Ещё немного вдохновения</h2>
        {[
          ...videos.filter(
            (item) => item.id !== video.id && item.handle === video.handle,
          ),
          ...videos.filter(
            (item) => item.id !== video.id && item.handle !== video.handle,
          ),
        ]
          .slice(0, 6)
          .map((item) => (
            <VideoCard
              key={item.id}
              video={item}
              saved={library.saved.items.includes(item.id)}
              onSave={() => library.saved.toggle(item.id)}
              compact
            />
          ))}
      </aside>
    </div>
  );
}
