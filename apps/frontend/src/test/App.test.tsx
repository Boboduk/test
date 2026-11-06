import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import App from "../App";
import { readList } from "../storage";

function open(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("Интерфейс Lumo", () => {
  it("показывает коллекцию и фильтрует категорию", async () => {
    const user = userEvent.setup();
    open();
    expect(screen.getAllByRole("link", { name: /^Смотреть:/ })).toHaveLength(9);
    await user.click(screen.getByRole("button", { name: "Природа" }));
    expect(screen.getAllByRole("link", { name: /^Смотреть:/ })).toHaveLength(1);
    expect(
      screen.getByRole("link", { name: "Смотреть: Океан ближе, чем кажется" }),
    ).toBeInTheDocument();
  });

  it("ищет по тегам и показывает пустой результат", async () => {
    const user = userEvent.setup();
    open();
    await user.type(screen.getByLabelText("Поиск видео"), "астрономия");
    await user.click(screen.getByRole("button", { name: "Найти видео" }));
    expect(screen.getAllByRole("link", { name: /^Смотреть:/ })).toHaveLength(1);
    const search = screen.getByLabelText("Поиск видео");
    await user.clear(search);
    await user.type(search, "абракадабра");
    await user.click(screen.getByRole("button", { name: "Найти видео" }));
    expect(screen.getByText("Пока ничего не нашли")).toBeInTheDocument();
  });

  it("сохраняет видео и восстанавливает список после повторного открытия", async () => {
    const user = userEvent.setup();
    const view = open();
    await user.click(
      screen.getByRole("button", {
        name: "Смотреть позже: Туда, где тише. Один день в горах",
      }),
    );
    expect(readList("lumo:saved")).toEqual(["mountains"]);
    await user.click(screen.getByRole("link", { name: /Смотреть позже/ }));
    expect(screen.getAllByRole("link", { name: /^Смотреть:/ })).toHaveLength(1);
    view.unmount();
    open("/watch-later");
    expect(
      screen.getByRole("link", {
        name: "Смотреть: Туда, где тише. Один день в горах",
      }),
    ).toBeInTheDocument();
  });

  it("записывает историю при запуске плеера и добавляет локальный комментарий", async () => {
    const user = userEvent.setup();
    const { container } = open("/watch/mountains");
    expect(readList("lumo:history")).toEqual([]);
    const video = container.querySelector("video")!;
    expect(video).toHaveAttribute("src", "/media/mountains.mp4");
    fireEvent.play(video);
    expect(readList("lumo:history")).toEqual(["mountains"]);
    await user.type(
      screen.getByLabelText("Ваш комментарий"),
      "Красивое настроение",
    );
    await user.click(screen.getByRole("button", { name: "Отправить" }));
    expect(screen.getByText("Красивое настроение")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Удалить свой комментарий" }),
    );
    expect(screen.queryByText("Красивое настроение")).not.toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "История" }));
    expect(screen.getAllByRole("link", { name: /^Смотреть:/ })).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "Очистить историю" }));
    expect(readList("lumo:history")).toEqual([]);
  });

  it("реакции взаимоисключающие, а подписки заполняют ленту", async () => {
    const user = userEvent.setup();
    open("/watch/mountains");
    await user.click(screen.getByRole("button", { name: "Нравится" }));
    expect(readList("lumo:likes")).toEqual(["mountains"]);
    await user.click(screen.getByRole("button", { name: "Не нравится" }));
    expect(readList("lumo:likes")).toEqual([]);
    expect(readList("lumo:dislikes")).toEqual(["mountains"]);
    await user.click(screen.getByRole("button", { name: "Подписаться" }));
    await user.click(screen.getByRole("link", { name: "Подписки" }));
    expect(screen.getAllByRole("link", { name: /^Смотреть:/ })).toHaveLength(3);
  });

  it("переключает тему и явно объясняет локальный просмотр", async () => {
    const user = userEvent.setup();
    open();
    await user.click(
      screen.getByRole("button", { name: "Включить тёмную тему" }),
    );
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("lumo:theme")).toBe("dark");
    await user.click(screen.getByRole("button", { name: /Добавить видео/ }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByText(/Публикация и загрузка на сервер пока недоступны/),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Закрыть окно" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("переживает повреждённое хранилище и неизвестные ссылки", () => {
    localStorage.setItem("lumo:saved", "{bad json");
    expect(readList("lumo:saved")).toEqual([]);
    open("/watch/no-such-video");
    expect(
      screen.getByRole("heading", { name: "Видео не найдено" }),
    ).toBeInTheDocument();
  });
});
