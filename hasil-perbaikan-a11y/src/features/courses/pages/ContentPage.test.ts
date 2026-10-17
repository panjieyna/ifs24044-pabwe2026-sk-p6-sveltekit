import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, screen } from "@testing-library/svelte";
import ContentPage from "./ContentPage.svelte";
import { renderWithProviders } from "../../../test-utils";
import { coursesStore } from "../states/coursesStore";
import { mockGoto } from "../../../setupTests";

const ID = "abcdefghijk";
const content = (extra: any = {}) => ({
  id: 9,
  course_id: 2,
  title: "Bab 1",
  youtube: `https://youtu.be/${ID}`,
  my_status_finished: 0,
  ...extra,
});

function setup(props: any = { courseId: "2", contentId: "9" }, state: any = {}) {
  return renderWithProviders(ContentPage, {
    props,
    preloadedState: { content: content(), ...state },
  });
}

describe("ContentPage", () => {
  let loadSpy: any;
  let learnSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    loadSpy = vi.spyOn(coursesStore, "asyncSetContent").mockResolvedValue();
    learnSpy = vi.spyOn(coursesStore, "asyncSetContentLearn").mockResolvedValue();
  });

  it("should load content on mount when contentId exists", () => {
    setup();
    expect(loadSpy).toHaveBeenCalledWith("9");
  });

  it("should not load content without contentId", () => {
    setup({});
    expect(loadSpy).not.toHaveBeenCalled();
  });

  it("should show spinner while loading without content", () => {
    setup({ courseId: "2", contentId: "9" }, { content: null, isContent: true });
    expect(screen.queryByText("Materi tidak ditemukan")).toBeNull();
    expect(screen.queryByTestId("youtube-player")).toBeNull();
  });

  it("should show not found message when content is missing", () => {
    setup({ courseId: "2", contentId: "9" }, { content: null });
    expect(screen.getByText("Materi tidak ditemukan")).toBeInTheDocument();
  });

  it("should render content without a title", () => {
    setup({ courseId: "2", contentId: "9" }, { content: content({ title: null }) });
    expect(screen.getByTestId("youtube-player")).toBeInTheDocument();
  });

  it("should render content while a learn request is in progress", () => {
    setup({ courseId: "2", contentId: "9" }, { isContentLearn: true });
    expect(screen.getByText("Bab 1")).toBeInTheDocument();
    expect(screen.getByTestId("toggle-finished-btn")).toBeDisabled();
  });

  it.each([
    [`https://www.youtube.com/watch?v=${ID}`],
    [`https://youtu.be/${ID}`],
    [`https://www.youtube.com/embed/${ID}`],
    [ID],
  ])("should embed youtube player for %s", (url) => {
    setup({ courseId: "2", contentId: "9" }, { content: content({ youtube: url }) });
    expect(screen.getByTestId("youtube-player").getAttribute("src")).toBe(
      `https://www.youtube.com/embed/${ID}`
    );
  });

  it.each([["https://example.com/video"], [""], [null]])(
    "should show invalid message for %s",
    (url) => {
      setup({ courseId: "2", contentId: "9" }, { content: content({ youtube: url }) });
      expect(screen.queryByTestId("youtube-player")).toBeNull();
      expect(screen.getByText("URL YouTube tidak valid")).toBeInTheDocument();
    }
  );

  it("should go back to course detail or home", async () => {
    const { unmount } = setup();
    await fireEvent.click(screen.getByText("Kembali ke Detail"));
    expect(mockGoto).toHaveBeenCalledWith("/courses/2");
    unmount();

    setup({ contentId: "9" });
    await fireEvent.click(screen.getByText("Kembali ke Detail"));
    expect(mockGoto).toHaveBeenLastCalledWith("/");
  });

  it("should mark content as finished", async () => {
    setup();
    expect(screen.getByText("Tandai Selesai")).toBeInTheDocument();
    await fireEvent.click(screen.getByTestId("toggle-finished-btn"));
    expect(learnSpy).toHaveBeenCalledWith("9", 1);
  });

  it("should mark finished content as unfinished", async () => {
    setup({ courseId: "2", contentId: "9" }, { content: content({ my_status_finished: 1 }) });
    expect(screen.getByText("Selesai")).toBeInTheDocument();
    await fireEvent.click(screen.getByTestId("toggle-finished-btn"));
    expect(learnSpy).toHaveBeenCalledWith("9", 0);
  });

  it("should not toggle without a contentId", async () => {
    setup({ courseId: "2" });
    await fireEvent.click(screen.getByTestId("toggle-finished-btn"));
    expect(learnSpy).not.toHaveBeenCalled();
  });
});
