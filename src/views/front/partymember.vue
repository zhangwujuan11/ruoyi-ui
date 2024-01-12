<template>
  <div class="app-container">

    <el-table v-loading="loading" :data="mfilesList" >
      <el-table-column label="主键id" align="center" prop="id" />
      <el-table-column label="名称" align="center" prop="noPartyName" />
      <el-table-column label="人数" align="center" prop="noPartyMember" />
      <el-table-column label="名称2" align="center" prop="partyName" />
      <el-table-column label="人数2" align="center" prop="partyMember" />
      <el-table-column label="修改时间" align="center" prop="updateTime" >
		  <template slot-scope="scope">
			  {{gettimestamp(scope.row.updateTime)}}
		  </template>
	  </el-table-column>
	  <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
	    <template slot-scope="scope">
	      <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
	        v-hasPermi="['video:list:edit']">修改</el-button>
	    </template>
	  </el-table-column>
    </el-table>
	<!-- 添加或修改对话框 -->
	<el-dialog title="修改党员信息" :visible.sync="open" width="500px" append-to-body>
	  <el-form ref="form" :model="form" :rules="rules" label-width="80px">
	    <el-form-item label="名称" prop="noPartyName">
	      <el-input v-model="form.noPartyName" placeholder="请输入名称" />
	    </el-form-item>
		<el-form-item label="人数" prop="noPartyMember">
		  <el-input v-model="form.noPartyMember" type="number" placeholder="请输入人数" />
		</el-form-item>
	    <el-form-item label="名称2" prop="partyName">
	      <el-input v-model="form.partyName" placeholder="请输入设备编号" />
	    </el-form-item>
	    <el-form-item label="人数2" prop="partyMember">
	      <el-input v-model="form.partyMember" type="number" placeholder="请输入厂商类型" />
	    </el-form-item>
	  </el-form>
	  <div slot="footer" class="dialog-footer">
	    <el-button type="primary" @click="submitForm">确 定</el-button>
	    <el-button @click="open=false">取 消</el-button>
	  </div>
	</el-dialog>
  </div>
</template>

<script>
import { menlist,menlistinfo,updatemen } from "@/api/front/file";

export default {
  name: "Mfiles",
  data() {
    return {
      loading: true,
      mfilesList: [],
	  queryParams:{},
	  open:false,
	  form:{},
	  rules:{
		   noPartyName: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
		    noPartyMember: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
			partyName: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
			partyMember: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
	  }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询mfiles列表 */
    getList() {
      this.loading = true;
      menlist().then(response => {
        this.mfilesList = response.data.items;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    /** 时间戳转换 */
    gettimestamp(time) {
         var date = new Date(time);   // 时间戳为10位需*1000，时间戳为13位的话不需乘1000
         var Y = date.getFullYear() + '-';
         var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
         var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
         var h = (date.getHours() < 10 ? '0' + (date.getHours()) : date.getHours()) + ':';
         var m = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes()) + ':';
         var s = (date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds());
         var strDate = Y + M + D + h + m + s;
         return strDate;
       },
	   handleUpdate(row){
		   menlistinfo(row.id).then(res=>{
			   if(res.code == 200){
				   this.form=res.data
				   this.open=true
			   }else{
				   this.$message.error(res.message)
			   }
		   })
	   },
	   // 提交修改
	   submitForm(){
		   updatemen(this.form).then(res=>{
			   if(res.code ==200){
				   this.$message.success('修改成功')
				   this.getList()
				   this.open=false
			   }else{
				    this.$message.error(res.message)
			   }
		   })
	   }
  }
};
</script>
<style>
.avatar-uploader{
  display: inline-block;
  vertical-align: top;
}
.avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    height: 36px;
    
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 22px;
    color: #8c939d;
    width: 36px;
    height: 36px;
    line-height: 36px;
    text-align: center;
  }
  .avatar {
    width: 36px;
    height: 36px;
    display: block;
  }
</style>