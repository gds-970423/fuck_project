<template>
  <div>
    <el-row>
      <el-button type="info" @click="outInfo">退出登录</el-button>
    </el-row>
  </div>
</template>
<script>
export default {
  methods: {
    outInfo() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    }
  }
}
</script>
<style lang="less" scoped>
</style>