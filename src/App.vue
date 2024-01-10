<script setup lang="ts">
import { useRootStore } from "./stores/root.js";
import {onMounted} from "vue";
const store = useRootStore();
onMounted(() => {
  store.onLoad();
});
</script>

<template>
  <div>
    <button>Take Screenshot</button>
    <h3>List of active tabs</h3>
    <ul>
      <li v-for="source in store.sources" :key="store.id" @click="store.takeScreenshot(source.id)">
        <span style="cursor: pointer">
          {{ source.name }}
        </span>
      </li>
    </ul>
  </div>
</template>

<style scoped>

</style>
