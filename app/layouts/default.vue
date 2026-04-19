<template>
  <div class="default-layout">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.default-layout {
  width: 100dvw;
  max-width: 1100px;
  margin: 0 auto;
  padding: 30px 20px;
  box-sizing: border-box;
}
</style>
