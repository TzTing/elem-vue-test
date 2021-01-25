<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <br>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="grid-content bg-purple">
              <el-button type="primary">添加角色</el-button>
            </div>
          </el-col>
        </el-row>

        <el-table
          :data="rolesList"
          style="width: 100%;margin-bottom: 20px;"
          border>
          <el-table-column type="expand">
            <template slot-scope="scope">
              <span v-if="scope.row.children == ''">该角色无权限</span>
              <!-- 循环一级目录 -->
              <el-row v-for="(item, index1) in scope.row.children" :key="item.id" :class="['bdbottom', index1 === 0 ? 'bdtop' : '', 'vcenter']">
                <el-col :span="5" center>
                <el-tag>
                  {{item.authName}}
                </el-tag>
                 <i class="el-icon-caret-right"></i>
                </el-col>

                <!-- 循环二、三级目录  二级目录放在新的一行中的第一列 三级则是第二列 -->
                <el-col :span="19">
                  <el-row v-for="(item2, index2) in item.children" :key="item2.id" :class="[index2 === 0 ? '' : 'bdtop']">
                      <!-- 循环二级目录 -->
                      <el-col :span="5">
                        <el-tag type="success">{{item2.authName}}</el-tag>
                        <i class="el-icon-caret-right"></i>
                      </el-col>
                      
                      <!-- 第二列在循环三级的所有资源权限 -->
                      <el-col :span="19">
                        <el-tag  closable @close="handleClose(scope.row, item3.id)" type="warning" v-for="(item3, index3) in item2.children" :key="item3.id"  :class="[index3 === 0 ? '' : 'bdtop']">{{item3.authName}}</el-tag>
                      </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
          <el-table-column type="index">
          </el-table-column>
          <el-table-column
            prop="roleName"
            label="角色名称">
          </el-table-column>
          <el-table-column
            prop="roleDesc"
            label="角色描述">
          </el-table-column>
          <el-table-column
            label="操作">
            <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" round @click="scope.row.id = 1">编辑</el-button>
                <el-button type="primary" icon="el-icon-edit" round @click="scope.row.id = 1">删除</el-button>
                <el-button type="primary" icon="el-icon-edit" round @click="showManagerRight(scope.row)">分配权限</el-button>
            </template>
          </el-table-column>
  </el-table>
    <el-dialog
    title="提示"
    :visible.sync="managerRight"
    width="30%"
    :before-close="handleClose">
    
      <el-tree
        ref="rightTreeRef"
        :data="roleRights"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="checkedTree"
        :props="defaultProps">
      </el-tree>

    <span slot="footer" class="dialog-footer">
      <el-button @click="managerRight = false">取 消</el-button>
      <el-button type="primary" @click="updateRoleRights()">确 定</el-button>
    </span>
  </el-dialog>
      </div>
    </el-card>
  </div>
</template>

<script>
  export default {
     data() {
      return {
        rolesList:[],
        managerRight:false,
        defaultProps: {
          children: 'children',
          label: 'authName'
        },
        //所有权限
        roleRights:[],
        //默认选中的权限
        checkedTree:[],
        //当前选中角色的id
        currRoleId:0
      }
    },
    methods: {
      async getRolesList()
      {
        const res = await this.$http.get('roles')
        if(res.meta.status == 200)
        {
          this.rolesList = res.data;
        }
        else
        {
          this.$message.error('获取失败');
        }
        // console.log(res)
      }
      ,
      handleClose(role, rightId)
      {
        this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const res = await this.$http.delete(`roles/${role.id}/rights/${rightId}/`)
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
            role.children = res.data;
          }
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
      },
      //展示角色授权界面 并默认显示已经授权了的权限
      //查询当前角色所有权限在能授权的所有权限中 就是默认选中的权限
      async showManagerRight(role)
      {
        this.currRoleId = role.id;
          const res = await this.$http.get('rights/' + 'tree')
          if(res.meta.status == 200)
          {
            this.roleRights = res.data;
          }
          this.checkedTree = [];
          this.getLeafNode(role, this.checkedTree)
          console.log(this.checkedTree)
          this.managerRight = true;
      },
      //递归获取子节点的id
      getLeafNode(node, arr)
      {
        if(node != null)
        {
          if(!node.children)
          {
            arr.push(node.id);
          }
          else
          {
            node.children.forEach(item => {
              this.getLeafNode(item, arr);
            });
          }
        }
        return;
      },
      //角色授权
      async updateRoleRights()
      {
        const keys = [...this.$refs.rightTreeRef.getCheckedKeys(),
         ...this.$refs.rightTreeRef.getHalfCheckedNodes()]

         var strs = keys.join(",");


        const res = await this.$http.post(`roles/${this.currRoleId}/rights`, {rids:strs})

        console.log(res)
        if(res.meta.status != 200)
        {
          this.$message.error("更新失败")
        }
        else
        {
          this.$message.success("更新成功")
          this.managerRight = false;
        }
        this.getRolesList();
      }
    },
    created()
    {
      this.getRolesList();
    }
  }
</script>

<style lang="less" scoped>
.el-tag{
  margin: 7px;
}
 .bdtop{
   border-top: 1px solid #eeeeee;
 }

 .bdbottom{
   border-bottom: 1px solid #eeeeee;
 }
 .vcenter{
   display: flex;
   align-items: center;
 }
</style>
