<template>
  <div>
    <div>
      <div>
        <img :src="$auth.user.picture">
        <h2>{{ $auth.user.name }}</h2>
        <p>{{ $auth.user.email }}</p>
      </div>
    <div>
      <pre>{{ JSON.stringify($auth.user, null, 2) }}</pre>
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: "Profile"
};
</script>

<style>
</style>
