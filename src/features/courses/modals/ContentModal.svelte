<script lang="ts">
  import { X, LoaderCircle } from "lucide-svelte";
  import { coursesStore } from "../states/coursesStore";
  import type { CourseContent } from "../api/courseApi";

  interface Props {
    courseId: string | number;
    content?: CourseContent | null;
    onClose?: () => void;
  }
  let { courseId, content = null, onClose }: Props = $props();

  let title = $state(content?.title || "");
  let youtube = $state(content?.youtube || "");
  let loading = $derived($coursesStore.isContentAdd || $coursesStore.isContentChange);
  let isEdit = $derived(!!content);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!title.trim() || !youtube.trim()) return;
    if (isEdit && content) {
      await coursesStore.asyncChangeContent(content.id, title.trim(), youtube.trim(), courseId);
      if ($coursesStore.isContentChanged) {
        coursesStore.setIsContentChanged(false);
        onClose?.();
      }
    } else {
      await coursesStore.asyncAddContent(courseId, title.trim(), youtube.trim());
      if ($coursesStore.isContentAdded) {
        coursesStore.setIsContentAdded(false);
        onClose?.();
      }
    }
  }
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50" data-testid="content-modal">
  <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-violet-100 overflow-hidden">
    <div class="flex items-center justify-between px-5 py-4 border-b border-violet-50">
      <h2 class="font-bold text-slate-900">{isEdit ? "Ubah Konten" : "Tambah Konten"}</h2>
      <button type="button" onclick={() => onClose?.()} class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
    </div>
    <form onsubmit={handleSubmit} class="p-5 space-y-4">
      <div>
        <label for="content-title" class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Judul Materi</label>
        <input id="content-title" data-testid="content-title-input" bind:value={title} required class="w-full px-3.5 py-2.5 rounded-xl border border-violet-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
      </div>
      <div>
        <label for="content-youtube" class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">URL YouTube</label>
        <input id="content-youtube" data-testid="content-youtube-input" bind:value={youtube} required placeholder="https://youtu.be/..." class="w-full px-3.5 py-2.5 rounded-xl border border-violet-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
      </div>
      <div class="flex justify-end gap-2 pt-2">
        <button type="button" onclick={() => onClose?.()} class="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100">Batal</button>
        <button type="submit" data-testid="content-submit-btn" disabled={loading} class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-60">
          {#if loading}<LoaderCircle size={16} class="animate-spin" />{/if}
          Simpan
        </button>
      </div>
    </form>
  </div>
</div>
