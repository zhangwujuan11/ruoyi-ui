<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="queryParams.title" placeholder="请输入标题" clearable size="small"
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
          v-hasPermi="['siteinfo:siteinfo:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate"
          v-hasPermi="['siteinfo:siteinfo:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['siteinfo:siteinfo:remove']">删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="infoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键id" align="center" prop="id" />
      <el-table-column label="标题" align="center" prop="title" />
      <el-table-column label="是否默认" align="center" prop="flag" >
        <template slot-scope="scope">
                    <el-tag :type="scope.row.flag == '1' ? 'success' : 'danger'">
                     <span v-if="scope.row.flag === '1'">是</span>
                    <span v-if="scope.row.flag === '0'">否</span>
                    </el-tag>
                   
                </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="indexNum" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['siteinfo:siteinfo:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
            v-hasPermi="['siteinfo:siteinfo:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改siteinfo对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="1100px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="titel">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="是否默认" prop="titel">
          <el-switch v-model="form.flag" active-color="#13ce66" inactive-color="#ff4949" active-value="1"
            inactive-value="0" active-text="是" inactive-text="否">
          </el-switch>
        </el-form-item>
        <el-form-item label="排序" prop="titel">
          <el-input v-model="form.indexNum" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <div style="border: 1px solid #ccc;">
            <Toolbar style="border-bottom: 1px solid #ccc" :editor="editor" :defaultConfig="toolbarConfig"
              :mode="mode" />
            <Editor style="height: 500px; overflow-y: hidden;" v-model="form.content" :defaultConfig="editorConfig"
              :mode="mode" @onCreated="onCreated" />
          </div>
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
import { listList, getList, delList, addList, updateList } from "@/api/front/introduce";
import Vue from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
export default {
  name: "introduce",
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
      infoList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        id: null,
        title: null,
        content: null,
        flag: null,
        indexNum: null

      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      },
      //富文本相关
      editor: null,
      html: '<p>hello</p>',
      toolbarConfig: {},
      editorConfig: {
        MENU_CONF: {
          uploadImage: {
            async customUpload(file, insertFn) {
              var formData = new FormData();
              formData.append('file', file)
              const res = await uploadFile(formData)
              if (res.code === 200) {
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
  },
  beforeDestroy() {
    const editor = this.editor
    if (editor == null) return
    editor.destroy() // 组件销毁时，及时销毁编辑器
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true;
      listList(this.queryParams).then(response => {
        this.infoList = response.data.items;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    onCreated(editor) {
      this.editor = Object.seal(editor) // 一定要用 Object.seal() ，否则会报错
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        title:null,
        content:null
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
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加简介信息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getList(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改简介信息";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if(this.form.flag==null){
            this.form.flag=0
          }
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
      this.$confirm('是否确认删除简介编号为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delList(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    }
  }
};
</script>
<style src="@wangeditor/editor/dist/css/style.css">

</style>
<style>
.avatar-uploader {
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