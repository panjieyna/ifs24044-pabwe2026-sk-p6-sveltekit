import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, screen, waitFor } from "@testing-library/svelte";
import ContentModal from "./ContentModal.svelte";
import { coursesStore } from "../states/coursesStore";

const content: any = { id: 9, course_id: 2, title: "Bab 1", youtube: "https://youtu.be/abcdefghijk" };
const form = () => screen.getByTestId("content-title-input").closest("form")!;

async function fill(title: string, youtube: string) {
  await fireEvent.input(screen.getByTestId("content-title-input"), { target: { value: title } });
  await fireEvent.input(screen.getByTestId("content-youtube-input"), { target: { value: youtube } });
}

describe("ContentModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    coursesStore.reset();
  });

  it("should render add mode with empty fields", () => {
    render(ContentModal, { props: { courseId: 2 } });
    expect(screen.getByText("Tambah Konten")).toBeInTheDocument();
    expect((screen.getByTestId("content-title-input") as HTMLInputElement).value).toBe("");
  });

  it("should render edit mode with prefilled fields", () => {
    render(ContentModal, { props: { courseId: 2, content } });
    expect(screen.getByText("Ubah Konten")).toBeInTheDocument();
    expect((screen.getByTestId("content-title-input") as HTMLInputElement).value).toBe("Bab 1");
    expect((screen.getByTestId("content-youtube-input") as HTMLInputElement).value).toBe(content.youtube);
  });

  it("should prefill empty strings for content with empty fields", () => {
    render(ContentModal, {
      props: { courseId: 2, content: { id: 1, course_id: 2, title: "", youtube: "" } },
    });
    expect((screen.getByTestId("content-title-input") as HTMLInputElement).value).toBe("");
    expect((screen.getByTestId("content-youtube-input") as HTMLInputElement).value).toBe("");
  });

  it("should not submit when title or youtube is blank", async () => {
    const add = vi.spyOn(coursesStore, "asyncAddContent").mockResolvedValue();
    render(ContentModal, { props: { courseId: 2 } });
    await fill(" ", "https://youtu.be/x");
    await fireEvent.submit(form());
    await fill("Judul", " ");
    await fireEvent.submit(form());
    expect(add).not.toHaveBeenCalled();
  });

  it("should add content and close on success", async () => {
    const onClose = vi.fn();
    const spy = vi.spyOn(coursesStore, "asyncAddContent").mockImplementation(async () => {
      coursesStore.setIsContentAdded(true);
    });
    render(ContentModal, { props: { courseId: 2, onClose } });
    await fill(" Judul ", " https://youtu.be/x ");
    await fireEvent.submit(form());
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(spy).toHaveBeenCalledWith(2, "Judul", "https://youtu.be/x");
    expect(coursesStore.isContentAdded).toBe(false);
  });

  it("should add content successfully without onClose", async () => {
    vi.spyOn(coursesStore, "asyncAddContent").mockImplementation(async () => {
      coursesStore.setIsContentAdded(true);
    });
    render(ContentModal, { props: { courseId: 2 } });
    await fill("Judul", "https://youtu.be/x");
    await fireEvent.submit(form());
    await waitFor(() => expect(coursesStore.isContentAdded).toBe(false));
  });

  it("should stay open when adding fails", async () => {
    const onClose = vi.fn();
    const spy = vi.spyOn(coursesStore, "asyncAddContent").mockResolvedValue();
    render(ContentModal, { props: { courseId: 2, onClose } });
    await fill("Judul", "https://youtu.be/x");
    await fireEvent.submit(form());
    await waitFor(() => expect(spy).toHaveBeenCalled());
    expect(onClose).not.toHaveBeenCalled();
  });

  it("should change content and close on success", async () => {
    const onClose = vi.fn();
    const spy = vi.spyOn(coursesStore, "asyncChangeContent").mockImplementation(async () => {
      coursesStore.setIsContentChanged(true);
    });
    render(ContentModal, { props: { courseId: 2, content, onClose } });
    await fill("Bab 1 Baru", "https://youtu.be/zzzzzzzzzzz");
    await fireEvent.submit(form());
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(spy).toHaveBeenCalledWith(9, "Bab 1 Baru", "https://youtu.be/zzzzzzzzzzz", 2);
    expect(coursesStore.isContentChanged).toBe(false);
  });

  it("should change content successfully without onClose", async () => {
    vi.spyOn(coursesStore, "asyncChangeContent").mockImplementation(async () => {
      coursesStore.setIsContentChanged(true);
    });
    render(ContentModal, { props: { courseId: 2, content } });
    await fireEvent.submit(form());
    await waitFor(() => expect(coursesStore.isContentChanged).toBe(false));
  });

  it("should stay open when changing fails", async () => {
    const onClose = vi.fn();
    const spy = vi.spyOn(coursesStore, "asyncChangeContent").mockResolvedValue();
    render(ContentModal, { props: { courseId: 2, content, onClose } });
    await fireEvent.submit(form());
    await waitFor(() => expect(spy).toHaveBeenCalled());
    expect(onClose).not.toHaveBeenCalled();
  });

  it("should close via X and Batal, with and without callback", async () => {
    const onClose = vi.fn();
    const { unmount } = render(ContentModal, { props: { courseId: 2, onClose } });
    await fireEvent.click(screen.getAllByRole("button")[0]);
    await fireEvent.click(screen.getByText("Batal"));
    expect(onClose).toHaveBeenCalledTimes(2);
    unmount();

    render(ContentModal, { props: { courseId: 2 } });
    await fireEvent.click(screen.getAllByRole("button")[0]);
    await fireEvent.click(screen.getByText("Batal"));
    expect(screen.getByTestId("content-modal")).toBeInTheDocument();
  });

  it("should disable submit while adding or changing", () => {
    coursesStore.setIsContentAdd(true);
    const { unmount } = render(ContentModal, { props: { courseId: 2 } });
    expect(screen.getByTestId("content-submit-btn")).toBeDisabled();
    unmount();
    coursesStore.reset({ isContentChange: true });
    render(ContentModal, { props: { courseId: 2, content } });
    expect(screen.getByTestId("content-submit-btn")).toBeDisabled();
  });
});
