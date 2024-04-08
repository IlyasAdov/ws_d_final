<script setup>
import { RouterLink } from 'vue-router'
</script>

<template class="container">
  <div class="home-page">
    <h1>Home page</h1>
    <div class="box">
      <div class="block">
        <RouterLink to="chat" class="block-link">ChatterBlast</RouterLink>
      </div>
      <div class="block">
        <RouterLink to="image-generation" class="block-link">DreamWeaver</RouterLink>
      </div>
      <div class="block">
        <RouterLink to="image-recognition" class="block-link">MindReader</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  text-align: center;
  height: 100vh;
  background-color: #292929; /* Цвет фона в темных тонах */
}

.home-page h1 {
  padding-top: 20px;
}

.box {
  display: flex;
  justify-content: center;
}

.block {
  margin: 20px;
  padding: 20px;
  background-color: #444; /* Цвет блока в темных тонах */
  border-radius: 10px;
}

.block-link {
  color: #fff; /* Цвет ссылки в блоке */
  text-decoration: none;
  font-size: 20px;
}
</style>
