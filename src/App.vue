<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
    created(){
        console.log("%c%s", "color:#11779F; margin:12px; font-size: 16pt", 'Welcome to Codenames! ');
    }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
