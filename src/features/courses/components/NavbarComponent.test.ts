import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, screen } from "@testing-library/svelte";
import NavbarComponent from "./NavbarComponent.svelte";
import { mockGoto } from "../../../setupTests";

const q = (id: string) => screen.queryByTestId(id);

describe("NavbarComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render brand and default user name without profile", () => {
    render(NavbarComponent);
    expect(screen.getAllByText("Delcom Courses").length).toBeGreaterThan(0);
    expect(screen.getByText("Pengguna")).toBeInTheDocument();
    expect(document.querySelector("img")).toBeNull();
  });

  it("should render profile photo and name", () => {
    render(NavbarComponent, {
      props: { profile: { id: 1, name: "Budi", email: "b@d.id", photo: "/b.png" } },
    });
    const img = document.querySelector("img")!;
    expect(img.getAttribute("src")).toBe("/b.png");
    expect(img.getAttribute("alt")).toBe("Budi");
    expect(screen.getByText("Budi")).toBeInTheDocument();
  });

  it("should fall back to generic alt when photo exists without name", () => {
    render(NavbarComponent, {
      props: { profile: { id: 1, name: "", email: "b@d.id", photo: "/b.png" } },
    });
    expect(document.querySelector("img")!.getAttribute("alt")).toBe("User");
    expect(screen.getByText("Pengguna")).toBeInTheDocument();
  });

  it("should call onToggleSidebar and handle a missing callback", async () => {
    const onToggleSidebar = vi.fn();
    const { unmount } = render(NavbarComponent, { props: { onToggleSidebar } });
    await fireEvent.click(q("toggle-sidebar-btn")!);
    expect(onToggleSidebar).toHaveBeenCalledTimes(1);
    unmount();

    render(NavbarComponent);
    await fireEvent.click(q("toggle-sidebar-btn")!);
    expect(q("toggle-sidebar-btn")).toBeInTheDocument();
  });

  it("should render the correct toggle icon for sidebar state", () => {
    const { unmount } = render(NavbarComponent, { props: { isSidebarOpen: true } });
    expect(q("toggle-sidebar-btn")).toBeInTheDocument();
    unmount();
    render(NavbarComponent, { props: { isSidebarOpen: false } });
    expect(q("toggle-sidebar-btn")).toBeInTheDocument();
  });

  it("should open and close dropdown with the toggle button", async () => {
    render(NavbarComponent);
    expect(q("profile-dropdown-menu")).toBeNull();
    await fireEvent.click(q("profile-dropdown-button")!);
    expect(q("profile-dropdown-menu")).toBeInTheDocument();
    await fireEvent.click(q("profile-dropdown-button")!);
    expect(q("profile-dropdown-menu")).toBeNull();
  });

  it("should close dropdown on outside click but not inside click", async () => {
    render(NavbarComponent);
    await fireEvent.click(q("profile-dropdown-button")!);

    await fireEvent.mouseDown(q("profile-dropdown-menu")!);
    expect(q("profile-dropdown-menu")).toBeInTheDocument();

    await fireEvent.mouseDown(document.body);
    expect(q("profile-dropdown-menu")).toBeNull();
  });

  it("should remove the document listener on destroy", () => {
    const spy = vi.spyOn(document, "removeEventListener");
    const { unmount } = render(NavbarComponent);
    unmount();
    expect(spy).toHaveBeenCalledWith("mousedown", expect.any(Function));
  });

  it("should navigate to profile from dropdown", async () => {
    render(NavbarComponent);
    await fireEvent.click(q("profile-dropdown-button")!);
    await fireEvent.click(q("profile-menu-item")!);
    expect(mockGoto).toHaveBeenCalledWith("/profile");
    expect(q("profile-dropdown-menu")).toBeNull();
  });

  it("should call onLogout from dropdown", async () => {
    const onLogout = vi.fn();
    render(NavbarComponent, { props: { onLogout } });
    await fireEvent.click(q("profile-dropdown-button")!);
    await fireEvent.click(q("logout-menu-item")!);
    expect(onLogout).toHaveBeenCalledTimes(1);
    expect(q("profile-dropdown-menu")).toBeNull();
  });

  it("should close dropdown on logout without callback", async () => {
    render(NavbarComponent);
    await fireEvent.click(q("profile-dropdown-button")!);
    await fireEvent.click(q("logout-menu-item")!);
    expect(q("profile-dropdown-menu")).toBeNull();
  });
});
