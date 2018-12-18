<template>
  <h1 class="greeting">{{message}}</h1>
</template>

<script>
export default {
  data: () => ({
    message: 'Hello World'
  })
}
</script>

<style scoped>
.greeting {
    color: green;
}
</style>
