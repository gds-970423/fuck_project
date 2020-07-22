<template>
  <div>
    <!-- 头部面包屑区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <el-row>
        <el-button type="primary">添加用户</el-button>
      </el-row>
      <!-- 角色列表区域 -->
      <template>
        <el-table :data="rolesList" border style="width: 100%">
          <!-- 展开列 -->
          <el-table-column type="expand" width="40px">
            <template v-slot:default="slotParams">
              <el-row
                v-for="(item1, i1) in slotParams.row.children"
                :key="item1.id"
                :class="['bdbottom',i1===0?'bdtop':'','vcenter']"
              >
                <!-- 一级权限 -->
                <el-col :span="5">
                  <el-tag
                    closable
                    @close="removeRolesById(slotParams.row,item1.id)"
                  >{{item1.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <!-- 二级权限 -->
                <el-col :span="19">
                  <el-row
                    v-for="(item2,i2) in item1.children"
                    :key="item2.id"
                    :class="[i2===0?'':'bdtop','vcenter']"
                  >
                    <el-col :span="6">
                      <el-tag
                        type="success"
                        closable
                        @close="removeRolesById(slotParams.row,item2.id)"
                      >{{item2.authName}}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="18">
                      <!-- 三级循环 -->
                      <el-tag
                        v-for="item3 in item2.children"
                        :key="item3.id"
                        type="warning"
                        closable
                        @close="removeRolesById(slotParams.row,item3.id)"
                      >{{item3.authName}}</el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
          <el-table-column type="index" label="#" width="50px"></el-table-column>
          <el-table-column prop="roleName" label="角色名称"></el-table-column>
          <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
          <el-table-column label="操作">
            <template v-slot:default="scope">
              <el-button type="primary" icon="el-icon-edit" size="medium">编辑</el-button>
              <el-button type="danger" icon="el-icon-delete" size="medium">删除</el-button>
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="medium"
                @click="setRolesList(scope.row)"
              >分配权限</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-card>
    <!-- 分配权限对话框 -->
    <el-dialog title="提示" :visible.sync="dialogVisible" width="50%" @close="setRolesClear">
      <!-- 树形控件 -->
      <el-tree
        :data="rolesInfoList"
        :props="defaultProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 所有角色列表
      rolesList: [],
      // 对话框状态
      dialogVisible: false,
      // 所有权限数据
      rolesInfoList: [],
      // 树形控件的属性绑定对象
      defaultProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中状态的节点ID 值
      defKeys: [],
      // 当前需要分配权限的用户ID
      roleID: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取 角色列表数据
    async getRolesList() {
      this.rolesList = await this.$http.get('roles')
    },
    // 根据ID 删除对应权限
    async removeRolesById(roleId, rightId) {
      // 弹框提示用户是否删除该项
      const comfirmRresult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (comfirmRresult !== 'confirm') {
        return this.$message.info('取消删除成功!')
      }
      // 确认删除  发送请求
      const data = await this.$http.delete(
        `roles/${roleId.id}/rights/${rightId}`
      )
      this.$message.info('删除成功!')
      roleId.children = data
    },
    // 获取 权限表
    async setRolesList(role) {
      this.roleID = role.id
      this.rolesInfoList = await this.$http.get('rights/tree')
      // 递归获取到第三级的全部权利ID
      this.getLeafKeys(role, this.defKeys)
      this.dialogVisible = true
    },
    // 通过递归获取三级的权利ID
    getLeafKeys(node, arr) {
      // 如果没有子元素
      if (!node.children) return arr.push(node.id)
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 对话框关闭之后 清除默认选中的ID值
    setRolesClear() {
      this.defKeys = []
    },
    // 点击为用户分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const newKeys = keys.join(',')
      // 发送分配请求
      await this.$http.post(`roles/${this.roleID}/rights`, {
        rids: newKeys
      })
      this.$message.success('分配权限成功!')
      // 刷新列表框
      this.getRolesList()
      // 隐藏 对话框
      this.dialogVisible = false
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>