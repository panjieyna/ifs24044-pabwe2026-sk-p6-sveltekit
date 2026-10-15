<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { ArrowLeft, CheckCircle2, Circle, LoaderCircle, Video } from "lucide-svelte";
  import { coursesStore } from "../states/coursesStore";

  interface Props {
    courseId?: string;
    contentId?: string;
  }
  let { courseId = "", contentId = "" }: Props = $props();

  let content = $derived($coursesStore.content);
  let loading = $derived($coursesStore.isContent || $coursesStore.isContentLearn);

  function extractYoutubeId(url: string | null | undefined): string | null {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return null;
  }

  let embedUrl = $derived(
    (() => {
      const id = extractYoutubeId(content?.youtube);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    })()
  );

  onMount(() => {
    if (contentId) coursesStore.asyncSetContent(contentId);
  });

  async function toggleFinished() {
    if (!contentId || !content) return;
    const next: 0 | 1 = content.my_status_finished ? 0 : 1;
    await coursesStore.asyncSetContentLearn(contentId, next);
  }
</script>

<div class="max-w-4xl mx-auto space-y-6">
  <button
    type="button"
    onclick={() => goto(courseId ? `/courses/${courseId}` : "/")}
    class="inline-flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-800 font-medium"
  >
    <ArrowLeft size={16} /> Kembali ke Detail
  </button>

  {#if loading && !content}
    <div class="flex justify-center py-20 text-violet-600"><LoaderCircle size={32} class="animate-spin" /></div>
  {:else if !content}
    <div class="text-center py-16 text-slate-500">Materi tidak ditemukan</div>
  {:else}
    <div class="rounded-3xl bg-white border border-violet-100 overflow-hidden shadow-sm">
      <div class="p-5 border-b border-violet-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Video size={20} class="text-violet-500" />
            {content.title}
          </h1>
        </div>
        <button
          type="button"
          data-testid="toggle-finished-btn"
          onclick={toggleFinished}
          disabled={$coursesStore.isContentLearn}
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all
            {content.my_status_finished
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100'}"
        >
          {#if content.my_status_finished}
            <CheckCircle2 size={16} /> Selesai
          {:else}
            <Circle size={16} /> Tandai Selesai
          {/if}
        </button>
      </div>

      <div class="aspect-video bg-slate-900">
        {#if embedUrl}
          <iframe
            src={embedUrl}
            title={content.title}
            class="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            data-testid="youtube-player"
          ></iframe>
        {:else}
          <div class="w-full h-full flex items-center justify-center text-slate-400">
            URL YouTube tidak valid
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
