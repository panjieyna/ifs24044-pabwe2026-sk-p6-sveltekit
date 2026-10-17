import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import RootLayout from "./routes/+layout.svelte";
import { ssr } from "./routes/+layout";
import RootPage from "./routes/+page.svelte";
import RootError from "./routes/+error.svelte";
import AuthLayoutRoute from "./routes/auth/+layout.svelte";
import LoginPageWrapper from "./routes/auth/login/+page.svelte";
import RegisterPageWrapper from "./routes/auth/register/+page.svelte";
import ProfilePageWrapper from "./routes/profile/+page.svelte";
import UsersPageWrapper from "./routes/users/+page.svelte";
import CourseDetailWrapper from "./routes/courses/[courseId]/+page.svelte";
import ContentWrapper from "./routes/courses/[courseId]/contents/[contentId]/+page.svelte";
import { renderWithProviders } from "./test-utils";
import { updateMockPage } from "./setupTests";
import apiHelper from "./helpers/apiHelper";
import { coursesStore } from "./features/courses/states/coursesStore";
import { usersStore } from "./features/users/states/usersStore";

const children = createRawSnippet(() => ({
  render: () => '<div data-testid="route-child">Anak</div>',
}));
const profile = { id: 1, name: "Logged User", email: "user@del.org" };

describe("SvelteKit Routes and Layouts", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    vi.spyOn(coursesStore, "asyncSetCourses").mockResolvedValue();
    vi.spyOn(coursesStore, "asyncSetCourse").mockResolvedValue();
    vi.spyOn(coursesStore, "asyncSetContent").mockResolvedValue();
    vi.spyOn(usersStore, "asyncSetUsers").mockResolvedValue();
    updateMockPage({
      url: new URL("http://localhost/"),
      params: {},
      route: { id: "/" },
      status: 200,
      error: null,
      data: {},
      form: null,
    });
  });

  it("should disable SSR in +layout.ts", () => {
    expect(ssr).toBe(false);
  });

  it("should wrap non-auth routes with CourseLayout", () => {
    renderWithProviders(RootLayout, { props: { children }, preloadedState: { profile } });
    expect(screen.getAllByText("Delcom Courses").length).toBeGreaterThan(0);
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("route-child")).toBeInTheDocument();
  });

  it("should render /auth routes without the course layout", () => {
    renderWithProviders(RootLayout, {
      props: { children },
      route: "/auth/login",
      preloadedState: { profile },
    });
    expect(screen.queryByTestId("sidebar")).toBeNull();
    expect(screen.getByTestId("route-child")).toBeInTheDocument();
  });

  it("should render RootLayout without children", () => {
    const { unmount } = renderWithProviders(RootLayout, { preloadedState: { profile } });
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    unmount();
    renderWithProviders(RootLayout, { route: "/auth/login" });
    expect(screen.queryByTestId("route-child")).toBeNull();
  });

  it("should switch layout when navigating between auth and non-auth routes", async () => {
    renderWithProviders(RootLayout, { props: { children }, preloadedState: { profile } });
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();

    updateMockPage({ url: new URL("http://localhost:3000/auth/login") });
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.queryByTestId("sidebar")).toBeNull();

    updateMockPage({ url: new URL("http://localhost:3000/") });
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
  });

  it("should render the home route (+page.svelte) as course list", () => {
    renderWithProviders(RootPage, { preloadedState: { profile, courses: [] } });
    expect(screen.getByText("Semua Kursus")).toBeInTheDocument();
  });

  it("should render +error.svelte as not found page", () => {
    renderWithProviders(RootError);
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Halaman Tidak Ditemukan")).toBeInTheDocument();
  });

  it("should render auth layout route with and without children", () => {
    const { unmount } = renderWithProviders(AuthLayoutRoute, {
      props: { children },
      route: "/auth/login",
    });
    expect(screen.getAllByText("Delcom Courses").length).toBeGreaterThan(0);
    expect(screen.getByTestId("route-child")).toBeInTheDocument();
    unmount();
    renderWithProviders(AuthLayoutRoute, { route: "/auth/login" });
    expect(screen.queryByTestId("route-child")).toBeNull();
  });

  it("should render login route with required selectors", () => {
    renderWithProviders(LoginPageWrapper);
    expect(screen.getByText("Masuk Sekarang")).toBeInTheDocument();
    expect(document.querySelector("#login-email-input")).toBeInTheDocument();
    expect(document.querySelector("#login-password-input")).toBeInTheDocument();
    expect(document.querySelector("#login-submit-button")).toBeInTheDocument();
  });

  it("should render register route", () => {
    renderWithProviders(RegisterPageWrapper);
    expect(screen.getByText("Daftar Sekarang")).toBeInTheDocument();
  });

  it("should render profile route", () => {
    renderWithProviders(ProfilePageWrapper, { preloadedState: { profile } });
    expect(screen.getByText("Profil Akun")).toBeInTheDocument();
  });

  it("should render users route", () => {
    renderWithProviders(UsersPageWrapper, {
      preloadedState: { users: [{ id: 1, name: "User Satu", email: "satu@del.org" }] },
    });
    expect(screen.getByText("Semua Pengguna")).toBeInTheDocument();
  });

  it("should render course detail route reading params.courseId", () => {
    renderWithProviders(CourseDetailWrapper, {
      preloadedState: {
        profile,
        course: { id: 5, user_id: 2, title: "Detail Test", description: "Desc" },
      },
    });
    updateMockPage({ params: { courseId: "5" } });
    expect(screen.getByText("Detail Test")).toBeInTheDocument();
  });

  it("should render content route reading params", () => {
    renderWithProviders(ContentWrapper, {
      preloadedState: {
        profile,
        content: { id: 9, course_id: 5, title: "Materi Uji", youtube: "https://youtu.be/abcdefghijk" },
      },
    });
    updateMockPage({ params: { courseId: "5", contentId: "9" } });
    expect(screen.getByText("Materi Uji")).toBeInTheDocument();
  });
});
