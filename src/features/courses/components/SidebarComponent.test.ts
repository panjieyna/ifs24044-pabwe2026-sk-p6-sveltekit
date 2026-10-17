import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/svelte";
import SidebarComponent from "./SidebarComponent.svelte";

describe("SidebarComponent", () => {
  it("should render menus with Semua Kursus as main menu", () => {
    render(SidebarComponent);
    expect(screen.getByText("Semua Kursus")).toBeInTheDocument();
    expect(screen.getByText("Pengguna")).toBeInTheDocument();
    expect(screen.getByText("Profil")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar-link-semua-kursus")).toHaveAttribute("href", "/");
  });

  it("should be hidden on mobile when closed and visible when open", () => {
    const { unmount } = render(SidebarComponent, { props: { isSidebarOpen: false } });
    expect(screen.getByTestId("sidebar").className).toContain("-translate-x-full");
    unmount();
    render(SidebarComponent, { props: { isSidebarOpen: true } });
    expect(screen.getByTestId("sidebar").className).toContain("translate-x-0");
  });

  it.each([
    ["/", "sidebar-link-semua-kursus"],
    ["/courses/1", "sidebar-link-semua-kursus"],
    ["/users", "sidebar-link-pengguna"],
    ["/profile", "sidebar-link-profil"],
  ])("should highlight active menu for %s", (path, testId) => {
    render(SidebarComponent, { props: { currentPath: path } });
    for (const id of [
      "sidebar-link-semua-kursus",
      "sidebar-link-pengguna",
      "sidebar-link-profil",
    ]) {
      const active = screen.getByTestId(id).className.includes("from-violet-600");
      expect(active).toBe(id === testId);
    }
  });

  it("should not highlight any menu for unknown path", () => {
    render(SidebarComponent, { props: { currentPath: "/lainnya" } });
    expect(
      document.querySelectorAll("a.from-violet-600, a[class*='from-violet-600']").length
    ).toBe(0);
  });

  it("should call onClose when a link is clicked, and tolerate missing callback", async () => {
    const onClose = vi.fn();
    const { unmount } = render(SidebarComponent, { props: { onClose } });
    const link = screen.getByTestId("sidebar-link-pengguna");
    link.addEventListener("click", (e) => e.preventDefault());
    await fireEvent.click(link);
    expect(onClose).toHaveBeenCalledTimes(1);
    unmount();

    render(SidebarComponent);
    const link2 = screen.getByTestId("sidebar-link-profil");
    link2.addEventListener("click", (e) => e.preventDefault());
    await fireEvent.click(link2);
    expect(link2).toBeInTheDocument();
  });
});
