<template>
  <div>
    <!-- 这是头部面包屑部分 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 消息提示区域 -->
      <el-alert
        title="消息提示的文案"
        type="info"
        show-icon
        :closable="false"
        center
      >
      </el-alert>
      <!-- 步骤条区域 -->
      <el-steps
        :space="400"
        :active="active - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 表单验证区域 -->
      <el-form
        :model="addFrom"
        :rules="addFromRules"
        ref="addFromRef"
        label-width="100px"
        label-position="top"
      >
        <!-- 标签页区域 -->
        <el-tabs
          tab-position="left"
          v-model="active"
          :before-leave="beforTabLeave"
          @tab-click="tabChicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addFrom.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addFrom.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight" type="number">
              <el-input v-model="addFrom.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number" type="number">
              <el-input v-model="addFrom.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 级联选择框 -->
              <div class="block">
                <el-cascader
                  v-model="addFrom.goods_cat"
                  :options="goodsListData"
                  :props="{
                    expandTrigger: 'hover',
                    value: 'cat_id',
                    label: 'cat_name',
                    children: 'children'
                  }"
                  @change="handleChange"
                ></el-cascader>
              </div>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.newData">
                <el-checkbox
                  :label="cb"
                  v-for="(cb, i) in item.cb_newData"
                  :key="i"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headers"
              :on-success="handelSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addFrom.goods_introduce"></quill-editor>
            <!-- 添加按钮 -->
            <el-button type="primary" class="btnAdd" @click="add"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <!-- 浏览图片的对话框 -->
      <el-dialog title="图片浏览" :visible.sync="previewVisible" width="50%">
        <img :src="previewPath" alt="" class="previewImg" />
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
import _ from 'lodash'
export default {
  data() {
    return {
      // 步骤条当前已经完成信息的状态
      active: '0',
      // 添加商品的表单数据对象
      addFrom: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 图片的零时路径
        pics: [],
        // 商品的详情描述
        goods_introduce: '',
        attrs: []
      },
      // 对话框显示的图片路径
      previewPath: '',
      // 图片浏览对话框的状态值
      previewVisible: false,
      // 添加表单的验证规则
      addFromRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ]
      },
      // 获取到的商品列表数据
      goodsListData: [],
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性列表数据
      onlyTableData: [],
      // 图片添加的 默认地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传的 headers 请求头
      headers: { Authorization: window.sessionStorage.getItem('token') }
    }
  },
  created() {
    // 获取商品分类数据列表
    this.getGoodsDataList()
  },
  methods: {
    // 获取商品分类数据列表
    async getGoodsDataList() {
      this.goodsListData = await this.$http.get('categories')
    },
    // 当选中节点变化时触发
    handleChange() {
      if (this.addFrom.goods_cat.length !== 3) {
        return (this.addFrom.goods_cat = '')
      }
    },
    // 当tabs标签页需要发生跳转是 调用函数
    beforTabLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addFrom.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类!')
        return false
      }
    },
    // 点击切换tab标签 发送请求
    async tabChicked() {
      if (this.active === '1') {
        const data = await this.$http.get(
          `categories/${this.cataID}/attributes`,
          {
            params: { sel: 'many' }
          }
        )
        data.forEach(item => {
          item.newData =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
          item.cb_newData = [].concat(item.newData)
        })
        this.manyTableData = data
      } else if (this.active === '2') {
        const params = await this.$http.get(
          `categories/${this.cataID}/attributes`,
          {
            params: { sel: 'only' }
          }
        )
        this.onlyTableData = params
      }
    },
    // 处理浏览图片的事件
    handlePreview(file) {
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    // 删除浏览图片的事件
    handleRemove(file) {
      const filePath = file.response.data.tmp_path
      const index = this.addFrom.pics.findIndex(x => x.pics === filePath)
      this.addFrom.pics.splice(index, 1)
      console.log(this.addFrom.pics)
    },
    // 图片上传成功之后 执行
    handelSuccess(response) {
      console.log(response)
      const picsInfo = { pic: response.data.tmp_path }
      this.addFrom.pics.push(picsInfo)
      console.log(this.addFrom.pics)
    },
    // 添加商品
    add() {
      this.$refs.addFromRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写必要的表单项!')
        // 验证过后  执行添加业务
        const form = _.cloneDeep(this.addFrom)
        form.goods_cat = form.goods_cat.join(',')
        // 发送请求
        await this.$http.post('goods', form)
        this.$message.success('添加商品成功!')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cataID() {
      if (this.addFrom.goods_cat.length === 3) {
        return this.addFrom.goods_cat[2]
      }
      return null
    }
  }
}
</script>
<style lang="less" scoped>
.el-steps {
  margin: 20px 0;
}
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}
</style>
