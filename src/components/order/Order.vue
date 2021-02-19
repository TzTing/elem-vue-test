<template>
    <div>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>订单管理</el-breadcrumb-item>
        <el-breadcrumb-item>订单列表</el-breadcrumb-item>
      </el-breadcrumb>


      <el-card class="box-card" style="margin-top: 15px;">
      <div slot="header" class="clearfix">
        <el-row :gutter="20">
            <el-col :span="5">
            <el-input placeholder="请输入内容" v-model="ordersQueryParams.query" clearable @clear="clear">
                <el-button slot="append" icon="el-icon-search" @click="ordersSearch"></el-button>
            </el-input>
            </el-col>
        </el-row>

    <el-table :data="ordersList" style="width: 100%;margin-bottom: 20px; margin-top: 15px;"
        row-key="goods_id" border >
        
        <el-table-column type="index">
        </el-table-column>

        <el-table-column prop="order_number" label="订单编号">
        </el-table-column>

        <el-table-column prop="order_price" label="价格">
        </el-table-column>

        <el-table-column prop="order_pay" label="是否付款">
          <template v-slot="scope">
            <el-tag type="success" v-if="scope.row.order_pay == '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="is_send" label="是否发货">
        </el-table-column>

        <el-table-column prop="create_time" label="下单时间">
            <template v-slot="scope">
                {{scope.row.create_time | dataFilter}}
            </template>
        </el-table-column>


        <el-table-column label="操作">
            <template v-slot="scope">
                <el-button type="primary" icon="el-icon-edit" round @click="toEditCate(scope.row)">编辑</el-button>
                <el-button type="primary" icon="el-icon-truck" round @click="goodFlow(scope.row)" >物流进度</el-button>
            </template>
        </el-table-column>
        </el-table>
        <el-pagination
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="ordersQueryParams.pagenum"
            :page-sizes="[5, 10, 20, 200]"
            :page-size="ordersQueryParams.pagesize"
            layout="total,sizes, prev, pager, next, jumper"
            :total="ordersTotal">
          </el-pagination>
      </div>
    </el-card>

    <el-dialog
      title="物流信息"
      :visible.sync="goodFlowDialog"
      width="30%">
      <el-timeline>
      <el-timeline-item
        v-for="(activity, index) in goodFlowDate"
        :key="index"
        :color="index == 0 ? '#0bbd87' : '#E4E7ED'"
        :timestamp="activity.ftime">
        {{activity.context}}
      </el-timeline-item>
  </el-timeline>
        <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="goodFlowDialog = false">确 定</el-button>
        </span>
    </el-dialog>
    </div>
</template>

<script>
export default {
  data() {
    return {
      ordersList: [],
      //订单列表的查询条件
      ordersQueryParams: {
        query: "",
        pagenum: 1,
        pagesize: 5,
        user_id: "",
        pay_status: "",
        is_send: "",
        order_fapiao_title: "",
        order_fapiao_company: "",
        order_fapiao_content: "",
        consignee_addr: ""
      },
      ordersTotal: 0,
      goodFlowDialog: false,
      // goodFlowDate:[]
      goodFlowDate:[
    {
      "time": "2018-05-10 09:39:00",
      "ftime": "2018-05-10 09:39:00",
      "context": "已签收,感谢使用顺丰,期待再次为您服务",
      "location": ""
    },
    {
      "time": "2018-05-10 08:23:00",
      "ftime": "2018-05-10 08:23:00",
      "context": "[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件",
      "location": ""
    },
    {
      "time": "2018-05-10 07:32:00",
      "ftime": "2018-05-10 07:32:00",
      "context": "快件到达 [北京海淀育新小区营业点]",
      "location": ""
    },
    {
      "time": "2018-05-10 02:03:00",
      "ftime": "2018-05-10 02:03:00",
      "context": "快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]",
      "location": ""
    },
    {
      "time": "2018-05-09 23:05:00",
      "ftime": "2018-05-09 23:05:00",
      "context": "快件到达 [北京顺义集散中心]",
      "location": ""
    },
    {
      "time": "2018-05-09 21:21:00",
      "ftime": "2018-05-09 21:21:00",
      "context": "快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]",
      "location": ""
    },
    {
      "time": "2018-05-09 13:07:00",
      "ftime": "2018-05-09 13:07:00",
      "context": "顺丰速运 已收取快件",
      "location": ""
    },
    {
      "time": "2018-05-09 12:25:03",
      "ftime": "2018-05-09 12:25:03",
      "context": "卖家发货",
      "location": ""
    },
    {
      "time": "2018-05-09 12:22:24",
      "ftime": "2018-05-09 12:22:24",
      "context": "您的订单将由HLA（北京海淀区清河中街店）门店安排发货。",
      "location": ""
    },
    {
      "time": "2018-05-08 21:36:04",
      "ftime": "2018-05-08 21:36:04",
      "context": "商品已经下单",
      "location": ""
    }
  ]
    };
  },
  methods: {
    //获取订单列表
    async getOrdersList() {
      const res = await this.$http.get("orders", {
        params: this.ordersQueryParams
      });
      if (res.meta.status != 200) {
        this.$message.error("获取列表失败!");
      } else {
        this.ordersList = res.data.goods;
        this.ordersTotal = res.data.total;
        // console.log(this.ordersList)
      }
    },
    //每页大小改变事件
    handleSizeChange(newSize) {
      // console.log(newSize);

      this.ordersQueryParams.pagesize = newSize;
      this.getOrdersList();
    },
    //当前页改变事件
    handleCurrentChange(newCurrentNum) {
      // console.log(newCurrentNum);

      this.ordersQueryParams.pagenum = newCurrentNum;
      this.getOrdersList();
    },
    clear() {
      this.getOrdersList();
    },
    ordersSearch() {
      console.log(this.ordersQueryParams);
      this.getOrdersList();
    },
    //查看物流进度
    async goodFlow() {
      //获取物流信息
      /* const res = await this.$http.get("/kuaidi/1106975712662");
      if (res.meta.status != 200) {
        this.$message.error("获取物流进度失败!");
      } else {
        console.log(res)
        this.goodFlowDate = res.data
      } */
      this.goodFlowDialog = true;
    }
  },
  created() {
    this.getOrdersList();
  },
  filters: {
    dataFilter(date) {
      var unixTimestamp = new Date(date * 1000);
      var commonTime = unixTimestamp.toLocaleString();
      return commonTime;
    }
  }
};
</script>

<style>
</style>
