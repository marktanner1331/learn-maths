<!-- src/App.svelte -->
<script lang="ts">
	import { Router } from "@roxi/routify";
	import { routes } from "../.routify/routes";
	import GlobalCssImports from "./GlobalScssImports.svelte";
  </script>
  <!-- Hash-based routing
  <Router config={{useHash: true}} {routes} />
  -->
  <Router {routes} config={{
    urlTransform: {
      apply: url => `/get-to-the-end${url}`, //external URL
      remove: url => url.replace('/get-to-the-end', ''), //internal URL
    }
  }} />