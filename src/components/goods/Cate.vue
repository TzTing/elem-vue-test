<template>
  <div>
      <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card" style="margin-top: 15px;">
      <div slot="header" class="clearfix">
          <el-row :gutter="20">
          <el-col :span="6">
            <div class="grid-content bg-purple">
              <el-button type="primary" @click="toAddCate">添加分类</el-button>
            </div>
          </el-col>
        </el-row>


        <el-table :data="cateList" style="width: 100%;margin-bottom: 20px; margin-top: 15px;"
            row-key="cat_id" border 
            :tree-props="{children: 'children'}">
            <el-table-column prop="cat_name" label="分类名称">
            </el-table-column>

            <el-table-column prop="cat_name" label="是否有效">
                <template v-slot="scope">
                    <el-tag type="success" v-if="scope.row.cat_deleted != true">有效</el-tag>
                    <el-tag type="danger" v-else>无效</el-tag>
                </template>
            </el-table-column>


            <el-table-column prop="cat_level" label="排序">
                <template v-slot="scope">
                    <el-tag v-if="scope.row.cat_level == 0">一级</el-tag>
                    <el-tag type="success" v-else-if="scope.row.cat_level == 1">二级</el-tag>
                    <el-tag type="warning" v-else>三级</el-tag>
                </template>
            </el-table-column>


            <el-table-column label="操作">
                <template v-slot="scope">
                    <el-button type="primary" icon="el-icon-edit" round @click="toEditCate(scope.row)">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" round @click="deleteCate(scope.row)" >删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="queryCateParam.pagenum"
            :page-sizes="[5, 10, 20, 200]"
            :page-size="queryCateParam.pagesize"
            layout="total,sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
      </div>
    </el-card>

     <el-dialog
      title="添加分类"
      :visible.sync="addCateDialog"
      width="30%"
      @close="handleCloseCateDialog">
        <el-form :model="addCateForm" :rules="addCateRules" ref="addCateFormRef">

            <el-form-item label="分类名称" prop="cat_name">
                <el-input  v-model="addCateForm.cat_name" placeholder="请输入内容" prefix-icon="el-icon-user"></el-input>
            </el-form-item>

            <el-form-item label="父级分类">
                <el-cascader
                    v-model="addSelectCate"
                    :options="cateListLevelTwo" clearable
                    @change="handleChange"
                    :props="cascaderProps">
                </el-cascader>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addCateDialog = false">取 消</el-button>
            <el-button type="primary" @click="handleAddCate">确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
     data() {
      return {
          //商品分类数据列表
          cateList:[],
          //商品分类数据列表(只有前两级)
          cateListLevelTwo:[],
          //商品分页信息
          queryCateParam:{
              type:3,
              pagenum:1,
              pagesize:5
          },
          total:0,
          //添加分类页面对话框
          addCateDialog:false,

          //添加分类表单
          addCateForm:{
            cat_name:'',
            cat_pid:0,
            cat_level:0
          },
          addCateRules: {
            cat_name: [
                { required: true, message: '请输分类名称', trigger: 'blur' },
            ]
        },
        //当前选项框选中的内容
        addSelectCate:[],
        //级联选项框的配置参数
        cascaderProps:{
            label:'cat_name', 
            children:'children', 
            value:'cat_id', 
            checkStrictly: true
        }
      }
    },
    methods: {
        async getCategoriesList()
        {
            const res = await this.$http.get('categories', {params:this.queryCateParam})
            if(res.meta.status != 200)
            {
                this.$message.error("获取列表失败!")
            }
            else
            {
                this.cateList = res.data.result
                this.total = res.data.total;
                this.pagenum = res.data.pagenum;
            }
        },
        handleSizeChange(newSize)
        {
            //改变当前显示页数的事件
            this.queryCateParam.pagesize = newSize;
            this.getCategoriesList();
        },
        handleCurrentChange(newCurrentSize)
        {
            //改变当前选中页数的事件
            this.queryCateParam.pagenum = newCurrentSize;
            this.getCategoriesList();
        },
        toEditCate(cate)
        {
            //去编辑商品分类页面
            this.$message.success(cate.cat_name)
        },
        deleteCate(cate)
        {
            //删除商品分类
            this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
            }).then(async () => {
                const res = await this.$http.delete(`categories/${cate.cat_id}`)
                console.log(res)
                if(res.meta.status != 200)
                {
                    this.$message.error("删除失败!")
                }
                else
                {
                    this.$message({
                        type: 'success',
                        message: '删除成功!'
                    });
                    this.getCategoriesList();
                }
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });          
            });
        },
        //去添加分类对话框页面
        async toAddCate()
        {
            const res = await this.$http.get('categories', {params:{type:2}})
            if(res.meta.status != 200)
            {
                this.$message.error("获取列表失败!")
            }
            else
            {
                this.cateListLevelTwo = res.data
            }
            this.addCateDialog = true;
        },
        handleChange()
        {
            //处理关联选择框改变事件的监听
            //如果选择了至少一级菜单
            if(this.addSelectCate != null && this.addSelectCate.length > 0)
            {
                //如果只选择了一级选项
                if(this.addSelectCate.length == 1)
                {
                    this.addCateForm.cat_pid = this.addSelectCate[0]
                    this.addCateForm.cat_level = 1;
                }
                //如果只选择了一级选项
                else if(this.addSelectCate.length == 2)
                {
                    this.addCateForm.cat_pid = this.addSelectCate[1]
                    this.addCateForm.cat_level = 2;
                }
            }
            else
            {
                //如果没选择
                this.addCateForm.cat_pid = 0;
                this.addCateForm.cat_level = 0;
            }
        },
        handleCloseCateDialog()
        {
            //关闭添加分类对话框后执行的事件
            this.$refs.addCateFormRef.resetFields()
            this.addSelectCate = []
            this.addCateForm = {
                cat_name:'',
                cat_pid:0,
                cat_level:0
            }
        },
        //执行添加分类
        handleAddCate()
        {
            //添加前进行表单验证
            this.$refs.addCateFormRef.validate(async valid => {
                if(valid)
                {
                    const res = await this.$http.post('categories', this.addCateForm)
                    if(res.meta.status != 201)
                    {
                        this.$message.error("添加失败!")
                        return
                    }
                    else
                    {
                        this.$message.success("添加成功!")
                        this.addCateDialog = false;
                        this.getCategoriesList();
                    }
                }
                else
                {
                    return;
                }
            })
            console.log(this.addSelectCate)
            console.log(this.addCateForm)
        }
    },
    created()
    {
        this.getCategoriesList();
    }
  }
</script>

<style>
</style>
