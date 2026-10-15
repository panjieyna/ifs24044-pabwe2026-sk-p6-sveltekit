<script lang="ts">
  import { X, LoaderCircle, Image } from "lucide-svelte";
  import { coursesStore } from "../states/coursesStore";
  import type { Course } from "../api/courseApi";

  interface Props {
    course: Course;
    onClose?: () => void;
  }
  let { course, onClose }: Props = $props();

  let file: File | null = $state(null);
  let preview = $state("");
  let loading = $derived($coursesStore.isCourseChangeCover);

  function onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const f = input.files?.[0];
    if (f) {
      file = f;
      preview = URL.createObjectURL(f);
    }
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!file) return;
    await coursesStore.asyncChangeCover(course.id, file);
    if ($coursesStore.isCourseChangedCover) {
      coursesStore.setIsCourseChangedCover(false);
      onClose?.();
    }
  }
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50" data-testid="change-cover-modal">
  <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-violet-100 overflow-hidden">
    <div class="flex items-center justify-between px-5 py-4 border-b border-violet-50">
      <h2 class="font-bold text-slate-900">Ubah Cover</h2>
      <button type="button" onclick={() => onClose?.()} class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
    </div>
    <form onsubmit={handleSubmit} class="p-5 space-y-4">
      <div class="aspect-video rounded-2xl bg-violet-50 border border-dashed border-violet-200 flex items-center justify-center overflow-hidden">
        {#if preview}
          <img src={preview} alt="Preview" class="w-full h-full object-cover" />
        {:else if course.cover}
          <img src={course.cover} alt="Cover" class="w-full h-full object-cover" />
        {:else}
          <Image size={40} class="text-violet-300" />
        {/if}
      </div>
      <input type="file" accept="image/*" data-testid="cover-file-input" onchange={onFileChange} class="block w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
      <div class="flex justify-end gap-2 pt-2">
        <button type="button" onclick={() => onClose?.()} class="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100">Batal</button>
        <button type="submit" data-testid="cover-submit-btn" disabled={loading || !file} class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-60">
          {#if loading}<LoaderCircle size={16} class="animate-spin" />{/if}
          Unggah
        </button>
      </div>
    </form>
  </div>
</div>
