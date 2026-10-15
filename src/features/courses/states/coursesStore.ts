import { writable } from "svelte/store";
import courseApi, { type Course, type CourseContent } from "../api/courseApi";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

export interface CoursesState {
  courses: Course[];
  course: Course | null;
  content: CourseContent | null;
  isCourse: boolean;
  isCourseAdd: boolean;
  isCourseAdded: boolean;
  isCourseChange: boolean;
  isCourseChanged: boolean;
  isCourseChangeCover: boolean;
  isCourseChangedCover: boolean;
  isCourseDelete: boolean;
  isCourseDeleted: boolean;
  isStudent: boolean;
  isStudentChanged: boolean;
  isRating: boolean;
  isRatingChanged: boolean;
  isContent: boolean;
  isContentAdd: boolean;
  isContentAdded: boolean;
  isContentChange: boolean;
  isContentChanged: boolean;
  isContentDelete: boolean;
  isContentDeleted: boolean;
  isContentLearn: boolean;
  isContentLearned: boolean;
}

function createCoursesStore() {
  const initial: CoursesState = {
    courses: [],
    course: null,
    content: null,
    isCourse: false,
    isCourseAdd: false,
    isCourseAdded: false,
    isCourseChange: false,
    isCourseChanged: false,
    isCourseChangeCover: false,
    isCourseChangedCover: false,
    isCourseDelete: false,
    isCourseDeleted: false,
    isStudent: false,
    isStudentChanged: false,
    isRating: false,
    isRatingChanged: false,
    isContent: false,
    isContentAdd: false,
    isContentAdded: false,
    isContentChange: false,
    isContentChanged: false,
    isContentDelete: false,
    isContentDeleted: false,
    isContentLearn: false,
    isContentLearned: false,
  };

  let currentState: CoursesState = { ...initial };
  const innerStore = writable<CoursesState>(currentState);
  innerStore.subscribe((val) => {
    currentState = val;
  });

  return {
    subscribe: innerStore.subscribe,
    get courses() {
      return currentState.courses;
    },
    get course() {
      return currentState.course;
    },
    get content() {
      return currentState.content;
    },
    get isCourse() {
      return currentState.isCourse;
    },
    get isCourseAdd() {
      return currentState.isCourseAdd;
    },
    get isCourseAdded() {
      return currentState.isCourseAdded;
    },
    get isCourseChange() {
      return currentState.isCourseChange;
    },
    get isCourseChanged() {
      return currentState.isCourseChanged;
    },
    get isCourseChangeCover() {
      return currentState.isCourseChangeCover;
    },
    get isCourseChangedCover() {
      return currentState.isCourseChangedCover;
    },
    get isCourseDelete() {
      return currentState.isCourseDelete;
    },
    get isCourseDeleted() {
      return currentState.isCourseDeleted;
    },
    get isStudent() {
      return currentState.isStudent;
    },
    get isStudentChanged() {
      return currentState.isStudentChanged;
    },
    get isRating() {
      return currentState.isRating;
    },
    get isRatingChanged() {
      return currentState.isRatingChanged;
    },
    get isContent() {
      return currentState.isContent;
    },
    get isContentAdd() {
      return currentState.isContentAdd;
    },
    get isContentAdded() {
      return currentState.isContentAdded;
    },
    get isContentChange() {
      return currentState.isContentChange;
    },
    get isContentChanged() {
      return currentState.isContentChanged;
    },
    get isContentDelete() {
      return currentState.isContentDelete;
    },
    get isContentDeleted() {
      return currentState.isContentDeleted;
    },
    get isContentLearn() {
      return currentState.isContentLearn;
    },
    get isContentLearned() {
      return currentState.isContentLearned;
    },
    get $state() {
      return currentState;
    },
    reset(state: Partial<CoursesState> = initial) {
      innerStore.set({ ...initial, ...state });
    },
    setCourses(courses: Course[]) {
      innerStore.update((s) => ({ ...s, courses }));
    },
    setCourse(course: Course | null) {
      innerStore.update((s) => ({ ...s, course }));
    },
    setContent(content: CourseContent | null) {
      innerStore.update((s) => ({ ...s, content }));
    },
    setIsCourse(status: boolean) {
      innerStore.update((s) => ({ ...s, isCourse: status }));
    },
    setIsCourseAdd(status: boolean) {
      innerStore.update((s) => ({ ...s, isCourseAdd: status }));
    },
    setIsCourseAdded(status: boolean) {
      innerStore.update((s) => ({ ...s, isCourseAdded: status }));
    },
    setIsCourseChange(status: boolean) {
      innerStore.update((s) => ({ ...s, isCourseChange: status }));
    },
    setIsCourseChanged(status: boolean) {
      innerStore.update((s) => ({ ...s, isCourseChanged: status }));
    },
    setIsCourseChangeCover(status: boolean) {
      innerStore.update((s) => ({ ...s, isCourseChangeCover: status }));
    },
    setIsCourseChangedCover(status: boolean) {
      innerStore.update((s) => ({ ...s, isCourseChangedCover: status }));
    },
    setIsCourseDelete(status: boolean) {
      innerStore.update((s) => ({ ...s, isCourseDelete: status }));
    },
    setIsCourseDeleted(status: boolean) {
      innerStore.update((s) => ({ ...s, isCourseDeleted: status }));
    },
    setIsStudent(status: boolean) {
      innerStore.update((s) => ({ ...s, isStudent: status }));
    },
    setIsStudentChanged(status: boolean) {
      innerStore.update((s) => ({ ...s, isStudentChanged: status }));
    },
    setIsRating(status: boolean) {
      innerStore.update((s) => ({ ...s, isRating: status }));
    },
    setIsRatingChanged(status: boolean) {
      innerStore.update((s) => ({ ...s, isRatingChanged: status }));
    },
    setIsContent(status: boolean) {
      innerStore.update((s) => ({ ...s, isContent: status }));
    },
    setIsContentAdd(status: boolean) {
      innerStore.update((s) => ({ ...s, isContentAdd: status }));
    },
    setIsContentAdded(status: boolean) {
      innerStore.update((s) => ({ ...s, isContentAdded: status }));
    },
    setIsContentChange(status: boolean) {
      innerStore.update((s) => ({ ...s, isContentChange: status }));
    },
    setIsContentChanged(status: boolean) {
      innerStore.update((s) => ({ ...s, isContentChanged: status }));
    },
    setIsContentDelete(status: boolean) {
      innerStore.update((s) => ({ ...s, isContentDelete: status }));
    },
    setIsContentDeleted(status: boolean) {
      innerStore.update((s) => ({ ...s, isContentDeleted: status }));
    },
    setIsContentLearn(status: boolean) {
      innerStore.update((s) => ({ ...s, isContentLearn: status }));
    },
    setIsContentLearned(status: boolean) {
      innerStore.update((s) => ({ ...s, isContentLearned: status }));
    },

    async asyncSetCourses(is_me: string | number = "") {
      try {
        this.setIsCourse(true);
        const courses = await courseApi.getCourses(is_me);
        this.setCourses(courses);
      } catch (error: any) {
        showErrorDialog(error.message);
      } finally {
        this.setIsCourse(false);
      }
    },

    async asyncSetCourse(courseId: string | number) {
      try {
        this.setIsCourse(true);
        const course = await courseApi.getCourseById(courseId);
        this.setCourse(course);
      } catch (error: any) {
        showErrorDialog(error.message);
      } finally {
        this.setIsCourse(false);
      }
    },

    async asyncAddCourse(title: string, description: string) {
      try {
        this.setIsCourseAdd(true);
        await courseApi.postCourse(title, description);
        this.setIsCourseAdded(true);
        showSuccessDialog("Kursus berhasil ditambahkan");
        await this.asyncSetCourses();
      } catch (error: any) {
        this.setIsCourseAdded(false);
        showErrorDialog(error.message);
      } finally {
        this.setIsCourseAdd(false);
      }
    },

    async asyncChangeCourse(
      courseId: string | number,
      title: string,
      description: string
    ) {
      try {
        this.setIsCourseChange(true);
        await courseApi.putCourse(courseId, title, description);
        this.setIsCourseChanged(true);
        showSuccessDialog("Kursus berhasil diubah");
        await this.asyncSetCourse(courseId);
      } catch (error: any) {
        this.setIsCourseChanged(false);
        showErrorDialog(error.message);
      } finally {
        this.setIsCourseChange(false);
      }
    },

    async asyncChangeCover(courseId: string | number, cover: File) {
      try {
        this.setIsCourseChangeCover(true);
        await courseApi.postCourseCover(courseId, cover);
        this.setIsCourseChangedCover(true);
        showSuccessDialog("Cover berhasil diubah");
        await this.asyncSetCourse(courseId);
      } catch (error: any) {
        this.setIsCourseChangedCover(false);
        showErrorDialog(error.message);
      } finally {
        this.setIsCourseChangeCover(false);
      }
    },

    async asyncDeleteCourse(courseId: string | number) {
      try {
        this.setIsCourseDelete(true);
        await courseApi.deleteCourse(courseId);
        this.setIsCourseDeleted(true);
        showSuccessDialog("Kursus berhasil dihapus");
        await this.asyncSetCourses();
      } catch (error: any) {
        this.setIsCourseDeleted(false);
        showErrorDialog(error.message);
      } finally {
        this.setIsCourseDelete(false);
      }
    },

    async asyncDeleteAllCourses() {
      try {
        this.setIsCourseDelete(true);
        await courseApi.deleteAllCourses();
        this.setIsCourseDeleted(true);
        showSuccessDialog("Semua kursus berhasil dihapus");
        this.setCourses([]);
      } catch (error: any) {
        this.setIsCourseDeleted(false);
        showErrorDialog(error.message);
      } finally {
        this.setIsCourseDelete(false);
      }
    },

    async asyncJoinCourse(courseId: string | number) {
      try {
        this.setIsStudent(true);
        await courseApi.postStudent(courseId);
        this.setIsStudentChanged(true);
        showSuccessDialog("Berhasil bergabung sebagai peserta");
        await this.asyncSetCourse(courseId);
      } catch (error: any) {
        this.setIsStudentChanged(false);
        showErrorDialog(error.message);
      } finally {
        this.setIsStudent(false);
      }
    },

    async asyncLeaveCourse(courseId: string | number) {
      try {
        this.setIsStudent(true);
        await courseApi.deleteStudent(courseId);
        this.setIsStudentChanged(true);
        showSuccessDialog("Berhasil keluar dari kursus");
        await this.asyncSetCourse(courseId);
      } catch (error: any) {
        this.setIsStudentChanged(false);
        showErrorDialog(error.message);
      } finally {
        this.setIsStudent(false);
      }
    },

    async asyncRateCourse(
      courseId: string | number,
      ratings: number,
      comment: string
    ) {
      try {
        this.setIsRating(true);
        await courseApi.putStudentRatings(courseId, ratings, comment);
        this.setIsRatingChanged(true);
        showSuccessDialog("Rating berhasil disimpan");
        await this.asyncSetCourse(courseId);
      } catch (error: any) {
        this.setIsRatingChanged(false);
        showErrorDialog(error.message);
      } finally {
        this.setIsRating(false);
      }
    },

    async asyncAddContent(
      courseId: string | number,
      title: string,
      youtube: string
    ) {
      try {
        this.setIsContentAdd(true);
        await courseApi.postContent(courseId, title, youtube);
        this.setIsContentAdded(true);
        showSuccessDialog("Konten berhasil ditambahkan");
        await this.asyncSetCourse(courseId);
      } catch (error: any) {
        this.setIsContentAdded(false);
        showErrorDialog(error.message);
      } finally {
        this.setIsContentAdd(false);
      }
    },

    async asyncChangeContent(
      contentId: string | number,
      title: string,
      youtube: string,
      courseId: string | number
    ) {
      try {
        this.setIsContentChange(true);
        await courseApi.putContent(contentId, title, youtube);
        this.setIsContentChanged(true);
        showSuccessDialog("Konten berhasil diubah");
        await this.asyncSetCourse(courseId);
      } catch (error: any) {
        this.setIsContentChanged(false);
        showErrorDialog(error.message);
      } finally {
        this.setIsContentChange(false);
      }
    },

    async asyncDeleteContent(contentId: string | number, courseId: string | number) {
      try {
        this.setIsContentDelete(true);
        await courseApi.deleteContent(contentId);
        this.setIsContentDeleted(true);
        showSuccessDialog("Konten berhasil dihapus");
        await this.asyncSetCourse(courseId);
      } catch (error: any) {
        this.setIsContentDeleted(false);
        showErrorDialog(error.message);
      } finally {
        this.setIsContentDelete(false);
      }
    },

    async asyncSetContent(contentId: string | number) {
      try {
        this.setIsContent(true);
        const content = await courseApi.getContentById(contentId);
        this.setContent(content);
      } catch (error: any) {
        showErrorDialog(error.message);
      } finally {
        this.setIsContent(false);
      }
    },

    async asyncSetContentLearn(contentId: string | number, status: 0 | 1) {
      try {
        this.setIsContentLearn(true);
        await courseApi.postContentLearn(contentId, status);
        this.setIsContentLearned(true);
        showSuccessDialog(
          status === 1 ? "Ditandai selesai" : "Ditandai belum selesai"
        );
        const content = await courseApi.getContentById(contentId);
        this.setContent(content);
      } catch (error: any) {
        this.setIsContentLearned(false);
        showErrorDialog(error.message);
      } finally {
        this.setIsContentLearn(false);
      }
    },
  };
}

export const coursesStore = createCoursesStore();
export const useCoursesStore = () => coursesStore;
export default coursesStore;
