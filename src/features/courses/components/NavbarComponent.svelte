<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { goto } from "$app/navigation";
  import { GraduationCap, User, LogOut, ChevronDown, Menu, X } from "lucide-svelte";
  import type { User as UserType } from "../../users/api/userApi";

  interface Props {
    profile?: UserType | null;
    isSidebarOpen?: boolean;
    onToggleSidebar?: () => void;
    onLogout?: () => void;
  }

  let {
    profile = null,
    isSidebarOpen = false,
    onToggleSidebar,
    onLogout,
  }: Props = $props();

  let dropdownOpen = $state(false);
  let dropdownRef: HTMLElement | undefined = $state();

  function handleClickOutside(event: MouseEvent) {
    if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
      dropdownOpen = false;
    }
  }

  onMount(() => {
    document.addEventListener("mousedown", handleClickOutside);
  });

  onDestroy(() => {
    document.removeEventListener("mousedown", handleClickOutside);
  });

  function handleProfileClick() {
    dropdownOpen = false;
    goto("/profile");
  }

  function handleLogoutClick() {
    dropdownOpen = false;
    if (onLogout) onLogout();
  }
</script>

<header class="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-violet-100 shadow-sm">
  <div class="w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
    <div class="flex items-center gap-3">
      <button
        type="button"
        data-testid="toggle-sidebar-btn"
        onclick={() => onToggleSidebar?.()}
        class="md:hidden p-2 rounded-xl text-violet-700 hover:bg-violet-100 transition-colors"
        aria-label="Toggle Navigation"
      >
        {#if isSidebarOpen}
          <X size={20} />
        {:else}
          <Menu size={20} />
        {/if}
      </button>

      <a href="/" class="flex items-center gap-3 group">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform">
          <GraduationCap size={22} strokeWidth={2.5} />
        </div>
        <div class="hidden sm:block">
          <span class="text-lg font-bold bg-gradient-to-r from-violet-700 to-fuchsia-600 bg-clip-text text-transparent">
            Delcom Courses
          </span>
          <p class="text-[10px] uppercase tracking-widest text-violet-400 font-semibold -mt-0.5">
            Belajar. Tumbuh. Lulus.
          </p>
        </div>
      </a>
    </div>

    <div class="relative" bind:this={dropdownRef}>
      <button
        type="button"
        data-testid="profile-dropdown-button"
        onclick={() => (dropdownOpen = !dropdownOpen)}
        class="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-violet-50 transition-colors border border-transparent hover:border-violet-100"
      >
        {#if profile?.photo}
          <img
            src={profile.photo}
            alt={profile.name || "User"}
            class="w-8 h-8 rounded-full object-cover ring-2 ring-violet-200"
          />
        {:else}
          <div class="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
            <User size={16} />
          </div>
        {/if}
        <span class="hidden sm:inline text-sm font-medium text-slate-700 max-w-[120px] truncate">
          {profile?.name || "Pengguna"}
        </span>
        <ChevronDown size={16} class="text-slate-400" />
      </button>

      {#if dropdownOpen}
        <div
          class="absolute right-0 mt-2 w-48 rounded-2xl bg-white shadow-xl border border-violet-100 py-1 z-50 overflow-hidden"
          data-testid="profile-dropdown-menu"
        >
          <button
            type="button"
            data-testid="profile-menu-item"
            onclick={handleProfileClick}
            class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-violet-50 transition-colors"
          >
            <User size={16} class="text-violet-500" />
            Profil Saya
          </button>
          <button
            type="button"
            data-testid="logout-menu-item"
            onclick={handleLogoutClick}
            class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      {/if}
    </div>
  </div>
</header>
