<template>
    <div>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>添加商品</el-breadcrumb-item>
      </el-breadcrumb>


      <el-card class="box-card" style="margin-top: 15px;">
      <div slot="header" class="clearfix">
        <el-alert
          title="消息提示的文案"
          type="info" :closable="false" center>
        </el-alert>
        <el-steps :active="active" align-center finish-status="success" class="steps">
          <el-step title="基本信息"></el-step>
          <el-step title="商品参数"></el-step>
          <el-step title="商品属性"></el-step>
          <el-step title="商品图片"></el-step>
          <el-step title="商品内容"></el-step>
          <el-step title="完成"></el-step>
        </el-steps>

        <el-form :model="addGoodForm" :rules="addGoodRules" ref="addGoodFormRef" label-width="100px" label-position="top" class="demo-ruleForm">
          <el-tabs tab-position="left" v-model="activeName" @tab-click="handleClick" :stretch='true' :before-leave='beforeTabsLeave'>
            <el-tab-pane label="基本信息" name="0">
              <el-form-item label="商品名称" prop="goods_name">
                <el-input v-model="addGoodForm.goods_name"></el-input>
              </el-form-item>
              <el-form-item label="商品价格" prop="goods_price">
                <el-input v-model="addGoodForm.goods_price"></el-input>
              </el-form-item>
              <el-form-item label="商品重量" prop="goods_weight">
                <el-input v-model="addGoodForm.goods_weight"></el-input>
              </el-form-item>
              <el-form-item label="商品数量" prop="goods_number">
                <el-input v-model="addGoodForm.goods_number"></el-input>
              </el-form-item>
              <el-form-item label="商品分类" prop="goods_cat">
                <el-cascader
                  v-model="addGoodForm.goods_cat"
                  :options="cateList"
                  :props="cascaderProps"
                  @change="handleChange">
                </el-cascader>
              </el-form-item>
            </el-tab-pane>

            <el-tab-pane label="商品参数" name="1">
              <el-form-item v-for="item in manyTabDate" :key="item.attr_id" :label="item.attr_name">
                <div class='selectmany'>
                <el-checkbox v-for="(item2, index) in item.attr_vals" :label="item2" border :key="index"></el-checkbox>
              </div>
              </el-form-item>
            </el-tab-pane>

            <el-tab-pane label="商品属性" name="2">
              <el-form-item v-for="item in onlyTabDate" :label="item.attr_name" :key="item.attr_id">
                <el-input v-model="item.attr_vals"></el-input>
              </el-form-item>
            </el-tab-pane>

            <el-tab-pane label="商品图片" name="3">
              <el-form-item label="活动名称" prop="name">
                <el-upload
                  class="upload-demo"
                  action="http://timemeetyou.com:8889/api/private/v1/upload"
                  :on-preview="handlePreview"
                  :on-remove="handleRemove"
                  :on-success="uploadSuccess"
                  :file-list="fileList"
                  :before-upload='beforeUpload'
                  list-type="picture" :headers="headerObj">
                  <el-button size="small" type="primary">点击上传</el-button>
                  <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                </el-upload>
              </el-form-item>
              <el-dialog :visible.sync="imageDialog">
                <img width="100%" :src="dialogImageUrl" alt="">
              </el-dialog>
            </el-tab-pane>

            <el-tab-pane label="商品内容" name="4">
              <el-form-item>
                <quill-editor
                ref="myQuillEditor"
                v-model="addGoodForm.goods_introduce"
                />
              </el-form-item>
              <el-button type="primary" @click="addGood">添加商品</el-button>
            </el-tab-pane>
          </el-tabs>
        </el-form>
        

      </div>
    </el-card>
    </div>
</template>

<script>
export default {
  data() {
    return {
      active: 0,
      activeName: "0",
      addGoodForm: {
        goods_name: "",
        goods_price: "",
        goods_number: "",
        goods_weight: "",
        //选择的商品分类
        goods_cat: [],
        pics: [],
        attrs: [],
        goods_introduce:''
      },
      addGoodRules: {
        goods_name: [
          { required: true, message: "商品名称不能为空", trigger: "blur" }
        ],
        goods_price: [
          { required: true, message: "商品价格不能为空", trigger: "blur" }
        ],
        goods_weight: [
          { required: true, message: "商品重量不能为空", trigger: "blur" }
        ],
        goods_number: [
          { required: true, message: "商品数量不能为空", trigger: "blur" }
        ],
        goods_cat: [
          { required: true, message: "商品分类不能为空", trigger: "change" }
        ]
      },
      //商品分类数据
      cateList: [],
      //级联的配置属性
      cascaderProps: {
        label: "cat_name",
        children: "children",
        value: "cat_id",
        expandTrigger: "hover"
      },
      //商品参数数据
      manyTabDate: [],
      //商品属性数据
      onlyTabDate: [],
      //文件列表
      fileList: [],
      dialogImageUrl: '',
      imageDialog: false,
      headerObj:{
        Authorization: window.sessionStorage.getItem('token')
      },
      //富文本配置信息
      editorOption: {
          // Some Quill options...
        }
    };
  },
  methods: {
    //切换标签面板的事件
    handleClick() {
      this.active = parseInt(this.activeName);
      if (this.activeName == "1") {
        this.getParamOrAttr("many");
      } else if (this.activeName == "2") {
        this.getParamOrAttr("only");
      }
    },
    async getCategoriesList() {
      const res = await this.$http.get("categories");
      if (res.meta.status != 200) {
        this.$message.error("获取列表失败!");
      } else {
        this.cateList = res.data;
      }
    },
    //级联选择框 改变事件
    handleChange() {
      if (this.addGoodForm.goods_cat.length != 3) {
        this.addGoodForm.goods_cat = [];
        return;
      }
    },
    beforeTabsLeave(newActiveName, oldActiveName) {
      if (oldActiveName === "0" && newActiveName != "0") {
        if (this.addGoodForm.goods_cat.length != 3) {
          this.$message.error("请先选择商品分类!");
          return false;
        }
      }
    },
    //根据指定参数获取动态参数或者静态属性
    async getParamOrAttr(sel) {
      if (sel == null || sel == "") {
        return;
      }

      const cateId = this.getCataId();
      if (cateId == null) {
        return;
      }
      const res = await this.$http.get(`categories/${cateId}/attributes`, {
        params: { sel: sel }
      });
      if (res.meta.status != 200) {
        this.$message.error("失败!");
      } else {
        console.log(res.data);

        if (sel == "many") {
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals.split(",");
          });
          this.manyTabDate = res.data;
        } else if (sel == "only") {
          this.onlyTabDate = res.data;
        } else {
          return;
        }
      }
    },
    //获取选择分类的id
    getCataId() {
      if (
        this.addGoodForm.goods_cat != null &&
        this.addGoodForm.goods_cat.length == 3
      ) {
        return this.addGoodForm.goods_cat[2];
      }
      return null;
    },
    handleRemove(file, fileList) {
      // console.log(file, fileList);
      //删除表单中对应的文件
      this.addGoodForm.pics.splice(
        this.addGoodForm.pics.indexOf(file.response.data.tmp_path),1)
      console.log(this.addGoodForm.pics);
      
    },
    handlePreview(file) {
      this.dialogImageUrl = file.url;
      this.imageDialog = true;
    },
    //文件上传成功的回调
    uploadSuccess(file)
    {
      if(file.meta.status == 200)
      {
        this.addGoodForm.pics.push({pic:file.data.tmp_path});
      }
    },
    //文件上传前的回调
    beforeUpload(file)
    {
      
      //限制只能上传图片
      if(file.type == "image/jpg" || file.type == "image/png" || file.type == "image/jpeg")
      {
        return true;
      }
      this.$message.error("只能上传jpg/png文件")
      return false;
    },
    addGood()
    {
      this.$refs.addGoodFormRef.validate(async valid => {
        if(!valid)
        {
          this.$message.error("请录入必要信息")
          return;
        }
        this.addGoodForm.goods_cat = this.addGoodForm.goods_cat.join(',')
      console.log(this.addGoodForm);
      })
    }
  },
  created() {
    this.getCategoriesList();
  }
};
</script>

<style>
.steps {
  margin-top: 10px;
  margin-bottom: 20px;
}

.selectmany {
  margin-top: 40px;
  margin-left: 40px;
}

.ql-editor{
  height: 200px;
}
</style>
