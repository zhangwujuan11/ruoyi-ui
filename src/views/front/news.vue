<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
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
    </el-form>

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
      <el-col :span="1.5">
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
      </el-col>
	  <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="siteinfoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键id" align="center" prop="id" />
      <el-table-column label="标题" align="center" prop="mfteTitle" />
      <el-table-column label="滚动图" align="center" prop="mfteCover" />
      <!-- <el-table-column label="内容" align="center" prop="mfte" /> -->
      <el-table-column label="附件" align="center" prop="mfteFiles" />
      <el-table-column label="访问时间" align="center" prop="mfteEntryIntoForceTime" />
      <el-table-column label="是否置顶" align="center" prop="mfteTop" />
      <el-table-column label="是否隐藏" align="center" prop="mfteHide" />
      <el-table-column label="排序权重" align="center" prop="mfteWeight" />
      <el-table-column label="编辑用户" align="center" prop="mfteEditUser" />
      <el-table-column label="最后更新时间" align="center" prop="mfteLastEditTime" />
      <el-table-column label="创建时间" align="center" prop="mfteCreateTime" />
      <el-table-column label="备注" align="center" prop="mfteOther" />
      <el-table-column label="类型" align="center" prop="mfteType" >
        <template slot-scope="scope">
          <span>{{getDictFormate(scope.row.mfteType)}}</span>
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

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改siteinfo对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="1100px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="mfteTitle">
          <el-input v-model="form.mfteTitle" placeholder="请输入标题" />
        </el-form-item>
			<el-form-item label="创建时间" prop="mfteCreateTime">
			  <el-date-picker
				   v-model="form.mfteCreateTime"
				   type="date"
				   placeholder="选择日期"
				   format="yyyy 年 MM 月 dd 日"
				   value-format="yyyy/MM/dd">
				 </el-date-picker>
			</el-form-item>
        <el-form-item label="滚动图" prop="mfteCover">
          <img :src="form.mfteCover" v-if="form.mfteCover" style="width: 300px">
          <el-input v-model="form.mfteCover" style="width: 400px;display:none" disabled placeholder="请输入文件名" />
          <el-upload
            class="avatar-uploader"
            action="https://jsonplaceholder.typicode.com/posts/"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload">
            <i  class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="内容" prop="mfte">
          <div style="border: 1px solid #ccc;">
              <Toolbar
                  style="border-bottom: 1px solid #ccc"
                  :editor="editor"
                  :defaultConfig="toolbarConfig"
                  :mode="mode"
              />
              <Editor
                  style="height: 500px; overflow-y: hidden;"
                  v-model="form.mfte"
                  :defaultConfig="editorConfig"
                  :mode="mode"
                  @onCreated="onCreated"
              />
          </div>
        </el-form-item>
        <!-- <el-form-item label="是否置顶" prop="mfteTop">
          <el-input v-model="form.mfteTop" placeholder="请输入是否置顶" />
        </el-form-item>
        <el-form-item label="是否隐藏" prop="mfteHide">
          <el-input v-model="form.mfteHide" placeholder="请输入是否隐藏" />
        </el-form-item> -->
        <el-form-item label="类型" prop="mfteType">
          <el-select v-model="form.mfteType" placeholder="请选择类型">
            <el-option :label="item.dictLabel" :value="item.dictValue" v-for="item in dictList" :key="item.dictCode"/>
          </el-select>
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
import { listSiteinfo, getSiteinfo, delSiteinfo, addSiteinfo, updateSiteinfo, exportSiteinfo } from "@/api/build/news";
import { getDicts } from "@/api/system/dict/data.js";
import { uploadFile } from "@/api/front/file";

import Vue from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
export default {
  name: "Siteinfo",
  data() {
    return {
      dictList: [],
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
      // siteinfo表格数据
      siteinfoList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        mfteTitle: null,
        mfteCover: null,
        mfte: null,
        mfteFiles: null,
        mfteEntryIntoForceTime: null,
        mfteTop: null,
        mfteHide: null,
        mfteWeight: null,
        mfteEditUser: null,
        mfteLastEditTime: null,
        mfteCreateTime: null,
        mfteOther: null,
        mfteType: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      },
      //富文本相关
      editor: null,
      html: '<p>hello</p>',
      toolbarConfig: { },
      editorConfig: {
        MENU_CONF:{
          uploadImage:{
            async customUpload(file, insertFn) {
              var formData = new FormData();
              formData.append('file', file)
              const res = await uploadFile(formData)
              if(res.code === 200){
                insertFn(res.data.objectUrl, '', '')
              }
            }
          }
        }
      },
      mode: 'default'
    };
  },
  components: { Editor, Toolbar },
  created() {
    this.getList();
    this.getDict()
  },
  beforeDestroy() {
    const editor = this.editor
    if (editor == null) return
    editor.destroy() // 组件销毁时，及时销毁编辑器
  },
  methods: {
    getDictFormate(type){
      const typeList = this.dictList.filter(function(item){
        return item.dictValue === type
      })
      if(typeList.length>0){
        return typeList[0].dictLabel
      }

    },
    /** 查询siteinfo列表 */
    getList() {
      this.loading = true;
      listSiteinfo(this.queryParams).then(response => {
        this.siteinfoList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    beforeAvatarUpload(file) {
      var formData = new FormData();
      // if($("#upimg")[0].files[0].size>5000000){
      //   return MessageShow("单张图片不能超过5M");
      // }
      formData.append('file', file)
      uploadFile(formData).then(res=>{
        if(res.code == 200){
          this.form.mfteCover = res.data.objectUrl
        }
      })

      return false

    },
    onCreated(editor) {
      this.editor = Object.seal(editor) // 一定要用 Object.seal() ，否则会报错
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    getDict(){
      getDicts('system_news_type').then(res=>{
        if(res.code == 200){
          this.dictList = res.data
        }
      })
    },
    // 表单重置
    reset() {
      this.form = {
        id: this.id,
        mfteTitle: null,
        mfteCover: null,
        mfte: null,
        mfteFiles: null,
        mfteEntryIntoForceTime: null,
        mfteTop: 1,
        mfteHide: 1,
        mfteWeight: 1111,
        mfteEditUser: this.$store.state.user.name,
        mfteLastEditTime: new Date().toLocaleDateString(),
        mfteCreateTime: new Date().toLocaleDateString(),
        mfteOther: null,
        mfteType: this.mfteType,
      };
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
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加siteinfo";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getSiteinfo(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改siteinfo";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateSiteinfo(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addSiteinfo(this.form).then(response => {
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
      this.$confirm('是否确认删除siteinfo编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delSiteinfo(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有siteinfo数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportSiteinfo(queryParams);
        }).then(response => {
          this.download(response.msg);
        })
    }
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
