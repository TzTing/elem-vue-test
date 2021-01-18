<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>活动管理</el-breadcrumb-item>
      <el-breadcrumb-item>活动列表</el-breadcrumb-item>
      <el-breadcrumb-item>活动详情</el-breadcrumb-item>
    </el-breadcrumb>
    <br>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="grid-content bg-purple">
              <el-input v-model="queryParams.query" clearable @clear="getUsers"></el-input>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="grid-content bg-purple">
              <el-button type="primary" @click="getUsers">搜索</el-button>
            </div>
          </el-col>

          <el-col :span="1">
            <div class="grid-content bg-purple">
              <el-button type="primary" @click="addDialog = true">添加用户</el-button>
            </div>
          </el-col>
        </el-row>
        <el-table :data="userList">
          <el-table-column type="index">
          </el-table-column>

            <el-table-column
              prop="username"
              label="用户名称">
            </el-table-column>

            <el-table-column
              prop="create_time"
              label="注册时间">
              <!-- <template v-slot="secop">
              </template> -->
            </el-table-column>

            <el-table-column
              prop="mobile"
              label="电话">
            </el-table-column>

            <el-table-column prop="mg_state" label="状态">
              <template v-slot="scope">
                <el-switch @change="updateState(scope.row)"
                  v-model="scope.row.mg_state">
                </el-switch>
              </template>
            </el-table-column>

            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button type="primary" icon="el-icon-edit" round @click="toEditUser(scope.row.id)"></el-button>
                <el-button type="danger" icon="el-icon-delete" round @click="deleteUser(scope.row.id)" ></el-button>
              </template>
            </el-table-column>

          </el-table>
          <el-pagination
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="queryParams.pagenum"
            :page-sizes="[5, 10, 20, 200]"
            :page-size="queryParams.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
      </div>
    </el-card>


    <el-dialog
      title="添加用户"
      :visible.sync="addDialog"
      :close-on-click-modal=false
      width="30%"
      @close="addFromClosed">
        <el-form :model="addForm" :rules="addRules" ref="addFormRef" v-loading="loading" element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0)">
      <el-form-item label="用户名" prop="username">
         <el-input  v-model="addForm.username" placeholder="请输入内容" prefix-icon="el-icon-user"></el-input>
       </el-form-item>
       <el-form-item label="密码" prop="password">
         <el-input  v-model="addForm.password" placeholder="请输入内容" prefix-icon="el-icon-key"></el-input>
       </el-form-item>
       <el-form-item label="邮箱" prop="email">
         <el-input  v-model="addForm.email" placeholder="请输入内容" prefix-icon="el-icon-key"></el-input>
       </el-form-item>
       <el-form-item label="手机号码" prop="mobile">
         <el-input  v-model="addForm.mobile" placeholder="请输入内容" prefix-icon="el-icon-key"></el-input>
       </el-form-item>

    </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialog = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>


    <el-dialog
      title="修改用户"
      :visible.sync="editDialog"
      :close-on-click-modal=false
      @close="editFromClosed"
      width="30%">

    <el-form :model="editForm" :rules="editRules" ref="editFormRef" v-loading="editLoading" element-loading-text="拼命加载中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0)">
          <el-form-item label="用户名" prop="username">
            <el-input  v-model="editForm.username" placeholder="请输入内容" prefix-icon="el-icon-user" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input  v-model="editForm.email" placeholder="请输入内容" prefix-icon="el-icon-key"></el-input>
          </el-form-item>
          <el-form-item label="手机号码" prop="mobile">
            <el-input  v-model="editForm.mobile" placeholder="请输入内容" prefix-icon="el-icon-key"></el-input>
          </el-form-item>
      </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="editDialog = false">取 消</el-button>
      <el-button type="primary" @click="editUser(editForm.id)">确 定</el-button>
  </span>
  </el-dialog>



  </div>
</template>

<script>
  export default {
     data() {
      return {
        userList:[],
        queryParams:{
          query:'',
          pagenum:1,
          pagesize:5
        },
        total:0,
        addDialog:false,
        addForm: {
          username: '',
          password: '',
          email: '',
          mobile: '',
        },
        addRules: {
          username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' }
          ],
          email: [
            { type: "email", message: '请输入正确的邮箱', trigger: ['blur', 'change'] }
          ],
          mobile: [
            { pattern: /^1[34578]\d{9}$/, message: '请输入正确的手机号', trigger: ['blur', 'change'] }
          ]
        },
        editDialog:false,
        editForm: {
          id: 0,
          username: '',
          role_id: 0,
          mobile: '',
          email: ''
        },
        editRules: {
          username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
          ],
          email: [
            { type: "email", message: '请输入正确的邮箱', trigger: ['blur', 'change'] }
          ],
          mobile: [
            { pattern: /^1[34578]\d{9}$/, message: '请输入正确的手机号', trigger: ['blur', 'change'] }
          ]
        },
        editLoading:false,
        loading: false
      }
    },
    methods: {
       async getUsers(){
        /* this.$http.get('/users').then(res=>{
          console.log(res)
        }) */

        const res = await this.$http.get('/users', {params:this.queryParams})
        // console.log(res)
        if(res.meta.status != 200)
        {
          this.$message.error("获取列表失败!")
        }
        else
        {
          // console.log(res.data.users)
         this.userList = res.data.users
         this.total = res.data.total;
         this.pagenum = res.data.pagenum;
        }
      },
      //删除用户
      async deleteUser(key)
      {
        this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const res = await this.$http.delete('/users/' + key)
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
            this.getUsers();
          }
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });

        
      },
      //去编辑用户
      async toEditUser(key)
      {
        this.editDialog = true;
        if(key != null && key != '')
        {
          const res = await this.$http.get(`users/${key}`)
          if(res.meta.status == 200)
          {
            this.editForm = res.data;
          }
        }
      },
      //编辑用户
      async editUser(key)
      {
        this.$refs.editFormRef.validate(async valid => {
          if(valid)
          {
            const res = await this.$http.put(`users/${key}`, this.editForm)
            if(res.meta.status == 200)
            {
               this.$message.success(res.meta.msg)
               this.getUsers()
               this.editDialog = false;
            }
            else
            {
              this.$message.error("更新失败!")
            }
          }
          else
          {
            return;
          }
        })
        //编辑
      },
      handleSizeChange(newSiez)
      {
        //改变当前显示页数的事件
        this.queryParams.pagesize = newSiez;
        this.getUsers();
      },
      handleCurrentChange(newCurrentSize)
      {
        //改变当前选中页数的事件
        this.queryParams.pagenum = newCurrentSize;
        this.getUsers();
      },
      //更新状态
      async updateState(newUser)
      {
        //跟更新用户状态
        this.$message.success(newUser + '')
        const res = await this.$http.put(`users/${newUser.id}/state/${newUser.mg_state}`)
        if(res.meta.status != 200)
        {
          this.$message.error("更新失败!")
        }
        else
        {
          this.$message.success("状态已更新")
        }
      },
      //搜索用户
      search()
      {
        this.getUsers();
      },

      //添加用户
      addUser()
      {
        this.loading = false;
        this.$refs.addFormRef.validate(async valid => {
          if(valid)
          {
            const res = await this.$http.post('users', this.addForm);
            if(res.meta.status == 201)
            {
              this.$message.success(res.meta.msg);
              this.addDialog = false;
              this.getUsers();
            }
            else
            {
              this.$message.error('添加失败');
            }
          }
          else
          {
            return;
          }
          this.loading = false
        });
        // this.$message.success('添加用户')
        // this.addDialog = false
      },

      //关闭添加用户的dialog
      handleAddClose()
      {
        // this.$message.success('关闭')
      },

      addFromClosed()
      {
        this.$refs.addFormRef.resetFields();
      },
      //
      editFromClosed()
      {
        this.$refs.editFormRef.resetFields();
      }

    },
    created() {
      // console.log(this.getUsers())
      this.getUsers();
    }
  }
</script>

<style>
</style>
