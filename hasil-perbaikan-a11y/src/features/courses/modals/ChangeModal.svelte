<script lang="ts">
  import { X, LoaderCircle } from "lucide-svelte";
  import { coursesStore } from "../states/coursesStore";
  import type { Course } from "../api/courseApi";

  interface Props {
    course: Course;
    onClose?: () => void;
  }
  let { course, onClose }: Props = $props();

  let title = $state(course.title || "");
  let description = $state(course.description || "");
  let loading = $derived($coursesStore.isCourseChange);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!title.trim()) return;
    await coursesStore.asyncChangeCourse(course.id, title.trim(), description.trim());
    if ($coursesStore.isCourseChanged) {
      coursesStore.setIsCourseChanged(false);
      onClose?.();
    }
  }
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50" data-testid="change-modal">
  <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-violet-100 overflow-hidden">
    <div class="flex items-center justify-between px-5 py-4 border-b border-violet-50">
      <h2 class="font-bold text-slate-900">Ubah Kursus</h2>
      <button type="button" aria-label="Tutup" onclick={() => onClose?.()} class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"><X size={18} aria-hidden="true" /></button>
    </div>
    <form onsubmit={handleSubmit} class="p-5 space-y-4">
      <div>
        <label for="change-title" class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Judul</label>
        <input id="change-title" data-testid="change-title-input" bind:value={title} required class="w-full px-3.5 py-2.5 rounded-xl border border-violet-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
      </div>
      <div>
        <label for="change-desc" class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Deskripsi</label>
        <textarea id="change-desc" data-testid="change-desc-input" bind:value={description} rows="3" class="w-full px-3.5 py-2.5 rounded-xl border border-violet-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"></textarea>
      </div>
      <div class="flex justify-end gap-2 pt-2">
        <button type="button" onclick={() => onClose?.()} class="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100">Batal</button>
        <button type="submit" data-testid="change-submit-btn" disabled={loading} class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-60">
          {#if loading}<LoaderCircle size={16} class="animate-spin" />{/if}
          Simpan
        </button>
      </div>
    </form>
  </div>
</div>
