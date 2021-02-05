<template>
  <div>
      <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card" style="margin-top: 15px;">
      <div slot="header" class="clearfix">
          <el-row :gutter="20">
          <el-col :span="5">
            <el-input placeholder="请输入内容" v-model="goodsQueryParams.query" clearable @clear="clear">
                <el-button slot="append" icon="el-icon-search" @click="goodsSearch"></el-button>
            </el-input>
          </el-col>

          <el-col :span="1">
            <div class="grid-content bg-purple">
              <el-button type="primary" @click="toAddGood">添加商品</el-button>
            </div>
          </el-col>
        </el-row>

        <el-table :data="goodsList" style="width: 100%;margin-bottom: 20px; margin-top: 15px;"
            row-key="goods_id" border >
            
            <el-table-column type="index">
            </el-table-column>

            <el-table-column prop="goods_name" label="商品名称">
            </el-table-column>

            <el-table-column prop="goods_price" label="价格">
            </el-table-column>

            <el-table-column prop="goods_number" label="数量">
            </el-table-column>

            <el-table-column prop="goods_weight" label="重量">
            </el-table-column>

            <el-table-column prop="add_time" label="添加时间">
                <template v-slot="scope">
                    {{scope.row.add_time | dataFilter}}
                </template>
            </el-table-column>

            <el-table-column prop="is_promote" label="是否是热销品">
                <template v-slot="scope">
                    <el-tag type="success" v-if="scope.row.is_promote == true">是</el-tag>
                    <el-tag type="danger" v-else>否</el-tag>
                </template>
            </el-table-column>


            <el-table-column label="操作">
                <template v-slot="scope">
                    <el-button type="primary" icon="el-icon-edit" round @click="toEditCate(scope.row)">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" round @click="deleteGood(scope.row)" >删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="goodsQueryParams.pagenum"
            :page-sizes="[5, 10, 20, 200]"
            :page-size="goodsQueryParams.pagesize"
            layout="total,sizes, prev, pager, next, jumper"
            :total="goodsTotal">
          </el-pagination>
      </div>
    </el-card>

  </div>
</template>

<script>
export default {
  data() {
    return {
      //商品类表
      goodsList: [],
      //商品列表的查询条件
      goodsQueryParams: {
        query: "",
        pagenum: 1,
        pagesize: 5
      },
      goodsTotal: 0
    };
  },
  methods: {
    //获取商品列表
    async getGoodsList() {
      const res = await this.$http.get("goods", {
        params: this.goodsQueryParams
      });
      if (res.meta.status != 200) {
        this.$message.error("获取列表失败!");
      } else {
        this.goodsList = res.data.goods;
        this.goodsTotal = res.data.total;
      }
    },
    //每页大小改变事件
    handleSizeChange(newSize) {
      // console.log(newSize);

      this.goodsQueryParams.pagesize = newSize;
      this.getGoodsList();
    },
    //当前页改变事件
    handleCurrentChange(newCurrentNum) {
      // console.log(newCurrentNum);

      this.goodsQueryParams.pagenum = newCurrentNum;
      this.getGoodsList();
    },
    //商品搜索
    goodsSearch() {
      // console.log(this.goodsQueryParams)
      this.getGoodsList();
    },
    clear() {
      this.getGoodsList();
    },
    async deleteGood(data) {

      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          const res = await this.$http.delete("goods/" + data.goods_id);
          if (res.meta.status != 200) {
            this.$message.error("删除失败!");
          } else {
            this.$message({
              type: "success",
              message: "删除成功!"
            });
            this.getGoodsList();
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    //去添加商品页面
    toAddGood()
    {
        this.$router.push('/goods/add')
    }
  },
  created() {
    this.getGoodsList();
  },
  filters: {
    //事件过滤器
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
