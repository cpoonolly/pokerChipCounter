<template>
  <div class="start-screen">
    <div class="row">
      <h1 class="game-title">{{gameTitle}}</h1>
    </div>
    <div class="row">
      <img class="game-logo" src="../assets/pokerchip.png">
    </div>
    <div class="row">
      <a class="new-game-btn btn-large waves-effect waves-light">
        New Game
      </a>
    </div>
    <div class="row" v-if="false">
      <a class="new-game-btn btn-large waves-effect waves-light">
        Continue
      </a>
    </div>
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
@font-face {
  font-family: 'Borgens Burlesque';
  src: url('../assets/borgens_burlesque.otf');
}

.game-title {
  font-family: 'Borgens Burlesque'
}

.game-logo {
  max-height: 512px;
  max-width: 512px;

  -webkit-animation: spin 10s linear infinite;
  -moz-animation: spin 10s linear infinite;
  animation: spin 10s linear infinite;
}

@-moz-keyframes spin { 100% { -moz-transform: rotate(360deg); } }
@-webkit-keyframes spin { 100% { -webkit-transform: rotate(360deg); } }
@keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }

</style>
