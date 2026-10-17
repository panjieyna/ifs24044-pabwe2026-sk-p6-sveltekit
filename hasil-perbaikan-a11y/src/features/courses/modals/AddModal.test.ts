import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, screen, waitFor } from "@testing-library/svelte";
import AddModal from "./AddModal.svelte";
import { coursesStore } from "../states/coursesStore";

async function fill(title: string, desc = "") {
  await fireEvent.input(screen.getByTestId("add-title-input"), { target: { value: title } });
  await fireEvent.input(screen.getByTestId("add-desc-input"), { target: { value: desc } });
}

describe("AddModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    coursesStore.reset();
  });

  it("should render the form", () => {
    render(AddModal);
    expect(screen.getByText("Tambah Kursus")).toBeInTheDocument();
    expect(screen.getByTestId("add-title-input")).toBeInTheDocument();
  });

  it("should not submit when title is blank", async () => {
    const spy = vi.spyOn(coursesStore, "asyncAddCourse").mockResolvedValue();
    render(AddModal);
    await fill("   ");
    await fireEvent.submit(screen.getByTestId("add-title-input").closest("form")!);
    expect(spy).not.toHaveBeenCalled();
  });

  it("should submit trimmed values and close on success", async () => {
    const onClose = vi.fn();
    const spy = vi.spyOn(coursesStore, "asyncAddCourse").mockImplementation(async () => {
      coursesStore.setIsCourseAdded(true);
    });
    render(AddModal, { props: { onClose } });
    await fill("  Judul  ", "  Deskripsi ");
    await fireEvent.submit(screen.getByTestId("add-title-input").closest("form")!);
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(spy).toHaveBeenCalledWith("Judul", "Deskripsi");
    expect(coursesStore.isCourseAdded).toBe(false);
  });

  it("should succeed without onClose callback", async () => {
    vi.spyOn(coursesStore, "asyncAddCourse").mockImplementation(async () => {
      coursesStore.setIsCourseAdded(true);
    });
    render(AddModal);
    await fill("Judul");
    await fireEvent.submit(screen.getByTestId("add-title-input").closest("form")!);
    await waitFor(() => expect(coursesStore.isCourseAdded).toBe(false));
  });

  it("should stay open when adding fails", async () => {
    const onClose = vi.fn();
    const spy = vi.spyOn(coursesStore, "asyncAddCourse").mockResolvedValue();
    render(AddModal, { props: { onClose } });
    await fill("Judul");
    await fireEvent.submit(screen.getByTestId("add-title-input").closest("form")!);
    await waitFor(() => expect(spy).toHaveBeenCalled());
    expect(onClose).not.toHaveBeenCalled();
  });

  it("should close via X and Batal buttons, with and without callback", async () => {
    const onClose = vi.fn();
    const { unmount } = render(AddModal, { props: { onClose } });
    await fireEvent.click(screen.getByTestId("add-modal-close"));
    await fireEvent.click(screen.getByText("Batal"));
    expect(onClose).toHaveBeenCalledTimes(2);
    unmount();

    render(AddModal);
    await fireEvent.click(screen.getByTestId("add-modal-close"));
    await fireEvent.click(screen.getByText("Batal"));
    expect(screen.getByTestId("add-modal")).toBeInTheDocument();
  });

  it("should disable submit while loading", () => {
    coursesStore.setIsCourseAdd(true);
    render(AddModal);
    expect(screen.getByTestId("add-submit-btn")).toBeDisabled();
  });
});
