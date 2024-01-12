<template>
  <div class="app-container">

    <el-row :gutter="10" class="mb8">
		<el-col :span="1.5">
		  <el-button
		    type="warning"
		    icon="el-icon-upload2"
		    size="mini"
		    @click="handleImport(1)"
		    v-hasPermi="['system:user:import']"
		  >混凝土数据导入</el-button>
		  <el-button
		    type="success"
		    icon="el-icon-upload2"
		    size="mini"
		    @click="handleImport(2)"
		    v-hasPermi="['system:user:import']"
		  >钢筋数据导入</el-button>
		</el-col>
    </el-row>
    <el-table v-loading="loading" :data="mfilesList" >
      <el-table-column label="主键id" align="center" prop="id" />
      <el-table-column label="文件名" align="center" prop="fileName" />
      <el-table-column label="文件存放地址" align="center" prop="fileAddr" />
      <el-table-column label="上传用户" align="center" prop="uploadUser" />
      <el-table-column label="最新操作时间" align="center" prop="uploadTime" />
      <el-table-column label="备注" align="center" prop="other" />
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
	
	<!-- 混凝土入对话框 -->
	  <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body>
	    <el-upload
		v-if="isg==1"
	      ref="upload"
	      :limit="1"
		  name="multipartFile"
	      accept=".xlsx, .xls"
	      :headers="upload.headers"
	      :action="upload.url"
	      :disabled="upload.isUploading"
	      :on-progress="handleFileUploadProgress"
	      :on-success="handleFileSuccess"
	      :auto-upload="false"
	      drag
	    >
	      <i class="el-icon-upload"></i>
	      <div class="el-upload__text">
	        将文件拖到此处，或
	        <em>点击上传</em>
	      </div>
	      <div class="el-upload__tip" style="color:red" slot="tip">提示：仅允许导入“xls”或“xlsx”格式文件！</div>
	    </el-upload>
		<el-upload
		v-if="isg==2"
		  ref="upload"
		  :limit="1"
		  name="multipartFile"
		  accept=".xlsx, .xls"
		  :headers="upload.headers"
		  :action="upload.urltwo"
		  :disabled="upload.isUploading"
		  :on-progress="handleFileUploadProgress"
		  :on-success="handleFileSuccess"
		  :auto-upload="false"
		  drag
		>
		  <i class="el-icon-upload"></i>
		  <div class="el-upload__text">
		    将文件拖到此处，或
		    <em>点击上传</em>
		  </div>
		  <div class="el-upload__tip" style="color:red" slot="tip">提示：仅允许导入“xls”或“xlsx”格式文件！</div>
		</el-upload>
	    <div slot="footer" class="dialog-footer">
	      <el-button type="primary" @click="submitFileForm">确 定</el-button>
	      <el-button @click="upload.open = false">取 消</el-button>
	    </div>
	  </el-dialog>

  </div>
</template>

<script>
import { listMfiles,concreteimport,uploadFile  } from "@/api/front/file";
import { getToken } from "@/utils/auth";
export default {
  name: "Mfiles",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // mfiles表格数据
      mfilesList: [],
      // 弹出层标题
      title: "",
	  queryParams:{
		  pageNum:1,
		  pageSize:10
	  },
	  // 混凝土导入参数
	  upload: {
	    // 是否显示弹出层（用户导入）
	    open: false,
	    // 弹出层标题（用户导入）
	    title: "",
	    // 是否禁用上传
	    isUploading: false,
	    // 是否更新已经存在的用户数据
	    headers: { Authorization: "Bearer " + getToken() },
	    // 上传的地址
	    url: process.env.VUE_APP_BASE_API + "v1/labs/concrete/import",
		urltwo: process.env.VUE_APP_BASE_API + "/v1/labs/steel/actions/steel/import",
	  },
	  isg:1
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询mfiles列表 */
    getList() {
      this.loading = true;
      this.queryParams.pid = this.pid
      listMfiles(this.queryParams).then(response => {
        this.mfilesList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 导入按钮操作 */
	/** 导入按钮操作 */
	handleImport(i) {
		if(i== 1){
			 this.upload.title = "混凝实土验数据导入";
			 this.isg=1
		}else if(i == 2){
			this.upload.title = "钢筋实验数据导入";
			this.isg=2
		}
	 
	  this.upload.open = true;
	},
	// 文件上传中处理
	handleFileUploadProgress(event, file, fileList) {
	  this.upload.isUploading = true;
	},
	// 文件上传成功处理
	handleFileSuccess(response, file, fileList) {
	  this.upload.open = false;
	  this.upload.isUploading = false;
	  this.$refs.upload.clearFiles();
	  this.$alert(response.data, "导入结果", { dangerouslyUseHTMLString: true });
	  this.getList();
	},
	// 提交上传文件
	submitFileForm() {
	  this.$refs.upload.submit();
	},
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