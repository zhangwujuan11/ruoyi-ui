<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="78px">
      <el-form-item label="文件名称" prop="folderName">
        <el-input
          v-model="queryParams.folderName"
          placeholder="请输入文件夹名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
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
          v-hasPermi="['mfolder:mfolder:add']"
        >新增</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="mfolderList"
      row-key="id"
      default-expand-all
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <!-- <el-table-column label="父id" align="center" prop="pid" /> -->
      <el-table-column label="文件夹名称" align="center" prop="folderName" />
      <el-table-column label="排序" align="center" prop="sort" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['mfolder:mfolder:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['mfolder:mfolder:remove']"
          >删除</el-button>
          <el-button
            v-if="scope.row.pid == 0"
            size="mini"
            type="text"
            icon="el-icon-plus"
            @click="addChildren(scope.row)"
            v-hasPermi="['mfolder:mfolder:edit']"
          >新增子目录</el-button>
          <el-button
          v-if="scope.row.pid == 0"
            size="mini"
            type="text"
             @click="handleDataScope(scope.row)"
            icon="el-icon-circle-check"
            v-hasPermi="['system:role:edit']"
          >数据权限</el-button>




          <el-button
            size="mini"
            type="text"
            icon="el-icon-plus"
            @click="addFile(scope.row)"
            v-hasPermi="['mfolder:mfolder:edit']"
          >增加文件</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改mfolder对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="文件夹名称" prop="folderName">
          <el-input v-model="form.folderName" placeholder="请输入文件夹名称" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model="form.sort" placeholder="请输入排序" />
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
          <el-form-item label="文件夹名称">
            <el-input v-model="form.folderName" :disabled="true" />
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
import { listMfolder, getMfolder, delMfolder, addMfolder, updateMfolder, exportMfolder } from "@/api/front/file";
import { datapower, powerdata, subpowerdata } from "@/api/front/camList";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "Mfolder",
  components: {
    Treeselect
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // mfolder表格数据
      mfolderList: [],
      // mfolder树选项
      mfolderOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pid: null,
        folderName: null,
        sort: null
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
      form: {},
      curPid: '0',
      // 表单校验
      rules: {
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    handleDataScope(row) {
      console.log(row)
          this.reset();
          this.newchange()
          this.form = row
          this.openDataScope = true;
            this.$nextTick(() => {
              powerdata({
                rid:row.id,
                type:'folder'
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
            rName:this.form.folderName,
            type:'folder'
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








    /** 查询mfolder列表 */
    getList() {
      this.loading = true;
      listMfolder(this.queryParams).then(response => {
        this.mfolderList = this.handleTree(response.data, "id", "pid");
        this.loading = false;
      });
    },
    /** 转换mfolder数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.id,
        label: node.folderName,
        children: node.children
      };
    },
	/** 查询部门下拉树结构 */
    getTreeselect() {
      listMfolder().then(response => {
        this.mfolderOptions = [];
        const data = { id: 0, folderName: '顶级节点', children: [] };
        data.children = this.handleTree(response.data, "id", "pid");
        this.mfolderOptions.push(data);
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        pid: null,
        folderName: null,
        sort: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.curPid = '0'
      this.reset();

      this.getTreeselect();
      this.open = true;
      this.title = "添加";
    },
    addChildren(row){
      this.curPid = row.id
      this.reset();

      this.getTreeselect();
      this.open = true;
      this.title = "添加";
    },
    addFile(row){
      this.$router.push({path:'/front/filelist',query:{id:row.id}})

    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
	    this.getTreeselect();
      if (row != null) {
        this.form.pid = row.id;
      }
      getMfolder(row.id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.form.pid = this.curPid
          if (this.form.id != null) {
            updateMfolder(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addMfolder(this.form).then(response => {
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
      this.$confirm('是否确认删除mfolder编号为"' + row.id + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delMfolder(row.id);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
    }
  }
};
</script>
