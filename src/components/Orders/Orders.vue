<template>
  <div>
    <!-- 这是头部面包屑部分 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 输入框区域 -->
      <el-row>
        <el-col :span="9">
          <div style="margin-top: 15px;">
            <el-input placeholder="请输入内容" v-model="queryInfo.query">
              <el-button slot="append" icon="el-icon-search"></el-button>
            </el-input>
          </div>
        </el-col>
      </el-row>
      <!-- tab表格区域 -->
      <template>
        <el-table :data="orderListData" border style="width: 100%">
          <!-- 索引列 -->
          <el-table-column type="index" label="#"></el-table-column>

          <el-table-column
            prop="order_number"
            label="订单编号"
            width="400px"
          ></el-table-column>
          <el-table-column
            prop="order_price"
            label="订单价格"
          ></el-table-column>
          <el-table-column prop="pay_status" label="是否付款">
            <template v-slot:default="scope">
              <el-tag type="danger" v-if="scope.row.pay_status === '0'"
                >未付款</el-tag
              >
              <el-tag type="success" v-else>已付款</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="is_send" label="是否发货"></el-table-column>
          <el-table-column label="下单时间">
            <template v-slot:default="scope">
              {{ scope.row.create_time | dateFormat }}
            </template></el-table-column
          >
          <el-table-column prop="date" label="操作">
            <!-- 编辑  地址 按钮区域 -->
            <template>
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="changeAddress"
              ></el-button>
              <el-button
                type="success"
                icon="el-icon-location"
                size="mini"
                @click="LogisticsDynamic"
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
          :page-sizes="[5, 10, 15]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination>
      </div>
      <!-- 修改地址对话框区域 -->
      <el-dialog
        title="提示"
        :visible.sync="dialogVisible"
        width="50%"
        :before-close="handleClose"
        @close="addressDialogClosed"
      >
        <!-- form 表单验证区域 -->
        <el-form
          :model="ordersRuleForm"
          :rules="ordersFormRules"
          ref="ordersFormRef"
          label-width="100px"
        >
          <el-form-item label="省市区/县" prop="region1">
            <el-cascader
              :options="cityData"
              v-model="ordersRuleForm.region1"
            ></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="region2">
            <el-input v-model="ordersRuleForm.region2"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="dialogVisible = false"
            >确 定</el-button
          >
        </span>
      </el-dialog>
      <!-- 物流信息对话框 -->
      <el-dialog
        title="物流信息"
        :visible.sync="logisticsStatus"
        width="50%"
        :before-close="logisticsClose"
      >
        <!-- 物流时间线 -->
        <el-timeline :reverse="reverse">
          <el-timeline-item
            v-for="(activity, index) in logisticsListData"
            :key="index"
            :timestamp="activity.time"
          >
            {{ activity.context }}
          </el-timeline-item>
        </el-timeline>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
import cityData from './citydata.js'
export default {
  data() {
    return {
      // 查询参数的数据
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // 订单数据列表
      orderListData: [],
      // 数据总条数
      total: 0,
      // 修改 对话框的状态值
      dialogVisible: false,
      // 表单数据储存
      ordersRuleForm: {
        region1: [],
        region2: ''
      },
      // 表单验证规则
      ordersFormRules: {
        region1: [
          { required: true, message: '请选择省市区县', trigger: 'blur' }
        ],
        region2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      cityData,
      // 物流对话框状态值
      logisticsStatus: false,
      // 物流信息数据
      logisticsListData: [],
      reverse: true
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    //   获取订单列表数据
    async getOrderList() {
      const data = await this.$http.get('orders', { params: this.queryInfo })
      this.orderListData = data.goods
      this.total = data.total
    },
    // 每页条数 发生变化 触发
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    // 当前页面发生变化触发
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getOrderList()
    },
    // 点击编辑 弹出编辑对话框
    changeAddress() {
      this.dialogVisible = true
    },
    // 对话框关闭 执行
    handleClose() {
      this.dialogVisible = false
    },
    // 对话框关闭执行
    addressDialogClosed() {
      this.$refs.ordersFormRef.resetFields()
    },
    // 点击获取物流动态
    async LogisticsDynamic() {
      this.logisticsStatus = true
      this.logisticsListData = await this.$http.get('/kuaidi/1106975712662')
    },
    // 关闭对话框执行
    logisticsClose() {
      this.logisticsStatus = false
    }
  }
}
</script>
<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
