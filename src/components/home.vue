<template>
  <el-container>
    <el-header>
      <el-page-header content="详情页面">
      </el-page-header>
    </el-header>
    <el-container>
      <el-aside width="200px">
        <!-- <el-menu>
          <el-submenu index="1">
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>导航一</span>
            </template>
            <el-menu-item index="1">
              <template slot="title">
                <i class="el-icon-location"></i>
                <span>选项1</span>
              </template>
            </el-menu-item>
          </el-submenu>
          <el-submenu index="2">
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>导航一</span>
            </template>
            <el-menu-item index="1">
              <template slot="title">
                <i class="el-icon-location"></i>
                <span>选项1</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu> -->
        <el-menu unique-opened :router="true">
          <el-submenu v-for="menu in menuList" :key="menu.id" :index="menu.id + ''">
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>{{menu.authName}}</span>
            </template>
            <el-menu-item v-for="childerMenu in menu.children" :key="childerMenu.id" :index="'/' + childerMenu.path">
              <template slot="title">
                <i class="el-icon-location"></i>
                <span>{{childerMenu.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  export default {
     data() {
      return {
        Authorization : this.$store.state.token,
        menuList : []
      }
    },
    methods: {
      async getMenuList(){
        console.log("获取菜单列表")
        const res = await this.$http.get('/menus')
        console.log(res)
        if(res.meta.status != 200)
        {
          this.$message.error(res.meta.msg)
          this.$router.push('/')
        }
        else
        {
          this.menuList = res.data
        }

      }
    },
    created(){
      this.getMenuList();
    }
  }
</script>

<style>
</style>
