import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/svelte";
import DetailPage from "./DetailPage.svelte";
import { renderWithProviders } from "../../../test-utils";
import { coursesStore } from "../states/coursesStore";
import * as toolsHelper from "../../../helpers/toolsHelper";
import { mockGoto } from "../../../setupTests";

const profile = { id: 10, name: "Budi", email: "b@d.id" };

const baseCourse = (extra: any = {}): any => ({
  id: 5,
  user_id: 99,
  title: "Svelte Dasar",
  description: "Belajar Svelte",
  cover: "/cover.png",
  author: { name: "Andi" },
  avg_ratings: "4.5",
  total_contents: 2,
  created_at: "2026-01-02T03:04:05Z",
  students: [],
  contents: [
    { id: 1, course_id: 5, title: "Bab 1", youtube: "https://youtu.be/aaaaaaaaaaa", my_status_finished: 1 },
    { id: 2, course_id: 5, title: "Bab 2", youtube: "https://youtu.be/bbbbbbbbbbb", my_status_finished: 0 },
  ],
  ratings: [
    { name: "Citra", ratings: 5, comment: "Mantap" },
    { name: "Dewi", ratings: 4 },
  ],
  ...extra,
});

function setup(course: any = baseCourse(), props: any = { courseId: "5" }, state: any = {}) {
  return renderWithProviders(DetailPage, {
    props,
    preloadedState: { course, profile, ...state },
  });
}

describe("DetailPage", () => {
  let loadSpy: any;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    loadSpy = vi.spyOn(coursesStore, "asyncSetCourse").mockResolvedValue();
  });

  describe("loading states", () => {
    it("should load course on mount", () => {
      setup();
      expect(loadSpy).toHaveBeenCalledWith("5");
    });

    it("should not load course without courseId", () => {
      setup(baseCourse(), {});
      expect(loadSpy).not.toHaveBeenCalled();
    });

    it("should show spinner while loading without course", () => {
      setup(null, { courseId: "5" }, { isCourse: true });
      expect(screen.queryByText("Kursus tidak ditemukan")).toBeNull();
    });

    it("should show not found when course is missing", () => {
      setup(null);
      expect(screen.getByText("Kursus tidak ditemukan")).toBeInTheDocument();
    });

    it("should render course while reloading", () => {
      setup(baseCourse(), { courseId: "5" }, { isCourse: true });
      expect(screen.getByText("Svelte Dasar")).toBeInTheDocument();
    });
  });

  describe("course information", () => {
    it("should render details with cover, rating, contents and reviews", () => {
      setup();
      expect(screen.getByText("Svelte Dasar")).toBeInTheDocument();
      expect(screen.getByText("Belajar Svelte")).toBeInTheDocument();
      expect(screen.getByText("Andi")).toBeInTheDocument();
      expect(screen.getByText("4.5")).toBeInTheDocument();
      expect(screen.getByText("2 materi")).toBeInTheDocument();
      expect(screen.getByText("Bab 1")).toBeInTheDocument();
      expect(screen.getByText("Selesai")).toBeInTheDocument();
      expect(screen.getByText("Mantap")).toBeInTheDocument();
      expect(screen.getByText("Dewi")).toBeInTheDocument();
      expect(document.querySelector("img")!.getAttribute("src")).toBe("/cover.png");
      expect(screen.getByText("Bab 1").closest("a")).toHaveAttribute(
        "href",
        "/courses/5/contents/1"
      );
    });

    it("should render minimal course without optional data", () => {
      setup({ id: 5, user_id: 99 });
      expect(document.querySelector("img")).toBeNull();
      expect(screen.getByText("0 materi")).toBeInTheDocument();
      expect(screen.getByText("Belum ada materi")).toBeInTheDocument();
      expect(screen.queryByText("Ulasan")).toBeNull();
      expect(screen.getAllByText("—").length).toBe(2);
    });

    it("should render content items without optional fields", () => {
      setup(
        baseCourse({
          contents: [{ id: 7, course_id: 5 }],
          ratings: [{ ratings: undefined }],
        })
      );
      expect(screen.getByTestId("content-list")).toBeInTheDocument();
    });

    it("should hide reviews when ratings list is empty", () => {
      setup(baseCourse({ ratings: [] }));
      expect(screen.queryByText("Ulasan")).toBeNull();
    });

    it("should go back home", async () => {
      setup();
      await fireEvent.click(screen.getByText("Kembali"));
      expect(mockGoto).toHaveBeenCalledWith("/");
    });
  });

  describe("visitor (not owner, not student)", () => {
    it("should show join button and handle join", async () => {
      const join = vi.spyOn(coursesStore, "asyncJoinCourse").mockResolvedValue();
      setup();
      expect(screen.queryByTestId("edit-course-btn")).toBeNull();
      expect(screen.queryByTestId("rating-box")).toBeNull();
      expect(screen.queryByTestId("add-content-btn")).toBeNull();
      await fireEvent.click(screen.getByTestId("join-course-btn"));
      expect(join).toHaveBeenCalledWith("5");
    });

    it("should not join without courseId", async () => {
      const join = vi.spyOn(coursesStore, "asyncJoinCourse").mockResolvedValue();
      setup(baseCourse(), {});
      await fireEvent.click(screen.getByTestId("join-course-btn"));
      expect(join).not.toHaveBeenCalled();
    });

    it("should treat user as visitor when profile is missing", () => {
      setup(baseCourse(), { courseId: "5" }, { profile: null });
      expect(screen.getByTestId("join-course-btn")).toBeInTheDocument();
    });
  });

  describe("student", () => {
    it.each([
      ["id list", [10]],
      ["object with id", [{ id: 10 }]],
      ["object with user_id", [{ user_id: 10 }]],
    ])("should be detected as student from %s", (_n, students) => {
      setup(baseCourse({ students }));
      expect(screen.getByTestId("leave-course-btn")).toBeInTheDocument();
      expect(screen.getByTestId("rating-box")).toBeInTheDocument();
    });

    it("should not be student when students is missing or does not match", () => {
      const { unmount } = setup(baseCourse({ students: undefined }));
      expect(screen.getByTestId("join-course-btn")).toBeInTheDocument();
      unmount();
      setup(baseCourse({ students: [{}, 77] }));
      expect(screen.getByTestId("join-course-btn")).toBeInTheDocument();
    });

    it("should leave course", async () => {
      const leave = vi.spyOn(coursesStore, "asyncLeaveCourse").mockResolvedValue();
      setup(baseCourse({ students: [10] }));
      await fireEvent.click(screen.getByTestId("leave-course-btn"));
      expect(leave).toHaveBeenCalledWith("5");
    });

    it("should not leave without courseId", async () => {
      const leave = vi.spyOn(coursesStore, "asyncLeaveCourse").mockResolvedValue();
      setup(baseCourse({ students: [10] }), {});
      await fireEvent.click(screen.getByTestId("leave-course-btn"));
      expect(leave).not.toHaveBeenCalled();
    });

    it("should submit rating with selected stars and comment", async () => {
      const rate = vi.spyOn(coursesStore, "asyncRateCourse").mockResolvedValue();
      setup(baseCourse({ students: [10] }));
      await fireEvent.click(screen.getByTestId("rating-star-3"));
      await fireEvent.input(screen.getByTestId("rating-comment"), {
        target: { value: "Bagus" },
      });
      await fireEvent.click(screen.getByTestId("rating-submit"));
      expect(rate).toHaveBeenCalledWith("5", 3, "Bagus");
    });

    it("should default to 5 stars", async () => {
      const rate = vi.spyOn(coursesStore, "asyncRateCourse").mockResolvedValue();
      setup(baseCourse({ students: [10] }));
      await fireEvent.click(screen.getByTestId("rating-submit"));
      expect(rate).toHaveBeenCalledWith("5", 5, "");
    });

    it("should not rate without courseId", async () => {
      const rate = vi.spyOn(coursesStore, "asyncRateCourse").mockResolvedValue();
      setup(baseCourse({ students: [10] }), {});
      await fireEvent.click(screen.getByTestId("rating-submit"));
      expect(rate).not.toHaveBeenCalled();
    });
  });

  describe("owner", () => {
    const owner = (extra: any = {}) => baseCourse({ user_id: 10, ...extra });

    it("should show owner controls and no join/leave", () => {
      setup(owner());
      expect(screen.getByTestId("edit-course-btn")).toBeInTheDocument();
      expect(screen.getByTestId("change-cover-btn")).toBeInTheDocument();
      expect(screen.getByTestId("add-content-btn")).toBeInTheDocument();
      expect(screen.queryByTestId("join-course-btn")).toBeNull();
      expect(screen.queryByTestId("leave-course-btn")).toBeNull();
      expect(screen.queryByTestId("rating-box")).toBeNull();
    });

    it("should show owner UI first and rating box when also a student", () => {
      setup(owner({ students: [10] }));
      expect(screen.getByTestId("edit-course-btn")).toBeInTheDocument();
      expect(screen.queryByTestId("leave-course-btn")).toBeNull();
      expect(screen.getByTestId("rating-box")).toBeInTheDocument();
    });

    it("should open and close the edit modal", async () => {
      setup(owner());
      await fireEvent.click(screen.getByTestId("edit-course-btn"));
      expect(screen.getByTestId("change-modal")).toBeInTheDocument();
      await fireEvent.click(screen.getByText("Batal"));
      expect(screen.queryByTestId("change-modal")).toBeNull();
    });

    it("should open and close the cover modal", async () => {
      setup(owner());
      await fireEvent.click(screen.getByTestId("change-cover-btn"));
      expect(screen.getByTestId("change-cover-modal")).toBeInTheDocument();
      await fireEvent.click(screen.getByText("Batal"));
      expect(screen.queryByTestId("change-cover-modal")).toBeNull();
    });

    it("should open add-content modal and close it", async () => {
      setup(owner());
      await fireEvent.click(screen.getByTestId("add-content-btn"));
      expect(screen.getByText("Tambah Konten")).toBeInTheDocument();
      await fireEvent.click(screen.getByText("Batal"));
      expect(screen.queryByTestId("content-modal")).toBeNull();
    });

    it("should pass courseId to the content modal on submit", async () => {
      const add = vi.spyOn(coursesStore, "asyncAddContent").mockResolvedValue();
      setup(owner());
      await fireEvent.click(screen.getByTestId("add-content-btn"));
      await fireEvent.input(screen.getByTestId("content-title-input"), { target: { value: "Bab 3" } });
      await fireEvent.input(screen.getByTestId("content-youtube-input"), {
        target: { value: "https://youtu.be/ccccccccccc" },
      });
      await fireEvent.submit(screen.getByTestId("content-title-input").closest("form")!);
      await waitFor(() =>
        expect(add).toHaveBeenCalledWith("5", "Bab 3", "https://youtu.be/ccccccccccc")
      );
    });

    it("should not open content modal without courseId", async () => {
      setup(owner(), {});
      await fireEvent.click(screen.getByTestId("add-content-btn"));
      expect(screen.queryByTestId("content-modal")).toBeNull();
    });

    it("should open edit-content modal with existing content", async () => {
      setup(owner());
      const editButtons = screen
        .getByTestId("content-list")
        .querySelectorAll("li button");
      await fireEvent.click(editButtons[0]);
      expect(screen.getByText("Ubah Konten")).toBeInTheDocument();
      expect((screen.getByTestId("content-title-input") as HTMLInputElement).value).toBe("Bab 1");
    });

    it("should delete content after confirmation only", async () => {
      const del = vi.spyOn(coursesStore, "asyncDeleteContent").mockResolvedValue();
      vi.spyOn(toolsHelper, "showConfirmDialog")
        .mockResolvedValueOnce({ isConfirmed: false } as any)
        .mockResolvedValueOnce({ isConfirmed: true } as any);
      setup(owner());
      const buttons = screen.getByTestId("content-list").querySelectorAll("li button");
      await fireEvent.click(buttons[1]);
      await waitFor(() => expect(toolsHelper.showConfirmDialog).toHaveBeenCalledTimes(1));
      expect(del).not.toHaveBeenCalled();

      await fireEvent.click(buttons[1]);
      await waitFor(() => expect(del).toHaveBeenCalledWith(1, "5"));
    });

    it("should not delete content without courseId even if confirmed", async () => {
      const del = vi.spyOn(coursesStore, "asyncDeleteContent").mockResolvedValue();
      const confirm = vi
        .spyOn(toolsHelper, "showConfirmDialog")
        .mockResolvedValue({ isConfirmed: true } as any);
      setup(owner(), {});
      const buttons = screen.getByTestId("content-list").querySelectorAll("li button");
      await fireEvent.click(buttons[1]);
      await waitFor(() => expect(confirm).toHaveBeenCalled());
      expect(del).not.toHaveBeenCalled();
    });
  });
});
