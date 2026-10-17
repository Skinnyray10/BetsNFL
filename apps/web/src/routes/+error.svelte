<script lang="ts">
	import { page } from '$app/state';
</script>

<h1 class="text-2xl font-semibold">{page.status}</h1>
<p class="mt-2 text-white/60">{page.error?.message ?? 'Something went wrong.'}</p>
<a class="text-gold mt-4 inline-block text-sm" href="/">Back to teams</a>
