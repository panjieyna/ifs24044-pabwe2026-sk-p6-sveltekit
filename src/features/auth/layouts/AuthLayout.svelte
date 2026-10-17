<script lang="ts">
  import { onMount, type Snippet } from "svelte";
  import { page } from "$app/state";
  import { GraduationCap } from "lucide-svelte";
  import { usersStore } from "../../users/states/usersStore";
  import apiHelper from "../../../helpers/apiHelper";
  import AuthSessionRedirect from "./AuthSessionRedirect.svelte";

  let { children }: { children?: Snippet } = $props();
  let isLoginActive = $derived(page.url.pathname === "/auth/login");

  onMount(() => {
    const authToken = apiHelper.getAccessToken();
    if (authToken) {
      usersStore.asyncSetProfile();
    }
  });
</script>

<AuthSessionRedirect />

<main class="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50/40 to-violet-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
    <div class="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-700 to-fuchsia-700 items-center justify-center text-white shadow-xl shadow-violet-500/25 mb-3">
      <GraduationCap size={32} strokeWidth={2.5} />
    </div>
    <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">
      Delcom Courses
    </h1>
    <p class="mt-1 text-sm text-slate-600">
      Platform kursus online — belajar, lulus, dan berkembang bersama.
    </p>
  </div>

  <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
    <div class="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-violet-200/40 rounded-3xl border border-violet-100">
      <div class="flex rounded-2xl bg-violet-50 p-1 mb-6">
        <a
          href="/auth/login"
          class="flex-1 py-2 text-center text-sm font-semibold rounded-xl transition-all {isLoginActive ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}"
        >
          Masuk Akun
        </a>
        <a
          href="/auth/register"
          class="flex-1 py-2 text-center text-sm font-semibold rounded-xl transition-all {!isLoginActive ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}"
        >
          Daftar Baru
        </a>
      </div>

      {@render children?.()}
    </div>
  </div>
</main>
