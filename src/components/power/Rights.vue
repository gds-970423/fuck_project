<template>
  <div>
    <!-- 头部面包屑区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 权限列表卡片区域 -->
    <el-card class="box-card">
      <el-table :data="rightsList" border style="width: 100%">
        <el-table-column type="index" label="#" width="60px"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="权限等级">
          <template v-slot:default="slotProps">
            <!-- 权限标签区域 -->
            <el-tag v-if="slotProps.row.level==='0'">标签一</el-tag>
            <el-tag type="success" v-if="slotProps.row.level==='1'">标签二</el-tag>
            <el-tag type="warning" v-if="slotProps.row.level==='2'">标签三</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      rightsList: []
    }
  },
  created() {
    this.getRightsList()
  },
  methods: {
    // 获取权限列表数据
    async getRightsList() {
      this.rightsList = await this.$http.get('rights/list')
    }
  }
}
</script>
<style lang="stylus" scoped></style>