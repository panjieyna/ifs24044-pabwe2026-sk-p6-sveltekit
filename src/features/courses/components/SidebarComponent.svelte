<script lang="ts">
  import { BookOpen, Users, UserCircle } from "lucide-svelte";

  interface Props {
    isSidebarOpen?: boolean;
    currentPath?: string;
    onClose?: () => void;
  }

  let {
    isSidebarOpen = false,
    currentPath = "/",
    onClose,
  }: Props = $props();

  const menus = [
    { href: "/", label: "Semua Kursus", icon: BookOpen, match: (p: string) => p === "/" || p.startsWith("/courses") },
    { href: "/users", label: "Pengguna", icon: Users, match: (p: string) => p.startsWith("/users") },
    { href: "/profile", label: "Profil", icon: UserCircle, match: (p: string) => p.startsWith("/profile") },
  ];
</script>

<aside
  class="fixed top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 bg-white/95 backdrop-blur border-r border-violet-100 transition-transform duration-200
    {isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0"
  data-testid="sidebar"
>
  <nav class="p-4 space-y-1">
    <p class="px-3 mb-3 text-[11px] font-bold uppercase tracking-wider text-violet-400">
      Menu Utama
    </p>
    {#each menus as menu}
      {@const active = menu.match(currentPath)}
      <a
        href={menu.href}
        onclick={() => onClose?.()}
        data-testid={`sidebar-link-${menu.label.toLowerCase().replace(/\s+/g, "-")}`}
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
          {active
            ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-md shadow-violet-500/20'
            : 'text-slate-600 hover:bg-violet-50 hover:text-violet-700'}"
      >
        <menu.icon size={18} strokeWidth={active ? 2.5 : 2} />
        {`${menu.label}`}
      </a>
    {/each}
  </nav>

  <div class="absolute bottom-4 left-4 right-4">
    <div class="rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 p-4 border border-violet-200/60">
      <p class="text-xs font-semibold text-violet-800">Delcom Courses</p>
      <p class="text-[11px] text-violet-600 mt-0.5 leading-snug">
        Platform kursus online untuk mahasiswa Delcom.
      </p>
    </div>
  </div>
</aside>
