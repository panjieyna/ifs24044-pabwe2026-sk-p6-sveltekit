<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import {
    Search,
    Plus,
    Trash2,
    BookOpen,
    Star,
    Filter,
    LoaderCircle,
  } from "lucide-svelte";
  import { coursesStore } from "../states/coursesStore";
  import { usersStore } from "../../users/states/usersStore";
  import { formatDate, showConfirmDialog } from "../../../helpers/toolsHelper";
  import AddModal from "../modals/AddModal.svelte";

  let search = $state("");
  let filterMine = $state(false);
  let showAdd = $state(false);

  let profile = $derived($usersStore.profile);
  let courses = $derived($coursesStore.courses);
  let loading = $derived($coursesStore.isCourse || $coursesStore.isCourseDelete);

  let filtered = $derived(
    (courses || []).filter((c) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        c.title?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q);
      const matchMine =
        !filterMine ||
        (profile && String(c.user_id) === String(profile.id));
      return matchSearch && matchMine;
    })
  );

  onMount(() => {
    coursesStore.asyncSetCourses();
  });

  async function handleFilterMine() {
    filterMine = !filterMine;
    if (filterMine) {
      await coursesStore.asyncSetCourses(1);
    } else {
      await coursesStore.asyncSetCourses();
    }
  }

  async function handleDeleteAll() {
    const res = await showConfirmDialog(
      "Hapus semua kursus yang Anda buat? Tindakan ini tidak dapat dibatalkan."
    );
    if (res.isConfirmed) {
      await coursesStore.asyncDeleteAllCourses();
    }
  }

  async function handleDeleteOne(id: string | number, e: Event) {
    e.preventDefault();
    e.stopPropagation();
    const res = await showConfirmDialog("Hapus kursus ini?");
    if (res.isConfirmed) {
      await coursesStore.asyncDeleteCourse(id);
    }
  }
</script>

<div class="max-w-6xl mx-auto space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">
        Semua Kursus
      </h1>
      <p class="text-sm text-slate-500 mt-0.5">
        Jelajahi dan kelola kursus pembelajaran Anda
      </p>
    </div>
    <div class="flex flex-wrap gap-2">
      <button
        type="button"
        data-testid="filter-mine-btn"
        onclick={handleFilterMine}
        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all
          {filterMine
            ? 'bg-violet-600 text-white border-violet-600'
            : 'bg-white text-slate-700 border-violet-100 hover:border-violet-300'}"
      >
        <Filter size={16} />
        Milik Saya
      </button>
      <button
        type="button"
        data-testid="add-course-btn"
        onclick={() => (showAdd = true)}
        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-500 shadow-md shadow-violet-500/25 hover:opacity-95"
      >
        <Plus size={16} />
        Tambah Kursus
      </button>
      <button
        type="button"
        data-testid="delete-all-btn"
        onclick={handleDeleteAll}
        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-rose-600 bg-white border border-rose-100 hover:bg-rose-50"
      >
        <Trash2 size={16} />
        Hapus Semua
      </button>
    </div>
  </div>

  <div class="relative">
    <Search
      size={18}
      class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
    />
    <input
      type="search"
      data-testid="search-input"
      bind:value={search}
      placeholder="Cari judul atau deskripsi kursus..."
      class="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-violet-100 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 shadow-sm"
    />
  </div>

  {#if loading}
    <div class="flex justify-center py-16 text-violet-600" data-testid="loading">
      <LoaderCircle size={32} class="animate-spin" />
    </div>
  {:else if filtered.length === 0}
    <div
      class="text-center py-16 rounded-3xl border border-dashed border-violet-200 bg-white/60"
      data-testid="empty-state"
    >
      <BookOpen size={40} class="mx-auto text-violet-300 mb-3" />
      <p class="text-slate-600 font-medium">Belum ada kursus</p>
      <p class="text-sm text-slate-400 mt-1">Tambahkan kursus pertama Anda</p>
    </div>
  {:else}
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="course-list">
      {#each filtered as course (course.id)}
        <a
          href="/courses/{course.id}"
          class="group block rounded-2xl bg-white border border-violet-100 overflow-hidden shadow-sm hover:shadow-lg hover:border-violet-200 transition-all"
          data-testid="course-card-{course.id}"
        >
          <div class="aspect-[16/9] bg-gradient-to-br from-violet-100 to-fuchsia-100 relative overflow-hidden">
            {#if course.cover}
              <img
                src={course.cover}
                alt={course.title}
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            {:else}
              <div class="w-full h-full flex items-center justify-center text-violet-300">
                <BookOpen size={48} />
              </div>
            {/if}
            {#if profile && String(course.user_id) === String(profile.id)}
              <button
                type="button"
                data-testid="delete-course-{course.id}"
                onclick={(e) => handleDeleteOne(course.id, e)}
                class="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 text-rose-500 hover:bg-rose-50 shadow"
              >
                <Trash2 size={14} />
              </button>
            {/if}
          </div>
          <div class="p-4">
            <h3 class="font-bold text-slate-900 line-clamp-1 group-hover:text-violet-700 transition-colors">
              {course.title}
            </h3>
            <p class="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[2rem]">
              {course.description || "Tanpa deskripsi"}
            </p>
            <div class="flex items-center justify-between mt-3 text-[11px] text-slate-400">
              <span>{course.author?.name || "—"}</span>
              <span class="inline-flex items-center gap-1">
                <Star size={12} class="text-amber-400 fill-amber-400" />
                {course.avg_ratings != null ? Number(course.avg_ratings).toFixed(1) : "—"}
              </span>
            </div>
            <div class="flex items-center justify-between mt-2 text-[11px] text-slate-400">
              <span>{course.total_contents || 0} materi</span>
              <span>{formatDate(course.created_at)}</span>
            </div>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>

{#if showAdd}
  <AddModal onClose={() => (showAdd = false)} />
{/if}
