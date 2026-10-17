import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/svelte";
import HomePage from "./HomePage.svelte";
import { renderWithProviders } from "../../../test-utils";
import { coursesStore } from "../states/coursesStore";
import * as toolsHelper from "../../../helpers/toolsHelper";

const mine: any = {
  id: 1,
  user_id: 10,
  title: "Svelte Dasar",
  description: "Belajar Svelte",
  cover: "/c1.png",
  author: { name: "Budi" },
  avg_ratings: "4.25",
  total_contents: 3,
  created_at: "2026-01-02T03:04:05Z",
};
const other: any = {
  id: 2,
  user_id: 20,
  title: "Vue Lanjut",
  description: "",
  cover: null,
  avg_ratings: null,
  total_contents: 0,
};
const bare: any = { id: 3, user_id: 30 };
const profile = { id: 10, name: "Budi", email: "b@d.id" };

function setup(state: Record<string, any> = {}) {
  return renderWithProviders(HomePage, {
    preloadedState: { courses: [mine, other], profile, ...state },
  });
}

describe("HomePage", () => {
  let loadSpy: any;

  beforeEach(() => {
    vi.restoreAllMocks();
    loadSpy = vi.spyOn(coursesStore, "asyncSetCourses").mockResolvedValue();
  });

  it("should load courses on mount and render cards", () => {
    setup();
    expect(loadSpy).toHaveBeenCalledWith();
    expect(screen.getByText("Semua Kursus")).toBeInTheDocument();
    expect(screen.getByTestId("course-card-1")).toHaveAttribute("href", "/courses/1");
    expect(screen.getByText("Svelte Dasar")).toBeInTheDocument();
    expect(screen.getByText("4.3")).toBeInTheDocument();
    expect(screen.getByText("Tanpa deskripsi")).toBeInTheDocument();
    expect(screen.getByText("3 materi")).toBeInTheDocument();
    expect(screen.getByText("0 materi")).toBeInTheDocument();
    expect(document.querySelectorAll("img").length).toBe(1);
  });

  it("should render cards with missing optional fields", () => {
    setup({ courses: [bare] });
    expect(screen.getByTestId("course-card-3")).toBeInTheDocument();
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("should show empty state when there are no courses", () => {
    setup({ courses: [] });
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  it("should show loading spinner when loading or deleting", () => {
    const { unmount } = setup({ isCourse: true });
    expect(screen.getByTestId("loading")).toBeInTheDocument();
    unmount();
    setup({ isCourseDelete: true });
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("should use h2 for card titles and keep delete button outside the link", () => {
    setup();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Semua Kursus");
    expect(screen.getByRole("heading", { level: 2, name: "Svelte Dasar" })).toBeInTheDocument();
    expect(document.querySelectorAll("h3").length).toBe(0);
    const del = screen.getByTestId("delete-course-1");
    expect(del.closest("a")).toBeNull();
    expect(del).toHaveAttribute("aria-label", "Hapus kursus Svelte Dasar");
    expect(document.querySelector("img")!.getAttribute("alt")).toBe("");
  });

  it("should show delete button only for own courses", () => {
    setup();
    expect(screen.getByTestId("delete-course-1")).toBeInTheDocument();
    expect(screen.queryByTestId("delete-course-2")).toBeNull();
  });

  it("should hide delete buttons when profile is missing", () => {
    setup({ profile: null });
    expect(screen.queryByTestId("delete-course-1")).toBeNull();
  });

  it("should filter by title and description", async () => {
    setup({ courses: [mine, other, bare] });
    const input = screen.getByTestId("search-input");

    await fireEvent.input(input, { target: { value: "vue" } });
    expect(screen.queryByTestId("course-card-1")).toBeNull();
    expect(screen.getByTestId("course-card-2")).toBeInTheDocument();

    await fireEvent.input(input, { target: { value: "belajar" } });
    expect(screen.getByTestId("course-card-1")).toBeInTheDocument();
    expect(screen.queryByTestId("course-card-2")).toBeNull();

    await fireEvent.input(input, { target: { value: "tidak ada" } });
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();

    await fireEvent.input(input, { target: { value: "  " } });
    expect(screen.getByTestId("course-card-3")).toBeInTheDocument();
  });

  it("should toggle 'Milik Saya' filter and reload data", async () => {
    setup();
    await fireEvent.click(screen.getByTestId("filter-mine-btn"));
    expect(loadSpy).toHaveBeenLastCalledWith(1);
    await waitFor(() => expect(screen.queryByTestId("course-card-2")).toBeNull());
    expect(screen.getByTestId("course-card-1")).toBeInTheDocument();

    await fireEvent.click(screen.getByTestId("filter-mine-btn"));
    expect(loadSpy).toHaveBeenLastCalledWith();
    await waitFor(() => expect(screen.getByTestId("course-card-2")).toBeInTheDocument());
  });

  it("should show nothing for 'Milik Saya' without profile", async () => {
    setup({ profile: null });
    await fireEvent.click(screen.getByTestId("filter-mine-btn"));
    await waitFor(() => expect(screen.getByTestId("empty-state")).toBeInTheDocument());
  });

  it("should delete all courses only after confirmation", async () => {
    const del = vi.spyOn(coursesStore, "asyncDeleteAllCourses").mockResolvedValue();
    const confirm = vi
      .spyOn(toolsHelper, "showConfirmDialog")
      .mockResolvedValueOnce({ isConfirmed: false } as any)
      .mockResolvedValueOnce({ isConfirmed: true } as any);
    setup();
    await fireEvent.click(screen.getByTestId("delete-all-btn"));
    await waitFor(() => expect(confirm).toHaveBeenCalledTimes(1));
    expect(del).not.toHaveBeenCalled();

    await fireEvent.click(screen.getByTestId("delete-all-btn"));
    await waitFor(() => expect(del).toHaveBeenCalledTimes(1));
  });

  it("should delete one course only after confirmation", async () => {
    const del = vi.spyOn(coursesStore, "asyncDeleteCourse").mockResolvedValue();
    vi.spyOn(toolsHelper, "showConfirmDialog")
      .mockResolvedValueOnce({ isConfirmed: false } as any)
      .mockResolvedValueOnce({ isConfirmed: true } as any);
    setup();
    const btn = screen.getByTestId("delete-course-1");
    await fireEvent.click(btn);
    await waitFor(() => expect(toolsHelper.showConfirmDialog).toHaveBeenCalledTimes(1));
    expect(del).not.toHaveBeenCalled();

    await fireEvent.click(btn);
    await waitFor(() => expect(del).toHaveBeenCalledWith(1));
  });

  it("should open and close add modal", async () => {
    setup();
    expect(screen.queryByTestId("add-modal")).toBeNull();
    await fireEvent.click(screen.getByTestId("add-course-btn"));
    expect(screen.getByTestId("add-modal")).toBeInTheDocument();
    await fireEvent.click(screen.getByTestId("add-modal-close"));
    expect(screen.queryByTestId("add-modal")).toBeNull();
  });
});
