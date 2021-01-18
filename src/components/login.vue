<template>
   <el-row>
     <el-form ref="form" :model="form" :rules="rules" label-width="80px" class="">
       <el-form-item label="用户名" prop="username">
         <el-input  v-model="form.username" placeholder="请输入内容" prefix-icon="el-icon-user"></el-input>
       </el-form-item>
       <el-form-item label="密码" prop="password">
         <el-input  v-model="form.password" placeholder="请输入内容" prefix-icon="el-icon-key" type="password"></el-input>
       </el-form-item>
       <el-form-item>
         <el-button type="primary" @click="onSubmit('form')">登录</el-button>
         <el-button type="info">取消</el-button>
       </el-form-item>
     </el-form>
   </el-row>
</template>

<script>
  export default {
     data() {
      return {
        form: {
          username: 'admin',
          password: '123456',
        },
        rules: {
          username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' }
          ]
        },
      }
    },
    methods: {
      onSubmit(formName) {
        /* this.$store.commit('increment')
        alert(this.$store.state.count) */
        this.$refs[formName].validate(async valid => {
          if (valid) {
            // const {data : res} = await this.$http.post('/admin/login', this.form)
            const res = await this.$http.post('/login', this.form)
            if(res.meta.status == 200)
            {
              this.$message.success("登录成功!")
              console.log(res.data)
              this.$store.state.token = res.data.token;
              window.sessionStorage.setItem("token", res.data.token);
              //添加路由跳转地址
              this.$router.push('/home')
            }
            else
            {
              this.$message.success("登录失败!")
              this.$router.push('/')
            }

          } else {
            console.log('error submit!!');
            return false;
          }
        });
      }
    }
  }
</script>

<style lang="less" scoped>
</style>
