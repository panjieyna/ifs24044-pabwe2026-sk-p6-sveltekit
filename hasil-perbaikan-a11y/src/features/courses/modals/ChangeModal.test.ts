import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, screen, waitFor } from "@testing-library/svelte";
import ChangeModal from "./ChangeModal.svelte";
import { coursesStore } from "../states/coursesStore";

const course: any = { id: 3, user_id: 1, title: "Judul Lama", description: "Desk Lama" };
const form = () => screen.getByTestId("change-title-input").closest("form")!;

describe("ChangeModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    coursesStore.reset();
  });

  it("should prefill values from course", () => {
    render(ChangeModal, { props: { course } });
    expect((screen.getByTestId("change-title-input") as HTMLInputElement).value).toBe("Judul Lama");
    expect((screen.getByTestId("change-desc-input") as HTMLTextAreaElement).value).toBe("Desk Lama");
  });

  it("should prefill empty strings when course fields are empty", () => {
    render(ChangeModal, { props: { course: { id: 1, user_id: 1, title: "", description: "" } } });
    expect((screen.getByTestId("change-title-input") as HTMLInputElement).value).toBe("");
    expect((screen.getByTestId("change-desc-input") as HTMLTextAreaElement).value).toBe("");
  });

  it("should not submit when title is blank", async () => {
    const spy = vi.spyOn(coursesStore, "asyncChangeCourse").mockResolvedValue();
    render(ChangeModal, { props: { course } });
    await fireEvent.input(screen.getByTestId("change-title-input"), { target: { value: " " } });
    await fireEvent.submit(form());
    expect(spy).not.toHaveBeenCalled();
  });

  it("should submit and close on success", async () => {
    const onClose = vi.fn();
    const spy = vi.spyOn(coursesStore, "asyncChangeCourse").mockImplementation(async () => {
      coursesStore.setIsCourseChanged(true);
    });
    render(ChangeModal, { props: { course, onClose } });
    await fireEvent.input(screen.getByTestId("change-title-input"), { target: { value: " Baru " } });
    await fireEvent.input(screen.getByTestId("change-desc-input"), { target: { value: " Desk Baru " } });
    await fireEvent.submit(form());
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(spy).toHaveBeenCalledWith(3, "Baru", "Desk Baru");
    expect(coursesStore.isCourseChanged).toBe(false);
  });

  it("should succeed without onClose callback", async () => {
    vi.spyOn(coursesStore, "asyncChangeCourse").mockImplementation(async () => {
      coursesStore.setIsCourseChanged(true);
    });
    render(ChangeModal, { props: { course } });
    await fireEvent.submit(form());
    await waitFor(() => expect(coursesStore.isCourseChanged).toBe(false));
  });

  it("should stay open on failure", async () => {
    const onClose = vi.fn();
    const spy = vi.spyOn(coursesStore, "asyncChangeCourse").mockResolvedValue();
    render(ChangeModal, { props: { course, onClose } });
    await fireEvent.submit(form());
    await waitFor(() => expect(spy).toHaveBeenCalled());
    expect(onClose).not.toHaveBeenCalled();
  });

  it("should close via X and Batal, with and without callback", async () => {
    const onClose = vi.fn();
    const { unmount } = render(ChangeModal, { props: { course, onClose } });
    const [xBtn] = screen.getAllByRole("button");
    await fireEvent.click(xBtn);
    await fireEvent.click(screen.getByText("Batal"));
    expect(onClose).toHaveBeenCalledTimes(2);
    unmount();

    render(ChangeModal, { props: { course } });
    await fireEvent.click(screen.getAllByRole("button")[0]);
    await fireEvent.click(screen.getByText("Batal"));
    expect(screen.getByTestId("change-modal")).toBeInTheDocument();
  });

  it("should disable submit while loading", () => {
    coursesStore.setIsCourseChange(true);
    render(ChangeModal, { props: { course } });
    expect(screen.getByTestId("change-submit-btn")).toBeDisabled();
  });
});
