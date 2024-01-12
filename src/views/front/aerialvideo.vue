<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="航拍文件存放地址" prop="ayVideosAddr">
        <el-input v-model="queryParams.ayVideosAddr" placeholder="请输入航拍文件存放地址" clearable size="small"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="航拍文件名" prop="ayVideosNote">
        <el-input v-model="queryParams.ayVideosNote" placeholder="请输入航拍文件名" clearable size="small"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="航拍文件名" prop="ayVideoCover">
        <el-input v-model="queryParams.ayVideoCover" placeholder="请输入航拍文件名" clearable size="small"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd"
          v-hasPermi="['video:list:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate"
          v-hasPermi="['video:list:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['video:list:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport"
          v-hasPermi="['video:list:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="listList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" />
      <el-table-column label="航拍文件存放地址" align="center" prop="ayVideosAddr" />
      <el-table-column label="航拍文件名" align="center" prop="ayVideosNote" />
      <el-table-column label="航拍文件名" align="center" prop="ayVideoCover" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['video:list:edit']">修改</el-button>
            <el-button
              size="mini"
              type="text"
               @click="handleDataScope(scope.row)"
              icon="el-icon-circle-check"
              v-hasPermi="['system:role:edit']"
            >数据权限</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
            v-hasPermi="['video:list:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改航拍对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="航拍文件" prop="ayVideosAddr">
          <!-- <video :src="form.ayVideosAddr" style="width: 300px ;height: 100px;"/> -->
          <el-upload class="avatar-uploader hanpaiup" action="https://jsonplaceholder.typicode.com/posts/"
            :file-list="fileLists" accept="video/mp4" :before-upload="beforeUpload" list-type="picture" :limit="1" :on-exceed="goveflow">
            <i class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="封面图片" prop="img">
                    <el-upload class="avatar-uploader" 
						ref="upload"
						 :on-remove="handleRemove"
						 :limit="1"
						 :on-exceed="goveflow"
						action="https://jsonplaceholder.typicode.com/posts/"
                        :file-list="fileList" 
						list-type="picture-card" 
                        :before-upload="beforeAvatarUpload">
                        <i slot="default" class="el-icon-plus"></i>
						<div slot="file" slot-scope="{file}">
						  <img class="el-upload-list__item-thumbnail"
						    :src="form.img" alt=""
						  >
						  <span class="el-upload-list__item-actions">
						    <span
						      class="el-upload-list__item-delete"
						      @click="handleRemove(file)"
						    >
						      <i class="el-icon-delete"></i>
						    </span>
						  </span>
						</div>
                    </el-upload>
        </el-form-item>
        <el-form-item label="航拍文件名" prop="ayVideosNote">
          <el-input v-model="form.ayVideosNote" placeholder="请输入航拍文件名" />
        </el-form-item>
        <el-form-item label="航拍文件名" prop="ayVideoCover">
          <el-input v-model="form.ayVideoCover" placeholder="请输入航拍文件名" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  <!-- 分配角色数据权限对话框 -->
    <el-dialog :title="title" :visible.sync="openDataScope" width="500px" append-to-body>
      <el-form :model="form" label-width="80px">
        <el-form-item label="航拍文件名">
          <el-input v-model="form.ayVideoCover" :disabled="true" />
        </el-form-item>
        <el-form-item label="航拍ID">
          <el-input v-model="form.id" :disabled="true" />
        </el-form-item>
    <!--   <el-form-item label="权限范围">
          <el-select v-model="form.dataScope">
            <el-option
              v-for="item in dataScopeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="数据权限">
          <el-checkbox v-model="deptNodeAll" @change="handleCheckedTreeNodeAll($event, 'dept')">全选/全不选</el-checkbox>
          <el-tree
            class="tree-border"
            :data="deptOptions"
            show-checkbox
            default-expand-all
            ref="dept"
            node-key="deptId"
            :check-strictly="!form.deptCheckStrictly"
            empty-text="加载中，请稍后"
            :props="defaultProps"
          ></el-tree>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitDataScope">确 定</el-button>
        <el-button @click="cancelDataScope">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listList, getList, delList, addList, updateList, exportList } from "@/api/front/aerialvideo";
import { datapower, powerdata, subpowerdata } from "@/api/front/camList";
import { uploadFile } from "@/api/front/file";
import { Loading } from 'element-ui';
export default {
  name: "List",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 航拍表格数据
      listList: [],
      fileList:[],
	  fileLists:[],
      // 弹出层标题
      title: "",
      img:"",
      ayVideosAddr:"",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        ayVideosAddr: null,
        ayVideosNote: null,
        ayVideoCover: null,
        img: null
      },
      deptOptions: [],
      deptExpand: true,
      deptNodeAll: false,
      defaultProps: {
        children: "childDept",
        label: "deptName"
      },
      openDataScope:false,
      // 表单参数
      form: { img: "",ayVideosAddr:""},
      // 表单校验
      rules: {
      },
    };

  },
  created() {
    this.getList();
  },
  methods: {
    handleDataScope(row) {
      this.reset();
      this.newchange()
      this.form = row
      this.openDataScope = true;
        this.$nextTick(() => {
          powerdata({
            rid:row.id,
            type:'video'
          }).then(req=>{
            if(req.data){
              this.$refs.dept.setCheckedKeys(req.data.deptIdList);
            }
          })
        });
        this.title = "分配数据权限";
    },

    /** 根据角色ID查询部门树结构 */
    newchange() {
      datapower().then(response => {
        this.deptOptions = response.data.items;
      });
    },
    // 取消按钮（数据权限）
    cancelDataScope() {
      this.openDataScope = false;
      this.reset();
    },
/** 提交按钮（数据权限） */
    submitDataScope() {
      let obj={
        deptIds:this.$refs.dept.getCheckedKeys(),
        rid:this.form.id,
        rName:this.form.ayVideoCover,
        type:'video'
      }
      subpowerdata(obj).then(res=>{
        this.msgSuccess("修改成功");
        this.openDataScope = false;
        this.getList();
      })
    },
    // 树权限（全选/全不选）
    handleCheckedTreeNodeAll(value, type) {
      this.$refs.dept.setCheckedNodes(value ? this.deptOptions: []);
      // if (type == 'menu') {
      //   this.$refs.menu.setCheckedNodes(value ? this.menuOptions: []);
      // } else if (type == 'dept') {
      //   this.$refs.dept.setCheckedNodes(value ? this.deptOptions: []);
      // }
    },











    /** 查询航拍列表 */
    getList() {
      this.loading = true;
      listList(this.queryParams).then(response => {
        this.listList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    //方法
    beforeUpload(file) {
		this.fileLists=[]
      var formData = new FormData();
      formData.append('file', file)
      uploadFile(formData).then(res => {
        if (res.code == 200) {
          this.form.ayVideosAddr = res.data.objectUrl
          this.ayVideosAddr = res.data.objectUrl
					this.fileLists.push({ ...res.data.objectUrl,name: res.data.bucketName });
        }
      })
      return false;
    },

    beforeAvatarUpload(file) {
		this.fileList=[]
		 var formData = new FormData();
		 formData.append('file', file)
		console.log(formData)
		uploadFile(formData).then(res => {
				if (res.code == 200) {
					this.form.img = res.data.objectUrl
					 this.fileList.push({ ...res.data.objectUrl,name: res.data.bucketName });
				}
			})
			return false;
        },
    // 取消按钮
    cancel() {

      this.reset();
      this.open = false;
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        ayVideosAddr: null,
        ayVideosNote: null,
        ayVideoCover: null,
        img:null,
      };
	 this.fileList=[]
	 this.fileLists=[]
     this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加航拍";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getList(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改航拍";
		this.fileList.push({ ...response.data.img,name: response.data.ayVideosNote });
		this.fileLists.push({ ...response.data.ayVideosAddr,name: response.data.ayVideosNote });
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateList(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addList(this.form).then(response => {
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
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除航拍编号为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delList(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有航拍数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportList(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    },
	// 超出限制
	goveflow(){
		this.msgError("超出上传限制，请先删除");
	},
	// 删除图片
	handleRemove(file, fileList){
	   this.$refs["upload"].clearFiles()
	   this.form.img=null
	},
  }
};
</script>
