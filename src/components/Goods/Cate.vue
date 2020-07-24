<template>
  <div>
    <!-- 头部面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 添加按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 商品列表区域 -->
      <tree-table
        :data="goodsData"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        border
        class="tree-table"
        :show-row-hover="false"
      >
        <!-- 状态值 -->
        <template v-slot:isok="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color:lightgreen;font-size:20px;"
          ></i>
          <i class="el-icon-error" v-else style="color:red;font-size:20px;"></i>
        </template>
        <!-- 排序 -->
        <template v-slot:order="slotProps">
          <!-- 权限标签区域 -->
          <el-tag v-if="slotProps.row.cat_level===0">一级</el-tag>
          <el-tag type="success" v-if="slotProps.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" v-if="slotProps.row.cat_level===2">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt">
          <el-button type="primary" icon="el-icon-search" size="mini">搜索</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <div class="block">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[3,5,10,15]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></el-pagination>
      </div>
      <!-- 添加分类对话框 -->
      <el-dialog title="添加分类" :visible.sync="dialogVisible" width="30%" @close="addCateDialogClosed">
        <!-- 表单验证区域 -->
        <el-form
          :model="addCateFrom"
          :rules="addCateFromRules"
          ref="addCateFromRef"
          label-width="100px"
        >
          <el-form-item label="分类名称：" prop="cat_name">
            <el-input v-model="addCateFrom.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类：">
            <!-- 级联选择器 -->
            <div class="block">
              <el-cascader
                v-model="selectedKeys"
                :options="parentCateList"
                :props="{ expandTrigger: 'hover', value:'cat_id', label:'cat_name', children:'children'}"
                @change="handleChange"
                clearable
                change-on-select
              ></el-cascader>
            </div>
          </el-form-item>
        </el-form>
        <!-- 表单按钮区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 获取商品列表的查询条件
      queryInfo: {
        type: '',
        // 当前页数
        pagenum: 1,
        // 写死每页显示的条数
        pagesize: 5
      },
      // 获取到的商品列表数据
      goodsData: [],
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示将当前列定义为模板
          type: 'template',
          // 表示这个模板的名称
          template: 'isok'
        },
        {
          label: '排序',
          // 表示将当前列定义为模板
          type: 'template',
          // 表示这个模板的名称
          template: 'order'
        },
        {
          label: '操作',
          // 表示将当前列定义为模板
          type: 'template',
          // 表示这个模板的名称
          template: 'opt'
        }
      ],
      // 对话框状态值
      dialogVisible: false,
      // 添加分类表单数据对象
      addCateFrom: {
        //  将要添加分类的名称
        cat_name: '',
        // 父级分类ID
        cat_pid: 0,
        // 分类的等级，默认添加为1
        cat_level: 0
      },
      // 添加表单的规则
      addCateFromRules: {
        catName: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 选择器所选中的 父级ID值
      selectedKeys: []
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 获取商品分类列表
    async getGoodsList() {
      const data = await this.$http.get('categories', {
        params: this.queryInfo
      })
      this.goodsData = data.result
      this.total = data.total
      console.log(data)
    },
    // 监听handleSize  改变的事件
    handleSizeChange(newSize) {
      // 更换每页显示的条数
      this.queryInfo.pagesize = newSize
      // 更新数据
      this.getGoodsList()
    },
    // 监听pagenum 页码的变化
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getGoodsList()
    },
    // 点击弹出添加对话框
    showAddCateDialog() {
      // 获取父级分类的数据列表
      this.getParentCateList()
      this.dialogVisible = true
    },
    // 获取父级分类
    async getParentCateList() {
      this.parentCateList = await this.$http.get('categories', {
        params: { type: 2 }
      })
    },
    // 级联选择器发生变化的时候触发
    handleChange() {
      if (this.selectedKeys.length > 0) {
        // 父级分类的ID
        this.addCateFrom.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 当前分类的等级赋值
        this.addCateFrom.cat_level = this.selectedKeys.length
      } else {
        // 父级分类的ID
        this.addCateFrom.cat_pid = 0
        // 当前分类的等级赋值
        this.addCateFrom.cat_level = 0
      }
    },
    // 点击添加新的分类
     addCate() {
      // 表单的预验证
     this.$refs.addCateFromRef.validate(async valid => {
        if (!valid) return
        await this.$http.post('categories', this.addCateFrom)
        this.$message.success('添加分类成功!')
        this.dialogVisible = false
      })
    },
    // 监听对话框的 关闭事件
    addCateDialogClosed() {
      this.$refs.addCateFromRef.resetFields()
      this.selectedKeys = []
      this.addCateFrom.cat_level = ''
      this.addCateFrom.cat_pid = ''
    }
  }
}
</script>
<style lang="less" scoped>
</style>