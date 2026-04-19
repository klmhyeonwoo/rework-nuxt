<template>
  <div class="profile-container">
    <img :src="props.src" class="image" />
    <span class="title"> {{ props.name }}</span>
    <span v-if="props.description" class="description">
      {{ props.description }}</span
    >
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    src: string;
    name: string;
    description?: string;
  }>(),
  {
    src: "",
  },
);
</script>

<style scoped lang="scss">
.profile-container {
  width: auto;
  display: flex;
  flex-direction: column;
  align-items: center;

  .image {
    width: 150px;
    height: 150px;
    object-fit: cover;
    overflow: hidden;
    border-radius: 9999px;
  }

  .title {
    font-size: 20px;
    margin-top: 15px;
  }

  .description {
    font-size: 15px;
    margin-top: 10px;
  }
}
</style>
