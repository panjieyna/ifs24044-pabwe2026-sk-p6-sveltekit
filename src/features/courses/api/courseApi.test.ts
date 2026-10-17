import { describe, it, expect, vi, beforeEach } from "vitest";
import courseApi from "./courseApi";
import apiHelper from "../../../helpers/apiHelper";

const BASE = "https://open-api.delcom.org/api/v1";

function mockResult(result: any) {
  return vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
    json: async () => result,
  } as any);
}

describe("courseApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("error handling (_check)", () => {
    it("should accept result.success true without status", async () => {
      mockResult({ success: true, message: "ok", data: { id: 1 } });
      await expect(courseApi.postCourse("a", "b")).resolves.toEqual({ id: 1 });
    });

    it("should append validation details from object data", async () => {
      mockResult({
        status: "fail",
        message: "Data tidak valid",
        data: { title: ["wajib diisi"], description: ["terlalu pendek"] },
      });
      await expect(courseApi.postCourse("", "")).rejects.toThrow(
        "Data tidak valid: wajib diisi, terlalu pendek"
      );
    });

    it("should use fallback message when message is missing", async () => {
      mockResult({ status: "fail" });
      await expect(courseApi.postCourse("a", "b")).rejects.toThrow(
        "Gagal menambahkan kursus"
      );
    });

    it("should ignore non-object data", async () => {
      mockResult({ status: "fail", message: "Gagal", data: "teks" });
      await expect(courseApi.postCourse("a", "b")).rejects.toThrow(/^Gagal$/);
    });

    it("should ignore empty object data", async () => {
      mockResult({ status: "fail", message: "Gagal", data: {} });
      await expect(courseApi.postCourse("a", "b")).rejects.toThrow(/^Gagal$/);
    });
  });

  describe("postCourse", () => {
    it("should POST title and description", async () => {
      const spy = mockResult({ status: "success", data: { course_id: 9 } });
      const data = await courseApi.postCourse("Judul", "Deskripsi");
      expect(data).toEqual({ course_id: 9 });
      expect(spy).toHaveBeenCalledWith(`${BASE}/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Judul", description: "Deskripsi" }),
      });
    });
  });

  describe("postCourseCover", () => {
    it("should upload cover with file name", async () => {
      const spy = mockResult({ status: "success", message: "Cover diubah" });
      const file = new File(["x"], "foto.png", { type: "image/png" });
      const msg = await courseApi.postCourseCover(5, file);
      expect(msg).toBe("Cover diubah");
      const [url, opts] = spy.mock.calls[0] as any;
      expect(url).toBe(`${BASE}/courses/5/cover`);
      expect(opts.method).toBe("POST");
      expect((opts.body as FormData).get("cover")).toBeInstanceOf(File);
      expect(((opts.body as FormData).get("cover") as File).name).toBe("foto.png");
    });

    it("should fall back to cover.jpg when file has no name", async () => {
      const spy = mockResult({ status: "success", message: "ok" });
      await courseApi.postCourseCover(5, new File(["x"], ""));
      const opts = (spy.mock.calls[0] as any)[1];
      expect(((opts.body as FormData).get("cover") as File).name).toBe("cover.jpg");
    });

    it("should throw on failure", async () => {
      mockResult({ status: "fail" });
      await expect(
        courseApi.postCourseCover(5, new File(["x"], "a.png"))
      ).rejects.toThrow("Gagal mengubah cover");
    });
  });

  describe("putCourse", () => {
    it("should PUT course data", async () => {
      const spy = mockResult({ status: "success", message: "Diubah" });
      await expect(courseApi.putCourse(3, "T", "D")).resolves.toBe("Diubah");
      expect(spy).toHaveBeenCalledWith(
        `${BASE}/courses/3`,
        expect.objectContaining({ method: "PUT" })
      );
    });

    it("should throw on failure", async () => {
      mockResult({ status: "fail" });
      await expect(courseApi.putCourse(3, "T", "D")).rejects.toThrow(
        "Gagal mengubah kursus"
      );
    });
  });

  describe("getCourses", () => {
    it("should fetch all courses by default", async () => {
      const spy = mockResult({ status: "success", data: { courses: [{ id: 1 }] } });
      await expect(courseApi.getCourses()).resolves.toEqual([{ id: 1 }]);
      expect(spy).toHaveBeenCalledWith(`${BASE}/courses`, { method: "GET" });
    });

    it("should add is_me query when provided", async () => {
      const spy = mockResult({ status: "success", data: { courses: [] } });
      await courseApi.getCourses(1);
      expect(spy).toHaveBeenCalledWith(`${BASE}/courses?is_me=1`, { method: "GET" });
    });

    it("should ignore null is_me", async () => {
      const spy = mockResult({ status: "success", data: { courses: [] } });
      await courseApi.getCourses(null as any);
      expect(spy).toHaveBeenCalledWith(`${BASE}/courses`, { method: "GET" });
    });

    it("should ignore undefined is_me passed explicitly", async () => {
      const spy = mockResult({ status: "success", data: { courses: [] } });
      await courseApi.getCourses(undefined);
      expect(spy).toHaveBeenCalledWith(`${BASE}/courses`, { method: "GET" });
    });

    it("should return empty array when data is missing", async () => {
      mockResult({ status: "success" });
      await expect(courseApi.getCourses()).resolves.toEqual([]);
    });

    it("should throw on failure", async () => {
      mockResult({ status: "fail" });
      await expect(courseApi.getCourses()).rejects.toThrow(
        "Gagal mengambil daftar kursus"
      );
    });
  });

  describe("getCourseById", () => {
    it("should return data.course", async () => {
      const spy = mockResult({ status: "success", data: { course: { id: 7 } } });
      await expect(courseApi.getCourseById(7)).resolves.toEqual({ id: 7 });
      expect(spy).toHaveBeenCalledWith(`${BASE}/courses/7`, { method: "GET" });
    });

    it("should return undefined when data is missing", async () => {
      mockResult({ status: "success" });
      await expect(courseApi.getCourseById(7)).resolves.toBeUndefined();
    });

    it("should throw on failure", async () => {
      mockResult({ status: "fail" });
      await expect(courseApi.getCourseById(7)).rejects.toThrow(
        "Gagal mengambil detail kursus"
      );
    });
  });

  describe("deleteCourse", () => {
    it("should DELETE a course", async () => {
      const spy = mockResult({ status: "success", message: "Dihapus" });
      await expect(courseApi.deleteCourse(2)).resolves.toBe("Dihapus");
      expect(spy).toHaveBeenCalledWith(`${BASE}/courses/2`, { method: "DELETE" });
    });

    it("should throw on failure", async () => {
      mockResult({ status: "fail" });
      await expect(courseApi.deleteCourse(2)).rejects.toThrow("Gagal menghapus kursus");
    });
  });

  describe("deleteAllCourses", () => {
    it("should DELETE /courses", async () => {
      const spy = mockResult({ status: "success", message: "Semua dihapus" });
      await expect(courseApi.deleteAllCourses()).resolves.toBe("Semua dihapus");
      expect(spy).toHaveBeenCalledWith(`${BASE}/courses`, { method: "DELETE" });
    });

    it("should throw on failure", async () => {
      mockResult({ status: "fail" });
      await expect(courseApi.deleteAllCourses()).rejects.toThrow(
        "Gagal menghapus semua kursus"
      );
    });
  });

  describe("students", () => {
    it("postStudent should join a course", async () => {
      const spy = mockResult({ status: "success", message: "Bergabung" });
      await expect(courseApi.postStudent(4)).resolves.toBe("Bergabung");
      expect(spy).toHaveBeenCalledWith(`${BASE}/courses/4/students`, { method: "POST" });
    });

    it("postStudent should throw on failure", async () => {
      mockResult({ status: "fail" });
      await expect(courseApi.postStudent(4)).rejects.toThrow(
        "Gagal mendaftar sebagai peserta"
      );
    });

    it("deleteStudent should leave a course", async () => {
      const spy = mockResult({ status: "success", message: "Keluar" });
      await expect(courseApi.deleteStudent(4)).resolves.toBe("Keluar");
      expect(spy).toHaveBeenCalledWith(`${BASE}/courses/4/students`, {
        method: "DELETE",
      });
    });

    it("deleteStudent should throw on failure", async () => {
      mockResult({ status: "fail" });
      await expect(courseApi.deleteStudent(4)).rejects.toThrow(
        "Gagal keluar dari kursus"
      );
    });

    it("putStudentRatings should send ratings and comment", async () => {
      const spy = mockResult({ status: "success", message: "Rating disimpan" });
      await expect(courseApi.putStudentRatings(4, 5, "Bagus")).resolves.toBe(
        "Rating disimpan"
      );
      expect(spy).toHaveBeenCalledWith(`${BASE}/courses/4/students/ratings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ratings: 5, comment: "Bagus" }),
      });
    });

    it("putStudentRatings should throw on failure", async () => {
      mockResult({ status: "fail" });
      await expect(courseApi.putStudentRatings(4, 5, "")).rejects.toThrow(
        "Gagal memberikan rating"
      );
    });
  });

  describe("contents", () => {
    it("postContent should add content", async () => {
      const spy = mockResult({ status: "success", data: { course_content_id: 1 } });
      await expect(courseApi.postContent(4, "Bab 1", "https://youtu.be/x")).resolves.toEqual({
        course_content_id: 1,
      });
      expect(spy).toHaveBeenCalledWith(
        `${BASE}/courses/4/contents`,
        expect.objectContaining({ method: "POST" })
      );
    });

    it("postContent should throw on failure", async () => {
      mockResult({ status: "fail" });
      await expect(courseApi.postContent(4, "a", "b")).rejects.toThrow(
        "Gagal menambahkan konten"
      );
    });

    it("putContent should update content", async () => {
      const spy = mockResult({ status: "success", message: "Konten diubah" });
      await expect(courseApi.putContent(8, "T", "Y")).resolves.toBe("Konten diubah");
      expect(spy).toHaveBeenCalledWith(
        `${BASE}/courses/-/contents/8`,
        expect.objectContaining({ method: "PUT" })
      );
    });

    it("putContent should throw on failure", async () => {
      mockResult({ status: "fail" });
      await expect(courseApi.putContent(8, "T", "Y")).rejects.toThrow(
        "Gagal mengubah konten"
      );
    });

    it("getContentById should return data.course_content", async () => {
      const spy = mockResult({
        status: "success",
        data: { course_content: { id: 8 } },
      });
      await expect(courseApi.getContentById(8)).resolves.toEqual({ id: 8 });
      expect(spy).toHaveBeenCalledWith(`${BASE}/courses/-/contents/8`, {
        method: "GET",
      });
    });

    it("getContentById should return undefined when data is missing", async () => {
      mockResult({ status: "success" });
      await expect(courseApi.getContentById(8)).resolves.toBeUndefined();
    });

    it("getContentById should throw on failure", async () => {
      mockResult({ status: "fail" });
      await expect(courseApi.getContentById(8)).rejects.toThrow(
        "Gagal mengambil detail konten"
      );
    });

    it("deleteContent should delete content", async () => {
      const spy = mockResult({ status: "success", message: "Konten dihapus" });
      await expect(courseApi.deleteContent(8)).resolves.toBe("Konten dihapus");
      expect(spy).toHaveBeenCalledWith(`${BASE}/courses/-/contents/8`, {
        method: "DELETE",
      });
    });

    it("deleteContent should throw on failure", async () => {
      mockResult({ status: "fail" });
      await expect(courseApi.deleteContent(8)).rejects.toThrow(
        "Gagal menghapus konten"
      );
    });

    it("postContentLearn should send the learning status", async () => {
      const spy = mockResult({ status: "success", message: "Status diubah" });
      await expect(courseApi.postContentLearn(8, 1)).resolves.toBe("Status diubah");
      expect(spy).toHaveBeenCalledWith(`${BASE}/courses/-/contents/8/learns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 1 }),
      });
    });

    it("postContentLearn should throw on failure", async () => {
      mockResult({ status: "fail" });
      await expect(courseApi.postContentLearn(8, 0)).rejects.toThrow(
        "Gagal mengubah status belajar"
      );
    });
  });
});
