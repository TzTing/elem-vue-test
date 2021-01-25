<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <br>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <el-table :data="roleList">
            <el-table-column
              prop="authName"
              label="权限说明"
              width="180">
            </el-table-column>
            <el-table-column
              prop="path"
              label="对应访问路径">
            </el-table-column>
            <el-table-column
              prop="level"
              label="权限层级"
              width="180">
              <template v-slot="scope">
                <el-tag v-if="scope.row.level == 0">等级一</el-tag>
                <el-tag v-if="scope.row.level == 1" type="success">等级二</el-tag>
                <el-tag v-if="scope.row.level == 2" type="info">等级三</el-tag>
                <el-tag v-if="scope.row.level == 4" type="warning">等级四</el-tag>
              </template>
            </el-table-column>
          </el-table>
      </div>
    </el-card>
  </div>
</template>

<script>
  export default {
     data() {
      return {
        roleList:[],

      }
    },
    methods: {
      async getRoleList(type)
      {
        const res = await this.$http.get('rights/' + type)
        if(res.meta.status == 200)
        {
          this.roleList = res.data;
        }
      }
    },
    created()
    {
      this.getRoleList('list');
    }
  }
</script>

<style>
</style>
