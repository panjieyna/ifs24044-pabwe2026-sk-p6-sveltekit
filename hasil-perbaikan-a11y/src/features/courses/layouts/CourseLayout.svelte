<script lang="ts">
  import type { Snippet } from "svelte";
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import NavbarComponent from "../components/NavbarComponent.svelte";
  import SidebarComponent from "../components/SidebarComponent.svelte";
  import { usersStore } from "../../users/states/usersStore";
  import { authStore } from "../../auth/states/authStore";
  import { goto } from "$app/navigation";
  import apiHelper from "../../../helpers/apiHelper";

  let { children }: { children?: Snippet } = $props();
  let isSidebarOpen = $state(false);
  let profile = $derived($usersStore.profile);

  onMount(async () => {
    const token = apiHelper.getAccessToken();
    if (!token) {
      goto("/auth/login");
      return;
    }
    if (!$usersStore.profile) {
      await usersStore.asyncSetProfile();
    }
  });

  async function handleLogout() {
    await authStore.asyncSetIsAuthLogout();
    usersStore.reset();
    goto("/auth/login");
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
  <NavbarComponent
    {profile}
    {isSidebarOpen}
    onToggleSidebar={() => (isSidebarOpen = !isSidebarOpen)}
    onLogout={handleLogout}
  />
  <div class="flex pt-16">
    <SidebarComponent
      {isSidebarOpen}
      currentPath={page.url.pathname}
      onClose={() => (isSidebarOpen = false)}
    />
    <main class="flex-1 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 md:ml-64 transition-all">
      {@render children?.()}
      {#if isSidebarOpen}
        <button
          type="button"
          class="fixed inset-0 z-20 bg-slate-900/40 md:hidden"
          aria-label="Tutup sidebar"
          onclick={() => (isSidebarOpen = false)}
        ></button>
      {/if}
    </main>
  </div>
</div>
