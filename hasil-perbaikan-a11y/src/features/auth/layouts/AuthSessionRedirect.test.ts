import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/svelte";
import AuthSessionRedirect from "./AuthSessionRedirect.svelte";
import { renderWithProviders } from "../../../test-utils";
import { usersStore } from "../../users/states/usersStore";
import { mockGoto } from "../../../setupTests";

describe("AuthSessionRedirect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should do nothing while isProfile is false", () => {
    renderWithProviders(AuthSessionRedirect);
    expect(mockGoto).not.toHaveBeenCalled();
  });

  it("should reset flag and go to home when profile is available", async () => {
    renderWithProviders(AuthSessionRedirect, {
      preloadedState: { profile: { id: 1, name: "Budi", email: "b@d.id" } },
    });
    usersStore.setIsProfile(true);
    await waitFor(() => expect(mockGoto).toHaveBeenCalledWith("/"));
    expect(usersStore.isProfile).toBe(false);
  });

  it("should reset flag without redirect when profile is null", async () => {
    renderWithProviders(AuthSessionRedirect);
    usersStore.setIsProfile(true);
    await waitFor(() => expect(usersStore.isProfile).toBe(false));
    expect(mockGoto).not.toHaveBeenCalled();
  });
});
