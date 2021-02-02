<template>
  <div>
      <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    
    <el-card class="box-card" style="margin-top: 15px;">
      <div slot="header" class="clearfix">
        <div class="grid-content bg-purple">
            <el-alert
                title="只能选择三级分类"
                type="warning" :closable="false">
            </el-alert>

            <el-row style="margin:15px 0px;">
                <el-col>
                    <span>请选择分类：</span>
                    <el-cascader
                    v-model="selectedCateList"
                    :options="cateList"
                    :props="cascaderProps"
                    @change="handleChange">
                    </el-cascader>
                </el-col>
                <el-col>
                    <el-tabs v-model="activeName" @tab-click="handleTagClick">
                        <el-tab-pane label="动态参数" name="many">
                            <div class="grid-content bg-purple">
                                <el-button type="primary" @click="toAddParam" :disabled="selectedCateList.length != 3 ? true : false" >添加动态参数</el-button>
                            </div>

                            <el-table :data="cateParamList"> 

                                <el-table-column  type="expand">
                                    <template v-slot="scope">
                                        <el-tag
                                        :key="tag"
                                        v-for="tag in scope.row.attr_vals"
                                        closable
                                        :disable-transitions="false"
                                        @close="handleCloseTag(tag, scope)">
                                        {{tag}}
                                        {{scope.attr_name}}
                                        </el-tag>

                                        <el-input
                                        class="input-new-tag"
                                        v-if="inputVisible"
                                        v-model="inputValue"
                                        ref="saveTagInput"
                                        size="small"
                                        @keyup.enter.native="handleInputConfirm(scope)"
                                        @blur="handleInputConfirm(scope)"
                                        >
                                        </el-input>
                                        <el-button v-else class="button-new-tag" size="small" @click="showInput">+ New Tag</el-button>
                                    </template>
                                </el-table-column>

                                <el-table-column type="index">
                                </el-table-column>

                                <el-table-column
                                prop="attr_name"
                                label="参数名称">
                                </el-table-column>


                                <el-table-column label="操作" width="500px">
                                    <template v-slot="scope">
                                        <el-button type="primary" icon="el-icon-edit" round @click="toEditUser(scope.row.id)">编辑</el-button>
                                        <el-button type="danger" icon="el-icon-delete" round @click="deleteUser(scope.row.id)" >删除</el-button>
                                        <el-button type="primary" icon="el-icon-setting" round @click="toManagerRole(scope.row)" >分配角色</el-button>
                                    </template>
                                </el-table-column>

                            </el-table>
                        </el-tab-pane>


                        <el-tab-pane label="静态参数" name="only">
                            <el-button type="primary" :disabled="selectedCateList.length != 3 ? true : false" @click="toAddAttr">添加动态属性</el-button>

                            <el-table :data="cateAttrList">
                                <el-table-column type="index">
                                </el-table-column>

                                <el-table-column
                                prop="attr_name"
                                label="参数名称">
                                </el-table-column>


                                <el-table-column label="操作" width="500px">
                                    <template v-slot="scope">
                                        <el-button type="primary" icon="el-icon-edit" round @click="toEditParam(scope.row.id)">编辑</el-button>
                                        <el-button type="danger" icon="el-icon-delete" round @click="deleteUser(scope.row.id)" >删除</el-button>
                                        <el-button type="primary" icon="el-icon-setting" round @click="toManagerRole(scope.row)" >分配角色</el-button>
                                    </template>
                                </el-table-column>

                            </el-table>
                        </el-tab-pane>
                    </el-tabs>
                </el-col>
            </el-row>
        </div>
      </div>
    </el-card>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="addParamOrAttrDialog"
      width="30%"
      @close="closeFormHandle">
        <el-form :model="addParamOrAttrForm" :rules="addParamOrAttrRules" ref="addParamOrAttrFormRef">

            <el-form-item label="分类名称" prop="attr_name">
                <el-input v-model="addParamOrAttrForm.attr_name"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addParamOrAttrDialog = false">取 消</el-button>
            <el-button type="primary" @click="handleAddParamOrAttr">确 定</el-button>
        </span>
    </el-dialog>

    <!-- <el-dialog
      :title="修改动态参数"
      :visible.sync="editParamOrAttrDialog"
      width="30%"
      @close="closeFormHandle">
        <el-form :model="addParamOrAttrForm" :rules="addParamOrAttrRules" ref="addParamOrAttrFormRef">

            <el-form-item label="分类名称" prop="attr_name">
                <el-input v-model="addParamOrAttrForm.attr_name"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addParamOrAttrDialog = false">取 消</el-button>
            <el-button type="primary" @click="handleAddParamOrAttr">确 定</el-button>
        </span>
    </el-dialog> -->

  </div>
</template>

<script>
  export default {
     data() {
      return {
          cateList:[],
          selectedCateList:[],
          //级联选项框的配置参数
          cascaderProps:{
            label:'cat_name', 
            children:'children', 
            value:'cat_id', 
            expandTrigger: 'hover'
           },
           //当前活跃的标签页
           activeName:'many',
           cateAttrList:[],
           cateParamList:[],
           addParamOrAttrDialog:false,
           dialogTitle:'',

           editParamOrAttrDialog:false,
           editDialogTitle:'',
           
           addParamOrAttrForm:{
               attr_name:'',
               attr_sel:this.activeName,
               attr_vals:''
           },
           addParamOrAttrRules: {
            attr_name: [
                { required: true, message: '参数名称不能为空', trigger: 'blur' },
            ]
        },
        inputVisible: false,
        inputValue: ''
      }
    },
    methods: {
        async getCategoriesList()
        {
            const res = await this.$http.get('categories')
            console.log(res)
            if(res.meta.status != 200)
            {
                this.$message.error("获取列表失败!")
            }
            else
            {
                this.cateList = res.data
            }
        },
        //级联选择框 改变事件
        handleChange()
        {
            this.getCateAttrList();
        },
        //切换标签页事件
        handleTagClick()
        {
            this.getCateAttrList();
        },
        //获取分类id
        getSelectCateId()
        {
            if(this.selectedCateList.length == 3)
            {
                return this.selectedCateList[2];
            }
            else
            {
                return null;
            }
        },
        async getCateAttrList()
        {
            if(this.selectedCateList.length != 3)
            {
                this.selectedCateList = [];
                this.cateParamList = [];
                this.cateAttrList = [];
                return;
            }

            const cateId = this.getSelectCateId();
            if(cateId == null)
            {
                this.$message.error("选择的分类不符合")
                return;
            }
            
            const res = await this.$http.get(`categories/${cateId}/attributes`, {params:{sel:this.activeName}})
            if(res.meta.status != 200)
            {
                this.$message.error("失败!")
            }
            else
            {

                res.data.forEach(item => {
                    item.attr_vals = item.attr_vals.split(",");
                })

                if(this.activeName == 'many')
                {
                    this.cateParamList = res.data;
                }
                else
                {
                    this.cateAttrList = res.data;
                }

            }
        },
        toAddParam()
        {
            this.dialogTitle = '添加动态参数'
            this.addParamOrAttrDialog = true;
        },
        toAddAttr()
        {
            this.dialogTitle = '添加静态属性'
            this.addParamOrAttrDialog = true;
        },
        closeFormHandle()
        {
            this.$refs.addParamOrAttrFormRef.resetFields();
        },
        handleAddParamOrAttr()
        {
            this.$refs.addParamOrAttrFormRef.validate(async valid => {
                if(valid)
                {
                    const cateId = this.getSelectCateId();
                    if(cateId == null)
                    {
                        this.$message.error("选择的分类不符合")
                        return;
                    }

                    const res = await this.$http.post(`categories/${cateId}/attributes`,{attr_name:this.addParamOrAttrForm.attr_name,
                        attr_sel:this.activeName
                    })
                    
                    if(res.meta.status != 201)
                    {
                        this.$message.error("添加失败!")
                        return
                    }
                    else
                    {
                        this.$message.success("添加成功!")
                        this.addParamOrAttrDialog = false;
                        this.getCateAttrList();
                    }
                }
                else
                {
                    return;
                }
            })
        },
        //去修改动态参数
        toEditParam()
        {
            
        },
        showInput() {
        this.inputVisible = true;
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },
      async handleInputConfirm(data) {
        let inputValue = this.inputValue;
        if (inputValue) {
            data.row.attr_vals.push(inputValue);

            const cateId = this.getSelectCateId();
            if(cateId == null)
            {
                this.$message.error("选择的分类不符合")
                return;
            }

            const attr_vals = data.row.attr_vals.join(',')
            const res = await this.$http.put(`categories/${cateId}/attributes/${data.row.attr_id}`, 
            {attr_name:data.row.attr_name, attr_sel:this.activeName, attr_vals:attr_vals});
            if(res.meta.status != 200)
            {
                this.$message.error("添加失败!")
                return
            }
            else
            {
                this.$message.success("添加成功!")
            }
        }
        this.inputVisible = false;
        this.inputValue = '';
      },
      async handleCloseTag(tag, data)
      {
        var index = data.row.attr_vals.indexOf(tag);
        if (index > -1) 
        {
            data.row.attr_vals.splice(index, 1);
        }
        const attr_vals = data.row.attr_vals.join(',')

        const cateId = this.getSelectCateId();
        if(cateId == null)
        {
            this.$message.error("选择的分类不符合")
            return;
        }
        const res = await this.$http.put(`categories/${cateId}/attributes/${data.row.attr_id}`, 
        {attr_name:data.row.attr_name, attr_sel:this.activeName, attr_vals:attr_vals});
        if(res.meta.status != 200)
        {
            this.$message.error("删除失败!")
            return
        }
        else
        {
            this.$message.success("删除成功!")
        }
      }
    },
    created()
    {
        this.getCategoriesList();
    }
  }
</script>

<style>
.el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>
