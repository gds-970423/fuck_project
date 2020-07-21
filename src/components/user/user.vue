<template>
  <div>
    <!-- 面包屑头部区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加用户信息区域 -->
      <div style="margin-top: 15px;">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserInfo">
              <el-button slot="append" icon="el-icon-search" @click="getUserInfo"></el-button>
            </el-input>
          </el-col>
          <el-col :span="7">
            <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
          </el-col>
        </el-row>
      </div>
      <!-- 添加用户对话框 -->
      <el-dialog title="添加用户" :visible.sync="dialogVisible" width="50%" @close="addClose">
        <!-- 表单验证区域 -->
        <el-form :model="addForm" :rules="addFromRules" label-width="70px" ref="addFormRef">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改用户信息对话框 -->
      <el-dialog title="修改信息" :visible.sync="modifyDialogVisible" width="40%" @close="editClose">
        <el-form ref="editForm" :model="editFrom" label-width="80px" :rules="addFromRules">
          <el-form-item label="用户名">
            <el-input v-model="editFrom.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            >
            <el-input v-model="editFrom.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="editFrom.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="modifyDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 用户信息展示区域 -->
      <el-table style="width: 100%" border :data="userList">
        <el-table-column type="index" label="编号"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template v-slot:default="slotProps">
            <el-switch v-model="slotProps.row.mg_state" @change="userGetChange(slotProps.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot:default="slotParams">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              :circle="true"
              @click="modifyUserInfo(slotParams.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              :circle="true"
              slot="reference"
              @click="deleteUser(slotParams.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="right-start"
              :enterable="false"
            >
              <el-button type="warning" icon="el-icon-setting" :circle="true"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页部分 -->
      <div class="block">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[1, 2, 3, 4,5]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: '',
  data() {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb()
      }

      cb(new Error('请输入合法的邮箱'))
    }

    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if (regMobile.test(value)) {
        return cb()
      }

      cb(new Error('请输入合法的手机号'))
    }
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        // 当前页码
        pagenum: 1,
        // 当前分页显示数量
        pagesize: 2
      },
      userList: [],
      total: 0,
      // 添加用户框的状态值
      dialogVisible: false,
      // 修改用户框的状态值
      modifyDialogVisible: false,
      // 存放查询到的用户信息
      editFrom: {},
      // 添加from的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户验证规则
      addFromRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 8 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入用户手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
      // 修改信息的验证规则
    }
  },
  created() {
    this.getUserInfo()
  },
  methods: {
    // 获取用户信息
    async getUserInfo() {
      this.tableData = await this.$http.get('users', { params: this.queryInfo })
      if (!this.tableData) return
      this.userList = this.tableData.users
      this.total = this.tableData.total
    },
    // 监听pagesize 改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserInfo()
    },
    // 监听 页码值发生改变事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserInfo()
    },
    // 监听用户状态值改变
    async userGetChange(state) {
      await this.$http.put(`users/${state.id}/state/${state.mg_state}`)
      this.$message.success('用户状态更新成功')
    },
    // 监听添加用户对话框的关闭事件
    addClose() {
      this.$refs.addFormRef.resetFields()
    },
    // 监听修改用户对话框的关闭事件
    editClose() {
      this.$refs.editForm.resetFields()
    },
    // 点击按钮，添加新用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        await this.$http.post('users', this.addForm)
        // 成功提示
        this.$message.success('添加用户成功')
        // 隐藏对话框
        this.dialogVisible = false
        // 更新界面数据
        this.getUserInfo()
      })
    },
    // 修改用户信息
    async modifyUserInfo(id) {
      this.modifyDialogVisible = true
      // 根据ID 来获取用户信息
      this.editFrom = await this.$http.get('users/' + id)
    },
    // 修改用户信息并提交修改
    editUserInfo() {
      this.$refs.editForm.validate(async valid => {
        if (!valid) return
        // 发起修改信息的请求
        await this.$http.put('users/' + this.editFrom.id, {
          email: this.editFrom.email,
          mobile: this.editFrom.mobile
        })
        this.$message.success('修改用户信息成功!')
        this.modifyDialogVisible = false
        // 成功之后 重新加载一下 数据
        this.getUserInfo()
      })
    },
    // 删除单个用户信息
    async deleteUser(id) {
      const msg = confirm('是否要删除该信息？')
      if (!msg) return this.$message.success('用户取消删除')
      await this.$http.delete('users/' + id)
      this.getUserInfo()
      this.$message.success('删除成功')
      // 成功之后 重新加载页面
    }
  }
}
</script>

<style scoped></style>
