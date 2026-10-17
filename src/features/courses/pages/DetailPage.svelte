<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import {
    ArrowLeft,
    Pencil,
    Image,
    Plus,
    Trash2,
    Star,
    Users,
    Video,
    LoaderCircle,
    UserPlus,
    UserMinus,
  } from "lucide-svelte";
  import { coursesStore } from "../states/coursesStore";
  import { usersStore } from "../../users/states/usersStore";
  import { formatDate, showConfirmDialog } from "../../../helpers/toolsHelper";
  import ChangeModal from "../modals/ChangeModal.svelte";
  import ChangeCoverModal from "../modals/ChangeCoverModal.svelte";
  import ContentModal from "../modals/ContentModal.svelte";

  interface Props {
    courseId?: string;
  }
  let { courseId = "" }: Props = $props();

  let showChange = $state(false);
  let showCover = $state(false);
  let showContent = $state(false);
  let editContent = $state<any>(null);
  let ratingValue = $state(5);
  let ratingComment = $state("");

  let course = $derived($coursesStore.course);
  let profile = $derived($usersStore.profile);
  let loading = $derived($coursesStore.isCourse);

  let isOwner = $derived(
    !!(profile && course && String(course.user_id) === String(profile.id))
  );
  let isStudent = $derived(
    !!(
      profile &&
      course?.students &&
      course.students.some((s: any) =>
        String(typeof s === "object" ? s.id ?? s.user_id : s) === String(profile.id)
      )
    )
  );

  onMount(() => {
    if (courseId) coursesStore.asyncSetCourse(courseId);
  });

  async function handleJoin() {
    if (courseId) await coursesStore.asyncJoinCourse(courseId);
  }
  async function handleLeave() {
    if (courseId) await coursesStore.asyncLeaveCourse(courseId);
  }
  async function handleRate() {
    if (courseId) await coursesStore.asyncRateCourse(courseId, ratingValue, ratingComment);
  }
  async function handleDeleteContent(id: string | number) {
    const res = await showConfirmDialog("Hapus materi ini?");
    if (res.isConfirmed && courseId) {
      await coursesStore.asyncDeleteContent(id, courseId);
    }
  }
</script>

{#if loading && !course}
  <div class="flex justify-center py-20 text-violet-600"><LoaderCircle size={32} class="animate-spin" /></div>
{:else if !course}
  <div class="text-center py-16 text-slate-500">Kursus tidak ditemukan</div>
{:else}
  <div class="max-w-4xl mx-auto space-y-6">
    <button type="button" onclick={() => goto("/")} class="inline-flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-800 font-medium">
      <ArrowLeft size={16} /> Kembali
    </button>

    <div class="rounded-3xl bg-white border border-violet-100 overflow-hidden shadow-sm">
      <div class="aspect-[21/9] bg-gradient-to-br from-violet-100 to-fuchsia-100 relative">
        {#if course.cover}
          <img src={course.cover} alt={course.title} class="w-full h-full object-cover" />
        {/if}
        {#if isOwner}
          <button type="button" data-testid="change-cover-btn" onclick={() => (showCover = true)} class="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 text-sm font-medium text-violet-700 shadow">
            <Image size={14} /> Ubah Cover
          </button>
        {/if}
      </div>
      <div class="p-6">
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 class="text-2xl font-extrabold text-slate-900">{course.title}</h1>
            <p class="text-sm text-slate-500 mt-1">{course.description}</p>
            <div class="flex flex-wrap gap-3 mt-3 text-xs text-slate-400">
              <span>{course.author?.name || "—"}</span>
              <span class="inline-flex items-center gap-1"><Star size={12} class="text-amber-400 fill-amber-400" /> {course.avg_ratings != null ? Number(course.avg_ratings).toFixed(1) : "—"}</span>
              <span>{`${course.total_contents || 0} materi`}</span>
              <span>{formatDate(course.created_at)}</span>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            {#if isOwner}
              <button type="button" data-testid="edit-course-btn" onclick={() => (showChange = true)} class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-violet-50 text-violet-700 hover:bg-violet-100">
                <Pencil size={14} /> Ubah
              </button>
            {:else if isStudent}
              <button type="button" data-testid="leave-course-btn" onclick={handleLeave} class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-rose-50 text-rose-600 hover:bg-rose-100">
                <UserMinus size={14} /> Keluar
              </button>
            {:else}
              <button type="button" data-testid="join-course-btn" onclick={handleJoin} class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700">
                <UserPlus size={14} /> Gabung
              </button>
            {/if}
          </div>
        </div>

        {#if isStudent}
          <div class="mt-5 p-4 rounded-2xl bg-violet-50 border border-violet-100 space-y-3" data-testid="rating-box">
            <p class="text-sm font-semibold text-violet-800">Beri Rating</p>
            <div class="flex gap-1">
              {#each [1, 2, 3, 4, 5] as n}
                <button type="button" data-testid={`rating-star-${n}`} onclick={() => (ratingValue = n)} class="p-1 {ratingValue >= n ? 'text-amber-400' : 'text-slate-300'}">
                  <Star size={20} class={ratingValue >= n ? "fill-amber-400" : ""} />
                </button>
              {/each}
            </div>
            <input bind:value={ratingComment} placeholder="Komentar (opsional)" class="w-full px-3 py-2 rounded-xl border border-violet-100 text-sm" data-testid="rating-comment" />
            <button type="button" onclick={handleRate} data-testid="rating-submit" class="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-violet-600">Kirim Rating</button>
          </div>
        {/if}
      </div>
    </div>

    <!-- Contents -->
    <div class="rounded-3xl bg-white border border-violet-100 p-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-bold text-slate-900 flex items-center gap-2"><Video size={18} class="text-violet-500" /> Daftar Materi</h2>
        {#if isOwner}
          <button type="button" data-testid="add-content-btn" onclick={() => { editContent = null; showContent = true; }} class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-white bg-violet-600">
            <Plus size={14} /> Tambah
          </button>
        {/if}
      </div>
      {#if !course.contents?.length}
        <p class="text-sm text-slate-400 text-center py-8">Belum ada materi</p>
      {:else}
        <ul class="space-y-2" data-testid="content-list">
          {#each course.contents as c (c.id)}
            <li class="flex items-center gap-3 p-3 rounded-xl border border-violet-50 hover:bg-violet-50/50 transition-colors">
              <a href={`/courses/${courseId}/contents/${c.id}`} class="flex-1 min-w-0">
                <p class="font-medium text-slate-800 truncate">{c.title}</p>
                <p class="text-xs text-slate-400 truncate">{c.youtube}</p>
              </a>
              {#if c.my_status_finished}
                <span class="text-[10px] font-bold uppercase tracking-wide text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Selesai</span>
              {/if}
              {#if isOwner}
                <button type="button" onclick={() => { editContent = c; showContent = true; }} class="p-1.5 rounded-lg text-violet-500 hover:bg-violet-100"><Pencil size={14} /></button>
                <button type="button" onclick={() => handleDeleteContent(c.id)} class="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"><Trash2 size={14} /></button>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    <!-- Ratings list -->
    {#if course.ratings?.length}
      <div class="rounded-3xl bg-white border border-violet-100 p-6 shadow-sm">
        <h2 class="font-bold text-slate-900 flex items-center gap-2 mb-4"><Users size={18} class="text-violet-500" /> Ulasan</h2>
        <ul class="space-y-3">
          {#each course.ratings as r}
            <li class="p-3 rounded-xl bg-violet-50/50 border border-violet-50">
              <div class="flex items-center justify-between">
                <span class="font-medium text-sm text-slate-800">{r.name}</span>
                <span class="inline-flex items-center gap-0.5 text-xs text-amber-500">
                  <Star size={12} class="fill-amber-400" /> {r.ratings}
                </span>
              </div>
              {#if r.comment}<p class="text-xs text-slate-500 mt-1">{r.comment}</p>{/if}
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>
{/if}

{#if showChange && course}
  <ChangeModal course={course} onClose={() => (showChange = false)} />
{/if}
{#if showCover && course}
  <ChangeCoverModal course={course} onClose={() => (showCover = false)} />
{/if}
{#if showContent && courseId}
  <ContentModal courseId={courseId} content={editContent} onClose={() => (showContent = false)} />
{/if}
