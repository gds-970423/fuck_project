<template>
  <div>
    <!-- 这是头部面包屑部分 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 头部警告区域 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数"
        type="warning"
        show-icon
        :closable="false"
      ></el-alert>
      <!-- 级联选择器区域 -->
      <div class="block">
        <span class="demonstration">选择商品分类：</span>
        <el-cascader
          v-model="selectedKeys"
          :options="goodsList"
          :props="{
            expandTrigger: 'hover',
            value: 'cat_id',
            label: 'cat_name',
            children: 'children'
          }"
          @change="handleChange"
        ></el-cascader>
      </div>
      <!-- 标签页区域 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!-- 动态参数模板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加动态参数的面板 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="dialogVisible = true"
            >添加参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot:default="scope">
                <el-tag
                  :key="i"
                  v-for="(item, i) in scope.row.itemAttrVals"
                  closable
                  :disable-transitions="false"
                  @close="handleClose(i, scope.row)"
                >
                  {{ item }}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column
              prop="attr_name"
              label="参数名称"
            ></el-table-column>
            <el-table-column label="操作">
              <template v-slot:default="slotParams">
                <el-button
                  size="mini"
                  icon="el-icon-edit"
                  type="primary"
                  @click="showEditDialog(slotParams.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  size="mini"
                  icon="el-icon-delete"
                  type="danger"
                  @click="removeParams(slotParams.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性模板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加静态属性的面板 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="dialogVisible = true"
            >添加属性</el-button
          >
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot:default="scope">
                <el-tag
                  :key="i"
                  v-for="(item, i) in scope.row.itemAttrVals"
                  closable
                  :disable-transitions="false"
                  @close="handleClose(i, scope.row)"
                >
                  {{ item }}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column
              prop="attr_name"
              label="属性名称"
            ></el-table-column>
            <el-table-column label="操作">
              <template v-slot:default="slotParams">
                <el-button
                  size="mini"
                  icon="el-icon-edit"
                  type="primary"
                  @click="showEditDialog(slotParams.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  size="mini"
                  icon="el-icon-delete"
                  type="danger"
                  @click="removeParams(slotParams.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="dialogVisible"
      width="50%"
      @close="addDialongClosed"
    >
      <!-- 表单验证区域 -->
      <el-form
        :model="ruleForm"
        :rules="ruleFormRules"
        ref="ruleFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="ruleForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialongClosed"
    >
      <!-- 表单验证区域 -->
      <el-form
        :model="editRuleForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editRuleForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 获取商品列表的参数
      queryInfo: {
        type: '',
        pagenum: 1,
        pagesize: 5
      },
      // 获取到的 商品列表数据
      goodsList: [],
      // 选择器选中的父级元素的ID
      selectedKeys: [],
      // 当前选项卡的name
      activeName: 'many',
      // 动态参数面板的数据
      manyTableData: [],
      // 静态属性面板的数据
      onlyTableData: [],
      //  控制对话框的显示隐藏
      dialogVisible: false,
      // 添加表单的 数据存储
      ruleForm: {
        attr_name: ''
      },
      // 修改表单数据存储
      editRuleForm: {},
      // 添加表单的验证规则
      ruleFormRules: {
        attr_name: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }
        ]
      },
      // 修改表单的验证规则
      editFormRules: {
        attr_name: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }
        ]
      },
      //  修改对话框的 状态值
      editDialogVisible: false
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 获取商品列表数据
    async getGoodsList() {
      const data = await this.$http.get('categories', {
        params: this.queryInfo
      })
      this.goodsList = data.result
    },
    // 当级联选择器节点发生变化是调用
    async handleChange() {
      this.getCateGoriesData()
    },
    //  当标签页被点击时
    handleClick() {
      this.getCateGoriesData()
    },
    // 根据所选分类的ID和所选的面板来获取对应的 请求
    async getCateGoriesData() {
      // 判断级联选择器选择三级
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // 确实是三级之后 加载数据
      const data = await this.$http.get(
        `categories/${this.cateID}/attributes`,
        {
          params: { sel: this.activeName }
        }
      )
      data.forEach(item => {
        // 这里循环 给item 每一项里面添加一个数据
        item.itemAttrVals = item.attr_vals ? item.attr_vals.split(',') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      // 判断是那个面板的属性
      if (this.activeName === 'many') {
        this.manyTableData = data
      } else {
        this.onlyTableData = data
      }
    },
    // 监听对话框的关闭事件
    addDialongClosed() {
      this.$refs.ruleFormRef.resetFields()
    },
    // 点击按钮，添加参数
    addParams() {
      this.$refs.ruleFormRef.validate(async valid => {
        if (!valid) return
        await this.$http.post(`categories/${this.cateID}/attributes`, {
          attr_name: this.ruleForm.attr_name,
          attr_sel: this.activeName
        })
        this.$message.success('添加参数成功!')
        this.getCateGoriesData()
        this.dialogVisible = false
      })
    },
    // 点击编辑按钮 展示 编辑对话框
    async showEditDialog(attrId) {
      // 查询当前参数的信息
      this.editRuleForm = await this.$http.get(
        `categories/${this.cateID}/attributes/${attrId}`,
        {
          params: { attr_sel: this.activeName }
        }
      )
      this.editDialogVisible = true
    },
    // 修改对话框关闭之后调用
    editDialongClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击按钮修改参数信息
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 校验成功
        await this.$http.put(
          `categories/${this.cateID}/attributes/${this.editRuleForm.attr_id}`,
          {
            attr_name: this.editRuleForm.attr_name,
            attr_sel: this.activeName
          }
        )
        this.$message.success('修改参数成功!')
        this.getCateGoriesData()
        this.editDialogVisible = false
      })
    },
    // 点击按钮根据ID 删除对应数据
    async removeParams(attrId) {
      const data = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (data !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      await this.$http.delete(`categories/${this.cateID}/attributes/${attrId}`)
      this.$message.success('删除成功!')
      this.getCateGoriesData()
    },
    // 点击按钮展示文本输入框
    showInput(row) {
      row.inputVisible = true
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 文本框失去焦点和键盘按下 都会触发事件更换inputValue 状态值
    async handleInputConfirm(row) {
      // 预检验 用户是否输入了内容
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果没有return出去  表明客户输入了内容
      row.itemAttrVals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 调用 请求函数
      this.saveAttrVals(row)
    },
    // 把tag 修改指令封装出来
    async saveAttrVals(row) {
      //  发起请求  保存这次的修改
      await this.$http.put(
        `categories/${this.cateID}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.itemAttrVals.join(',')
        }
      )
      this.$message.success('修改参数项成功!')
    },
    // 根据索引 删除 对应的TAG
    handleClose(index, row) {
      row.itemAttrVals.splice(index, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    // 如果级联选择器选择长度等于3 为true 否则为false
    isBtnDisabled() {
      if (this.selectedKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的 第三级分类的ID
    cateID() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      return null
    },
    // 对话框文本
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>
<style lang="less" scoped>
.block {
  margin-top: 15px;
  margin-bottom: 15px;
}
.demonstration {
  margin-right: 10px;
}
.el-tag {
  margin: 0 10px;
}
.input-new-tag {
  width: 150px;
}
</style>
