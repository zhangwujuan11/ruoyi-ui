<template>
  <div class="app-container">
   <!-- <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="标题" prop="mfteTitle">
        <el-input
          v-model="queryParams.mfteTitle"
          placeholder="请输入标题"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="类型" prop="mfteType">
        <el-select v-model="queryParams.mfteType" placeholder="请选择类型" clearable size="small">
          <el-option :label="item.dictLabel" :value="item.dictValue" v-for="item in dictList" :key="item.dictCode"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form> -->

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['siteinfo:siteinfo:add']"
        >新增</el-button>
      </el-col>
     <!-- <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['siteinfo:siteinfo:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['siteinfo:siteinfo:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['siteinfo:siteinfo:export']"
        >导出</el-button>
      </el-col> -->
    </el-row>

    <el-table v-loading="loading" :data="siteinfoList">
      <el-table-column label="主键" align="center" prop="id" />
	  <el-table-column label="类型" align="center" prop="echartsKey" >
	    <template slot-scope="scope">
	      <span>{{scope.row.echartsKey | echartsKey}}</span>
	    </template>
	  </el-table-column>
      <el-table-column label="月份" align="center" prop="echartsValue" />
      <el-table-column label="更新时间" align="center" prop="updateTime" >
        <template slot-scope="scope">
          <span>{{gettimestamp(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
	  <el-table-column label="创建时间" align="center" prop="createTime" >
	    <template slot-scope="scope">
	      <span>{{gettimestamp(scope.row.createTime)}}</span>
	    </template>
	  </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['siteinfo:siteinfo:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['siteinfo:siteinfo:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

   <!-- <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    /> -->

    <!-- 添加或修改siteinfo对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="40%" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
		  <el-form-item label="类型" prop="echartsKey">
		    <el-select v-model="form.echartsKey" placeholder="请选择类型" :disabled="form.id !=null">
		      <el-option :label="item.label" :value="item.value" v-for="item in dictList" :key="item.dictCode"/>
		    </el-select>
		  </el-form-item>
       <!-- <el-form-item label="月份" prop="echartsValue">
          <el-input v-model="form.mfteTitle" placeholder="请输入标题" />
        </el-form-item> -->
			<el-form-item label="月份" prop="echartsValue">
			  <el-date-picker
				   v-model="form.echartsValue"
				   type="month"
				   placeholder="选择日期"
				   format="yyyy 年 MM 月 "
				   value-format="yyyyMM">
				 </el-date-picker>
			</el-form-item>
       
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getechartslist, echartsinfo,updateceharts,echartsadd, detelecharts } from "@/api/build/news";

import Vue from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
export default {
  name: "Siteinfo",
  filters:{
	  echartsKey(e){
		  if(e == 10001){
			  return '日常管理'
		  }else if(e == 10002){
			  return '施工进度'
		  }else if(e == 10003){
			  return '检查整改'
		  }else if(e == 10004){
			  return '质量整改'
		  }else if(e == 10005){
			  return '农民工资'
		  }
	  }
  },
  data() {
    return {
      dictList: [
		  {label:'日常管理',value:10001},
		   {label:'施工进度',value:10002},
		    {label:'检查整改',value:10003},
			 {label:'质量整改',value:10004},
			  {label:'农民工资',value:10005},
	  ],
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // siteinfo表格数据
      siteinfoList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
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
    /** 查询siteinfo列表 */
    getList() {
      this.loading = true;
      getechartslist().then(response => {
        this.siteinfoList = response.data.items;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
		this.form={
			id:null
		}
      this.resetForm("form");
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加echarts";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id
	  this.open = true;
      echartsinfo(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改echarts";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateceharts(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            echartsadd(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id
      this.$confirm('是否确认删除主键为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return detelecharts(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
    },
    /** 导出按钮操作 */
    // handleExport() {
    //   const queryParams = this.queryParams;
    //   this.$confirm('是否确认导出所有siteinfo数据项?', "警告", {
    //       confirmButtonText: "确定",
    //       cancelButtonText: "取消",
    //       type: "warning"
    //     }).then(function() {
    //       return exportSiteinfo(queryParams);
    //     }).then(response => {
    //       this.download(response.msg);
    //     })
    // }
  }
};
</script>
<style src="@wangeditor/editor/dist/css/style.css"></style>
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
