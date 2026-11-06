import { Bookmark, Check, Play } from "lucide-react";
import { Link } from "react-router-dom";
import type { Video } from "../data";

export function Avatar({
  name,
  color,
  small = false,
}: {
  name: string;
  color: string;
  small?: boolean;
}) {
  return (
    <span
      className={`avatar ${small ? "avatar-small" : ""}`}
      style={{ background: color }}
      aria-hidden="true"
    >
      {name.slice(0, 1)}
    </span>
  );
}

export default function VideoCard({
  video,
  saved,
  onSave,
  compact = false,
}: {
  video: Video;
  saved: boolean;
  onSave: () => void;
  compact?: boolean;
}) {
  return (
    <article className={`video-card ${compact ? "video-card-compact" : ""}`}>
      <div className="cover-wrap">
        <Link
          to={`/watch/${video.id}`}
          className="cover-link"
          aria-label={`Смотреть: ${video.title}`}
        >
          <img
            src={`/covers/${video.cover}.svg`}
            alt=""
            loading="lazy"
            width="640"
            height="360"
          />
          <span className="cover-play">
            <Play size={23} fill="currentColor" />
          </span>
          <span className="duration">{video.duration}</span>
        </Link>
        <button
          className={`card-save ${saved ? "is-saved" : ""}`}
          onClick={onSave}
          aria-label={
            saved
              ? `Убрать из сохранённого: ${video.title}`
              : `Смотреть позже: ${video.title}`
          }
          aria-pressed={saved}
        >
          {saved ? <Check size={17} /> : <Bookmark size={17} />}
        </button>
      </div>
      <div className="video-details">
        {!compact && (
          <Link
            to={`/channel/${video.handle}`}
            aria-label={`Канал ${video.channel}`}
          >
            <Avatar name={video.channel} color={video.color} />
          </Link>
        )}
        <div className="video-copy">
          <Link to={`/watch/${video.id}`} className="video-title">
            {video.title}
          </Link>
          <Link to={`/channel/${video.handle}`} className="channel-link">
            {video.channel}
            <Check size={11} strokeWidth={3} />
          </Link>
          <p className="video-meta">
            {video.views} просмотров <span>·</span> {video.date}
          </p>
        </div>
      </div>
    </article>
  );
}
