import apiHelper from "../../../helpers/apiHelper";

declare const DELCOM_BASEURL: string;

export interface CourseAuthor {
  name: string;
  photo?: string | null;
}

export interface CourseContent {
  id: number | string;
  course_id: number | string;
  title: string;
  youtube: string;
  created_at?: string;
  updated_at?: string;
  my_status_finished?: boolean | number;
}

export interface CourseRating {
  name: string;
  ratings: number;
  comment?: string;
}

export interface Course {
  id: number | string;
  user_id: number | string;
  title: string;
  description: string;
  cover?: string | null;
  created_at?: string;
  updated_at?: string;
  author?: CourseAuthor;
  students?: Array<number | string | { id?: number; user_id?: number }>;
  contents?: CourseContent[];
  total_contents?: number;
  ratings?: CourseRating[];
  avg_ratings?: string | number | null;
  my_percentage_finished?: string | number | null;
}

const courseApi = (() => {
  const BASE_URL = `${DELCOM_BASEURL}/courses`;

  function _url(path: string): string {
    return BASE_URL + path;
  }

  function _check(result: any, fallback: string) {
    if (result.status !== "success" && !result.success) {
      const errorDetails =
        result.data && typeof result.data === "object"
          ? Object.values(result.data).flat().join(", ")
          : "";
      const baseMsg = result.message || fallback;
      throw new Error(errorDetails ? `${baseMsg}: ${errorDetails}` : baseMsg);
    }
  }

  async function postCourse(title: string, description: string): Promise<any> {
    const response = await apiHelper.fetchData(_url(""), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    const result = await response.json();
    _check(result, "Gagal menambahkan kursus");
    return result.data;
  }

  async function postCourseCover(courseId: string | number, cover: File): Promise<string> {
    const formData = new FormData();
    formData.append("cover", cover, cover.name || "cover.jpg");
    const response = await apiHelper.fetchData(_url(`/${courseId}/cover`), {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    _check(result, "Gagal mengubah cover");
    return result.message;
  }

  async function putCourse(
    courseId: string | number,
    title: string,
    description: string
  ): Promise<string> {
    const response = await apiHelper.fetchData(_url(`/${courseId}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    const result = await response.json();
    _check(result, "Gagal mengubah kursus");
    return result.message;
  }

  async function getCourses(is_me: string | number = ""): Promise<Course[]> {
    const targetUrl =
      is_me !== "" && is_me !== null && is_me !== undefined
        ? `?is_me=${is_me}`
        : "";
    const response = await apiHelper.fetchData(_url(targetUrl), { method: "GET" });
    const result = await response.json();
    _check(result, "Gagal mengambil daftar kursus");
    return result.data?.courses || [];
  }

  async function getCourseById(courseId: string | number): Promise<Course> {
    const response = await apiHelper.fetchData(_url(`/${courseId}`), { method: "GET" });
    const result = await response.json();
    _check(result, "Gagal mengambil detail kursus");
    return result.data?.course;
  }

  async function deleteCourse(courseId: string | number): Promise<string> {
    const response = await apiHelper.fetchData(_url(`/${courseId}`), { method: "DELETE" });
    const result = await response.json();
    _check(result, "Gagal menghapus kursus");
    return result.message;
  }

  async function deleteAllCourses(): Promise<string> {
    const response = await apiHelper.fetchData(_url(""), { method: "DELETE" });
    const result = await response.json();
    _check(result, "Gagal menghapus semua kursus");
    return result.message;
  }

  async function postStudent(courseId: string | number): Promise<string> {
    const response = await apiHelper.fetchData(_url(`/${courseId}/students`), {
      method: "POST",
    });
    const result = await response.json();
    _check(result, "Gagal mendaftar sebagai peserta");
    return result.message;
  }

  async function deleteStudent(courseId: string | number): Promise<string> {
    const response = await apiHelper.fetchData(_url(`/${courseId}/students`), {
      method: "DELETE",
    });
    const result = await response.json();
    _check(result, "Gagal keluar dari kursus");
    return result.message;
  }

  async function putStudentRatings(
    courseId: string | number,
    ratings: number,
    comment: string
  ): Promise<string> {
    const response = await apiHelper.fetchData(_url(`/${courseId}/students/ratings`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ratings, comment }),
    });
    const result = await response.json();
    _check(result, "Gagal memberikan rating");
    return result.message;
  }

  async function postContent(
    courseId: string | number,
    title: string,
    youtube: string
  ): Promise<any> {
    const response = await apiHelper.fetchData(_url(`/${courseId}/contents`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, youtube }),
    });
    const result = await response.json();
    _check(result, "Gagal menambahkan konten");
    return result.data;
  }

  async function putContent(
    contentId: string | number,
    title: string,
    youtube: string
  ): Promise<string> {
    const response = await apiHelper.fetchData(
      `${DELCOM_BASEURL}/courses/-/contents/${contentId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, youtube }),
      }
    );
    const result = await response.json();
    _check(result, "Gagal mengubah konten");
    return result.message;
  }

  async function getContentById(contentId: string | number): Promise<CourseContent> {
    const response = await apiHelper.fetchData(
      `${DELCOM_BASEURL}/courses/-/contents/${contentId}`,
      { method: "GET" }
    );
    const result = await response.json();
    _check(result, "Gagal mengambil detail konten");
    return result.data?.course_content;
  }

  async function deleteContent(contentId: string | number): Promise<string> {
    const response = await apiHelper.fetchData(
      `${DELCOM_BASEURL}/courses/-/contents/${contentId}`,
      { method: "DELETE" }
    );
    const result = await response.json();
    _check(result, "Gagal menghapus konten");
    return result.message;
  }

  async function postContentLearn(
    contentId: string | number,
    status: 0 | 1
  ): Promise<string> {
    const response = await apiHelper.fetchData(
      `${DELCOM_BASEURL}/courses/-/contents/${contentId}/learns`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }
    );
    const result = await response.json();
    _check(result, "Gagal mengubah status belajar");
    return result.message;
  }

  return {
    postCourse,
    postCourseCover,
    putCourse,
    getCourses,
    getCourseById,
    deleteCourse,
    deleteAllCourses,
    postStudent,
    deleteStudent,
    putStudentRatings,
    postContent,
    putContent,
    getContentById,
    deleteContent,
    postContentLearn,
  };
})();

export default courseApi;
