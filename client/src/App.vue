<script setup lang="ts"></script>

<template>
  <main>
    <component :is="$route.meta.layout || 'div'">
      <RouterView />
    </component>
  </main>
</template>
