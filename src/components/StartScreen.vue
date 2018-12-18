<template>
  <div class="start-screen">
    <img class="game-logo" src="../assets/pokerchip.png">
    <h1 class="game-title">{{gameTitle}}</h1>
  </div>
</template>

<script>
export default {
  data: () => ({
    gameTitle: 'Poker Chip Counter'
  })
}
</script>

<style scoped>
.game-logo {
  max-height: 512px;
  max-width: 512px;
}

.game-title {
    color: green;
}
</style>
