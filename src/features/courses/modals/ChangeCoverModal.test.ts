import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, screen, waitFor } from "@testing-library/svelte";
import ChangeCoverModal from "./ChangeCoverModal.svelte";
import { coursesStore } from "../states/coursesStore";

const course: any = { id: 4, user_id: 1, title: "T", description: "D", cover: null };
const form = () => screen.getByTestId("cover-file-input").closest("form")!;

async function pick(file: File | null) {
  const input = screen.getByTestId("cover-file-input") as HTMLInputElement;
  Object.defineProperty(input, "files", {
    value: file ? [file] : [],
    configurable: true,
  });
  await fireEvent.change(input);
}

describe("ChangeCoverModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    coursesStore.reset();
    (URL as any).createObjectURL = vi.fn(() => "blob:preview");
  });

  it("should show placeholder icon when no cover and no preview", () => {
    render(ChangeCoverModal, { props: { course } });
    expect(document.querySelector("img")).toBeNull();
    expect(screen.getByTestId("cover-submit-btn")).toBeDisabled();
  });

  it("should show the current cover when available", () => {
    render(ChangeCoverModal, { props: { course: { ...course, cover: "/lama.png" } } });
    expect(document.querySelector("img")!.getAttribute("src")).toBe("/lama.png");
  });

  it("should show preview after choosing a file", async () => {
    render(ChangeCoverModal, { props: { course: { ...course, cover: "/lama.png" } } });
    await pick(new File(["x"], "baru.png", { type: "image/png" }));
    expect(document.querySelector("img")!.getAttribute("src")).toBe("blob:preview");
    expect(screen.getByTestId("cover-submit-btn")).not.toBeDisabled();
  });

  it("should ignore change event without a file", async () => {
    render(ChangeCoverModal, { props: { course } });
    await pick(null);
    expect(document.querySelector("img")).toBeNull();
  });

  it("should not submit without a file", async () => {
    const spy = vi.spyOn(coursesStore, "asyncChangeCover").mockResolvedValue();
    render(ChangeCoverModal, { props: { course } });
    await fireEvent.submit(form());
    expect(spy).not.toHaveBeenCalled();
  });

  it("should upload and close on success", async () => {
    const onClose = vi.fn();
    const spy = vi.spyOn(coursesStore, "asyncChangeCover").mockImplementation(async () => {
      coursesStore.setIsCourseChangedCover(true);
    });
    render(ChangeCoverModal, { props: { course, onClose } });
    const file = new File(["x"], "baru.png", { type: "image/png" });
    await pick(file);
    await fireEvent.submit(form());
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(spy).toHaveBeenCalledWith(4, file);
    expect(coursesStore.isCourseChangedCover).toBe(false);
  });

  it("should succeed without onClose callback", async () => {
    vi.spyOn(coursesStore, "asyncChangeCover").mockImplementation(async () => {
      coursesStore.setIsCourseChangedCover(true);
    });
    render(ChangeCoverModal, { props: { course } });
    await pick(new File(["x"], "baru.png"));
    await fireEvent.submit(form());
    await waitFor(() => expect(coursesStore.isCourseChangedCover).toBe(false));
  });

  it("should stay open on failure", async () => {
    const onClose = vi.fn();
    const spy = vi.spyOn(coursesStore, "asyncChangeCover").mockResolvedValue();
    render(ChangeCoverModal, { props: { course, onClose } });
    await pick(new File(["x"], "baru.png"));
    await fireEvent.submit(form());
    await waitFor(() => expect(spy).toHaveBeenCalled());
    expect(onClose).not.toHaveBeenCalled();
  });

  it("should close via X and Batal, with and without callback", async () => {
    const onClose = vi.fn();
    const { unmount } = render(ChangeCoverModal, { props: { course, onClose } });
    await fireEvent.click(screen.getAllByRole("button")[0]);
    await fireEvent.click(screen.getByText("Batal"));
    expect(onClose).toHaveBeenCalledTimes(2);
    unmount();

    render(ChangeCoverModal, { props: { course } });
    await fireEvent.click(screen.getAllByRole("button")[0]);
    await fireEvent.click(screen.getByText("Batal"));
    expect(screen.getByTestId("change-cover-modal")).toBeInTheDocument();
  });

  it("should disable submit while loading", async () => {
    coursesStore.setIsCourseChangeCover(true);
    render(ChangeCoverModal, { props: { course } });
    await pick(new File(["x"], "baru.png"));
    expect(screen.getByTestId("cover-submit-btn")).toBeDisabled();
  });
});
