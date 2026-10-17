import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import CourseLayout from "./CourseLayout.svelte";
import { renderWithProviders } from "../../../test-utils";
import apiHelper from "../../../helpers/apiHelper";
import { authStore } from "../../auth/states/authStore";
import { usersStore } from "../../users/states/usersStore";
import { mockGoto } from "../../../setupTests";

const children = createRawSnippet(() => ({
  render: () => '<div data-testid="child">Konten</div>',
}));

describe("CourseLayout", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("should redirect to login when there is no token", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);
    const profileSpy = vi.spyOn(usersStore, "asyncSetProfile").mockResolvedValue();
    renderWithProviders(CourseLayout, { props: { children } });
    await waitFor(() => expect(mockGoto).toHaveBeenCalledWith("/auth/login"));
    expect(profileSpy).not.toHaveBeenCalled();
  });

  it("should load profile when token exists but profile is empty", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("token");
    const profileSpy = vi.spyOn(usersStore, "asyncSetProfile").mockResolvedValue();
    renderWithProviders(CourseLayout, { props: { children } });
    await waitFor(() => expect(profileSpy).toHaveBeenCalled());
    expect(mockGoto).not.toHaveBeenCalled();
  });

  it("should not reload profile when it already exists", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("token");
    const profileSpy = vi.spyOn(usersStore, "asyncSetProfile").mockResolvedValue();
    renderWithProviders(CourseLayout, {
      props: { children },
      preloadedState: { profile: { id: 1, name: "Budi", email: "b@d.id" } },
    });
    await new Promise((r) => setTimeout(r, 0));
    expect(profileSpy).not.toHaveBeenCalled();
    expect(screen.getByText("Budi")).toBeInTheDocument();
  });

  it("should render children and sidebar/navbar", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("token");
    renderWithProviders(CourseLayout, {
      props: { children },
      preloadedState: { profile: { id: 1, name: "Budi", email: "b@d.id" } },
      route: "/users",
    });
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByText("Semua Kursus")).toBeInTheDocument();
  });

  it("should render without children", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("token");
    renderWithProviders(CourseLayout, {
      preloadedState: { profile: { id: 1, name: "Budi", email: "b@d.id" } },
    });
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
  });

  it("should toggle sidebar overlay and close it from overlay and links", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("token");
    renderWithProviders(CourseLayout, {
      props: { children },
      preloadedState: { profile: { id: 1, name: "Budi", email: "b@d.id" } },
    });
    expect(screen.queryByLabelText("Tutup sidebar")).toBeNull();

    await fireEvent.click(screen.getByTestId("toggle-sidebar-btn"));
    const overlay = screen.getByLabelText("Tutup sidebar");
    await fireEvent.click(overlay);
    expect(screen.queryByLabelText("Tutup sidebar")).toBeNull();

    await fireEvent.click(screen.getByTestId("toggle-sidebar-btn"));
    expect(screen.getByLabelText("Tutup sidebar")).toBeInTheDocument();
    const link = screen.getByTestId("sidebar-link-pengguna");
    link.addEventListener("click", (e) => e.preventDefault());
    await fireEvent.click(link);
    expect(screen.queryByLabelText("Tutup sidebar")).toBeNull();
  });

  it("should logout, reset users store and go to login", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("token");
    const logoutSpy = vi.spyOn(authStore, "asyncSetIsAuthLogout").mockResolvedValue();
    const resetSpy = vi.spyOn(usersStore, "reset");
    renderWithProviders(CourseLayout, {
      props: { children },
      preloadedState: { profile: { id: 1, name: "Budi", email: "b@d.id" } },
    });
    await fireEvent.click(screen.getByTestId("profile-dropdown-button"));
    await fireEvent.click(screen.getByTestId("logout-menu-item"));
    await waitFor(() => expect(mockGoto).toHaveBeenCalledWith("/auth/login"));
    expect(logoutSpy).toHaveBeenCalled();
    expect(resetSpy).toHaveBeenCalled();
  });
});
