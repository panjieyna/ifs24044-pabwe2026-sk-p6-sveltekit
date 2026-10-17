import { describe, it, expect, vi, beforeEach } from "vitest";
import { coursesStore, useCoursesStore } from "./coursesStore";
import courseApi from "../api/courseApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

const FLAGS = [
  "Course",
  "CourseAdd",
  "CourseAdded",
  "CourseChange",
  "CourseChanged",
  "CourseChangeCover",
  "CourseChangedCover",
  "CourseDelete",
  "CourseDeleted",
  "Student",
  "StudentChanged",
  "Rating",
  "RatingChanged",
  "Content",
  "ContentAdd",
  "ContentAdded",
  "ContentChange",
  "ContentChanged",
  "ContentDelete",
  "ContentDeleted",
  "ContentLearn",
  "ContentLearned",
];

describe("coursesStore", () => {
  let errorSpy: any;
  let successSpy: any;

  beforeEach(() => {
    coursesStore.reset();
    vi.restoreAllMocks();
    errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
    successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue({} as any);
  });

  it("should expose the same store through useCoursesStore", () => {
    expect(useCoursesStore()).toBe(coursesStore);
  });

  it("should have correct default state", () => {
    const store = useCoursesStore();
    expect(store.courses).toEqual([]);
    expect(store.course).toBeNull();
    expect(store.content).toBeNull();
    for (const flag of FLAGS) {
      expect((store as any)[`is${flag}`]).toBe(false);
    }
    expect(store.$state.courses).toEqual([]);
  });

  it("should update collections and detail with setters", () => {
    const store = useCoursesStore();
    store.setCourses([{ id: 1 } as any]);
    expect(store.courses).toEqual([{ id: 1 }]);
    store.setCourse({ id: 2 } as any);
    expect(store.course).toEqual({ id: 2 });
    store.setContent({ id: 3 } as any);
    expect(store.content).toEqual({ id: 3 });
  });

  it.each(FLAGS)("should toggle flag is%s with its setter", (flag) => {
    const store: any = useCoursesStore();
    store[`setIs${flag}`](true);
    expect(store[`is${flag}`]).toBe(true);
    store[`setIs${flag}`](false);
    expect(store[`is${flag}`]).toBe(false);
  });

  it("should reset to initial state and accept a partial state", () => {
    const store = useCoursesStore();
    store.setCourses([{ id: 1 } as any]);
    store.reset({ isCourse: true });
    expect(store.courses).toEqual([]);
    expect(store.isCourse).toBe(true);
    store.reset();
    expect(store.isCourse).toBe(false);
  });

  describe("asyncSetCourses", () => {
    it("should load courses and clear loading flag", async () => {
      const spy = vi.spyOn(courseApi, "getCourses").mockResolvedValue([{ id: 1 } as any]);
      await coursesStore.asyncSetCourses(1);
      expect(spy).toHaveBeenCalledWith(1);
      expect(coursesStore.courses).toEqual([{ id: 1 }]);
      expect(coursesStore.isCourse).toBe(false);
    });

    it("should default is_me to empty string", async () => {
      const spy = vi.spyOn(courseApi, "getCourses").mockResolvedValue([]);
      await coursesStore.asyncSetCourses();
      expect(spy).toHaveBeenCalledWith("");
    });

    it("should show error dialog on failure", async () => {
      vi.spyOn(courseApi, "getCourses").mockRejectedValue(new Error("gagal"));
      await coursesStore.asyncSetCourses();
      expect(errorSpy).toHaveBeenCalledWith("gagal");
      expect(coursesStore.isCourse).toBe(false);
    });
  });

  describe("asyncSetCourse", () => {
    it("should load course detail", async () => {
      vi.spyOn(courseApi, "getCourseById").mockResolvedValue({ id: 5 } as any);
      await coursesStore.asyncSetCourse(5);
      expect(coursesStore.course).toEqual({ id: 5 });
      expect(coursesStore.isCourse).toBe(false);
    });

    it("should show error dialog on failure", async () => {
      vi.spyOn(courseApi, "getCourseById").mockRejectedValue(new Error("tidak ada"));
      await coursesStore.asyncSetCourse(5);
      expect(errorSpy).toHaveBeenCalledWith("tidak ada");
    });
  });

  describe("asyncAddCourse", () => {
    it("should add course, notify and refresh list", async () => {
      vi.spyOn(courseApi, "postCourse").mockResolvedValue({});
      const list = vi.spyOn(courseApi, "getCourses").mockResolvedValue([]);
      await coursesStore.asyncAddCourse("T", "D");
      expect(coursesStore.isCourseAdded).toBe(true);
      expect(coursesStore.isCourseAdd).toBe(false);
      expect(successSpy).toHaveBeenCalledWith("Kursus berhasil ditambahkan");
      expect(list).toHaveBeenCalled();
    });

    it("should show error on failure", async () => {
      vi.spyOn(courseApi, "postCourse").mockRejectedValue(new Error("x"));
      await coursesStore.asyncAddCourse("T", "D");
      expect(coursesStore.isCourseAdded).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith("x");
      expect(coursesStore.isCourseAdd).toBe(false);
    });
  });

  describe("asyncChangeCourse", () => {
    it("should change course and refresh detail", async () => {
      vi.spyOn(courseApi, "putCourse").mockResolvedValue("ok");
      const detail = vi.spyOn(courseApi, "getCourseById").mockResolvedValue({ id: 1 } as any);
      await coursesStore.asyncChangeCourse(1, "T", "D");
      expect(coursesStore.isCourseChanged).toBe(true);
      expect(successSpy).toHaveBeenCalledWith("Kursus berhasil diubah");
      expect(detail).toHaveBeenCalledWith(1);
      expect(coursesStore.isCourseChange).toBe(false);
    });

    it("should show error on failure", async () => {
      vi.spyOn(courseApi, "putCourse").mockRejectedValue(new Error("x"));
      await coursesStore.asyncChangeCourse(1, "T", "D");
      expect(coursesStore.isCourseChanged).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith("x");
    });
  });

  describe("asyncChangeCover", () => {
    const file = new File(["x"], "a.png");

    it("should change cover and refresh detail", async () => {
      vi.spyOn(courseApi, "postCourseCover").mockResolvedValue("ok");
      vi.spyOn(courseApi, "getCourseById").mockResolvedValue({ id: 1 } as any);
      await coursesStore.asyncChangeCover(1, file);
      expect(coursesStore.isCourseChangedCover).toBe(true);
      expect(successSpy).toHaveBeenCalledWith("Cover berhasil diubah");
      expect(coursesStore.isCourseChangeCover).toBe(false);
    });

    it("should show error on failure", async () => {
      vi.spyOn(courseApi, "postCourseCover").mockRejectedValue(new Error("x"));
      await coursesStore.asyncChangeCover(1, file);
      expect(coursesStore.isCourseChangedCover).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith("x");
    });
  });

  describe("asyncDeleteCourse", () => {
    it("should delete course and refresh list", async () => {
      vi.spyOn(courseApi, "deleteCourse").mockResolvedValue("ok");
      const list = vi.spyOn(courseApi, "getCourses").mockResolvedValue([]);
      await coursesStore.asyncDeleteCourse(1);
      expect(coursesStore.isCourseDeleted).toBe(true);
      expect(successSpy).toHaveBeenCalledWith("Kursus berhasil dihapus");
      expect(list).toHaveBeenCalled();
      expect(coursesStore.isCourseDelete).toBe(false);
    });

    it("should show error on failure", async () => {
      vi.spyOn(courseApi, "deleteCourse").mockRejectedValue(new Error("x"));
      await coursesStore.asyncDeleteCourse(1);
      expect(coursesStore.isCourseDeleted).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith("x");
    });
  });

  describe("asyncDeleteAllCourses", () => {
    it("should delete all and clear list", async () => {
      coursesStore.setCourses([{ id: 1 } as any]);
      vi.spyOn(courseApi, "deleteAllCourses").mockResolvedValue("ok");
      await coursesStore.asyncDeleteAllCourses();
      expect(coursesStore.courses).toEqual([]);
      expect(coursesStore.isCourseDeleted).toBe(true);
      expect(successSpy).toHaveBeenCalledWith("Semua kursus berhasil dihapus");
      expect(coursesStore.isCourseDelete).toBe(false);
    });

    it("should show error on failure", async () => {
      vi.spyOn(courseApi, "deleteAllCourses").mockRejectedValue(new Error("x"));
      await coursesStore.asyncDeleteAllCourses();
      expect(coursesStore.isCourseDeleted).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith("x");
    });
  });

  describe("asyncJoinCourse / asyncLeaveCourse", () => {
    it("should join a course and refresh detail", async () => {
      vi.spyOn(courseApi, "postStudent").mockResolvedValue("ok");
      const detail = vi.spyOn(courseApi, "getCourseById").mockResolvedValue({ id: 1 } as any);
      await coursesStore.asyncJoinCourse(1);
      expect(coursesStore.isStudentChanged).toBe(true);
      expect(successSpy).toHaveBeenCalledWith("Berhasil bergabung sebagai peserta");
      expect(detail).toHaveBeenCalledWith(1);
      expect(coursesStore.isStudent).toBe(false);
    });

    it("should show error when joining fails", async () => {
      vi.spyOn(courseApi, "postStudent").mockRejectedValue(new Error("x"));
      await coursesStore.asyncJoinCourse(1);
      expect(coursesStore.isStudentChanged).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith("x");
    });

    it("should leave a course and refresh detail", async () => {
      vi.spyOn(courseApi, "deleteStudent").mockResolvedValue("ok");
      vi.spyOn(courseApi, "getCourseById").mockResolvedValue({ id: 1 } as any);
      await coursesStore.asyncLeaveCourse(1);
      expect(coursesStore.isStudentChanged).toBe(true);
      expect(successSpy).toHaveBeenCalledWith("Berhasil keluar dari kursus");
      expect(coursesStore.isStudent).toBe(false);
    });

    it("should show error when leaving fails", async () => {
      vi.spyOn(courseApi, "deleteStudent").mockRejectedValue(new Error("x"));
      await coursesStore.asyncLeaveCourse(1);
      expect(coursesStore.isStudentChanged).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith("x");
    });
  });

  describe("asyncRateCourse", () => {
    it("should save rating and refresh detail", async () => {
      const put = vi.spyOn(courseApi, "putStudentRatings").mockResolvedValue("ok");
      vi.spyOn(courseApi, "getCourseById").mockResolvedValue({ id: 1 } as any);
      await coursesStore.asyncRateCourse(1, 4, "Bagus");
      expect(put).toHaveBeenCalledWith(1, 4, "Bagus");
      expect(coursesStore.isRatingChanged).toBe(true);
      expect(successSpy).toHaveBeenCalledWith("Rating berhasil disimpan");
      expect(coursesStore.isRating).toBe(false);
    });

    it("should show error on failure", async () => {
      vi.spyOn(courseApi, "putStudentRatings").mockRejectedValue(new Error("x"));
      await coursesStore.asyncRateCourse(1, 4, "");
      expect(coursesStore.isRatingChanged).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith("x");
    });
  });

  describe("content actions", () => {
    it("asyncAddContent should add and refresh detail", async () => {
      vi.spyOn(courseApi, "postContent").mockResolvedValue({});
      vi.spyOn(courseApi, "getCourseById").mockResolvedValue({ id: 1 } as any);
      await coursesStore.asyncAddContent(1, "T", "Y");
      expect(coursesStore.isContentAdded).toBe(true);
      expect(successSpy).toHaveBeenCalledWith("Konten berhasil ditambahkan");
      expect(coursesStore.isContentAdd).toBe(false);
    });

    it("asyncAddContent should show error on failure", async () => {
      vi.spyOn(courseApi, "postContent").mockRejectedValue(new Error("x"));
      await coursesStore.asyncAddContent(1, "T", "Y");
      expect(coursesStore.isContentAdded).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith("x");
    });

    it("asyncChangeContent should change and refresh detail", async () => {
      const put = vi.spyOn(courseApi, "putContent").mockResolvedValue("ok");
      vi.spyOn(courseApi, "getCourseById").mockResolvedValue({ id: 1 } as any);
      await coursesStore.asyncChangeContent(9, "T", "Y", 1);
      expect(put).toHaveBeenCalledWith(9, "T", "Y");
      expect(coursesStore.isContentChanged).toBe(true);
      expect(successSpy).toHaveBeenCalledWith("Konten berhasil diubah");
      expect(coursesStore.isContentChange).toBe(false);
    });

    it("asyncChangeContent should show error on failure", async () => {
      vi.spyOn(courseApi, "putContent").mockRejectedValue(new Error("x"));
      await coursesStore.asyncChangeContent(9, "T", "Y", 1);
      expect(coursesStore.isContentChanged).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith("x");
    });

    it("asyncDeleteContent should delete and refresh detail", async () => {
      vi.spyOn(courseApi, "deleteContent").mockResolvedValue("ok");
      vi.spyOn(courseApi, "getCourseById").mockResolvedValue({ id: 1 } as any);
      await coursesStore.asyncDeleteContent(9, 1);
      expect(coursesStore.isContentDeleted).toBe(true);
      expect(successSpy).toHaveBeenCalledWith("Konten berhasil dihapus");
      expect(coursesStore.isContentDelete).toBe(false);
    });

    it("asyncDeleteContent should show error on failure", async () => {
      vi.spyOn(courseApi, "deleteContent").mockRejectedValue(new Error("x"));
      await coursesStore.asyncDeleteContent(9, 1);
      expect(coursesStore.isContentDeleted).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith("x");
    });

    it("asyncSetContent should load content", async () => {
      vi.spyOn(courseApi, "getContentById").mockResolvedValue({ id: 9 } as any);
      await coursesStore.asyncSetContent(9);
      expect(coursesStore.content).toEqual({ id: 9 });
      expect(coursesStore.isContent).toBe(false);
    });

    it("asyncSetContent should show error on failure", async () => {
      vi.spyOn(courseApi, "getContentById").mockRejectedValue(new Error("x"));
      await coursesStore.asyncSetContent(9);
      expect(errorSpy).toHaveBeenCalledWith("x");
      expect(coursesStore.isContent).toBe(false);
    });
  });

  describe("asyncSetContentLearn", () => {
    it("should mark content finished (status 1)", async () => {
      const post = vi.spyOn(courseApi, "postContentLearn").mockResolvedValue("ok");
      vi.spyOn(courseApi, "getContentById").mockResolvedValue({ id: 9 } as any);
      await coursesStore.asyncSetContentLearn(9, 1);
      expect(post).toHaveBeenCalledWith(9, 1);
      expect(successSpy).toHaveBeenCalledWith("Ditandai selesai");
      expect(coursesStore.isContentLearned).toBe(true);
      expect(coursesStore.content).toEqual({ id: 9 });
      expect(coursesStore.isContentLearn).toBe(false);
    });

    it("should mark content unfinished (status 0)", async () => {
      vi.spyOn(courseApi, "postContentLearn").mockResolvedValue("ok");
      vi.spyOn(courseApi, "getContentById").mockResolvedValue({ id: 9 } as any);
      await coursesStore.asyncSetContentLearn(9, 0);
      expect(successSpy).toHaveBeenCalledWith("Ditandai belum selesai");
    });

    it("should show error on failure", async () => {
      vi.spyOn(courseApi, "postContentLearn").mockRejectedValue(new Error("x"));
      await coursesStore.asyncSetContentLearn(9, 1);
      expect(coursesStore.isContentLearned).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith("x");
      expect(coursesStore.isContentLearn).toBe(false);
    });
  });
});
