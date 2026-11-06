import { useState } from "react";

// Повреждённое или недоступное хранилище не должно мешать просмотру.
export function readList(key: string): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function useStoredList(key: string) {
  const [items, setItems] = useState(() => readList(key));
  function save(next: string[]) {
    setItems(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* В приватном режиме список останется в памяти. */
    }
  }
  return {
    items,
    toggle: (id: string) =>
      save(
        items.includes(id)
          ? items.filter((item) => item !== id)
          : [...items, id],
      ),
    addFirst: (id: string) =>
      save([id, ...items.filter((item) => item !== id)]),
    clear: () => save([]),
  };
}
