<template>
  <div>
    <!-- 这是头部面包屑部分 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <el-row :gutter="30">
        <!-- 输入搜索内容的input -->
        <el-col :span="6"
          ><el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            class="input-with-select"
            clearable
            @clear="selectGoodsData"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="selectGoodsData"
            ></el-button> </el-input
        ></el-col>
        <el-col :span="4"></el-col>
        <!-- 添加商品按钮 -->
        <el-button type="primary" @click="goAddpage">添加商品</el-button>
      </el-row>
      <!-- 商品列表表格 -->
      <template>
        <el-table :data="obtainGoodsListData" border style="width: 100%">
          <!-- 索引列 -->
          <el-table-column type="index" label="#"> </el-table-column>
          <el-table-column prop="goods_name" label="商品名称" width="800px">
          </el-table-column>
          <el-table-column prop="goods_price" label="商品价格(元)">
          </el-table-column>
          <el-table-column prop="goods_weight" label="商品重量">
          </el-table-column>
          <el-table-column prop="add_time" label="创建时间">
            <template v-slot:default="scope">
              {{ scope.row.add_time | dateFormat }}
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template v-slot:default="scope">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
              ></el-button>
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="deleteGoodsData(scope.row.goods_id)"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <!-- 分页区域 -->
      <div class="block">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[5, 10, 15, 20]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination>
      </div>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // queryInfo 商品列表请求参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // 储存获取到的商品列表数据
      obtainGoodsListData: [],
      // 商品列表总数
      total: 0
    }
  },
  created() {
    // 获取商品列表数据
    this.getGoodsData()
  },
  methods: {
    // 获取商品列表数据
    async getGoodsData() {
      const data = await this.$http.get('goods', {
        params: this.queryInfo
      })
      this.obtainGoodsListData = data.goods
      this.total = data.total
    },
    // 每页显示数据发生变化时调用
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsData()
    },
    // 当前页码发生变化是调用
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getGoodsData()
    },
    // 点击所有 发送请求
    selectGoodsData() {
      this.getGoodsData()
    },
    // 点击删除 商品
    async deleteGoodsData(id) {
      const data = await this.$confirm(
        '此操作将永久删除该商品, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (data !== 'confirm') {
        this.$message.info('取消删除成功!')
        return
      }
      await this.$http.delete(`goods/${id}`)
      this.getGoodsData()
      this.$message.success('删除成功!')
    },
    // 点击添加商品，编程式跳转到其他页面
    goAddpage() {
      this.$router.push('/goods/add')
    }
  }
}
</script>
<style lang="less" scope>
.block {
  margin-top: 15px;
}
</style>
