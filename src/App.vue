<template>
  <div id="app">
    <div id="nav">
      <h1>
          <router-link to="/">
            Welcome to Codenames!
          </router-link>
      </h1>
    </div>
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

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #11779F;
}
</style>
