<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="监控名称" prop="ayName">
        <el-input
          v-model="queryParams.ayName"
          placeholder="请输入监控名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="设备号" prop="aySerNo">
        <el-input
          v-model="queryParams.aySerNo"
          placeholder="请输入设备号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <!-- <el-form-item label="监控位置" prop="ayType">
        <el-select v-model="queryParams.ayType" placeholder="请选择监控位置" clearable size="small">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item> -->
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
          v-hasPermi="['ay:list:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['ay:list:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['ay:list:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['ay:list:export']"
        >导出</el-button>
      </el-col>
	  <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="listList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" />
      <el-table-column label="监控名称" align="center" prop="ayName" />
      <el-table-column label="设备号" align="center" prop="aySerNo" />
      <el-table-column label="监控位置" align="center" prop="ayType" />
       <el-table-column label="设备类型" align="center" prop="factoryType">
         <template slot-scope="scope">
           {{scope.row.factoryType | factoryType}}
         </template>
         </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['ay:list:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-circle-check"
            @click="handleDataScope(scope.row)"
            v-hasPermi="['system:role:edit']"
          >数据权限</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['ay:list:remove']"
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

    <!-- 添加或修改ay对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="监控名称" prop="ayName">
          <el-input v-model="form.ayName" placeholder="请输入监控名称" />
        </el-form-item>
        <el-form-item label="设备号" prop="aySerNo">
          <el-input v-model="form.aySerNo" placeholder="请输入设备号" />
        </el-form-item>
        <el-form-item label="监控位置" prop="ayType">
          <el-select v-model="form.ayType" placeholder="请选择监控位置">
            <el-option label="0" value="0" />
            <el-option label="1" value="1" />
            <el-option label="2" value="2" />
            <el-option label="3" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备类型" prop="factoryType">
          <el-select v-model="form.factoryType" placeholder="请选设备类型">
            <el-option label="海康" value="hik" />
            <el-option label="大华" value="dh" />
          </el-select>
        </el-form-item>
		<el-form-item label="cno" prop="cno">
			<el-input v-model="form.cno" @change="checkInput" placeholder="请输入cno"></el-input>
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
        <el-form-item label="资源名称">
          <el-input v-model="form.ayName" :disabled="true" />
        </el-form-item>
        <el-form-item label="资源ID">
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
import { listList, getList, delList, addList, updateList, exportList, datapower, powerdata, subpowerdata } from "@/api/front/camList";


// import { listRole, getRole, deslRole, addRole, updateRole, exportRole, dataScope, changeRoleStatus } from "@/api/system/role";

export default {
  name: "List",
  filters:{
    factoryType(e){
      if(e=='hik'){
        return '海康'
      }else if(e=='dh'){
        return '大华'
      }
    }
  },
  data() {
    return {
      openDataScope:false,
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
      // ay表格数据
      listList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        ayName: null,
        aySerNo: null,
        ayType: null
      },
      // 表单参数
      form: {},
       // 部门列表
      deptOptions: [],
      deptExpand: true,
      deptNodeAll: false,
      defaultProps: {
        children: "childDept",
        label: "deptName"
      },
      // 表单校验
      rules: {
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    // 数据权限
    handleDataScope(row) {
      this.reset();
      this.newchange()
      this.form = row
      this.openDataScope = true;
        this.$nextTick(() => {
          powerdata({
            rid:row.id,
            type:'camera'
          }).then(req=>{
            this.$refs.dept.setCheckedKeys(req.data.deptIdList);
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
        rName:this.form.ayName,
        type:'camera'
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
    /** 查询ay列表 */
    getList() {
      this.loading = true;
      listList(this.queryParams).then(response => {
        this.listList = response.rows;
        this.total = response.total;
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
      this.form = {
        id: null,
        ayName: null,
        aySerNo: null,
        ayType: null
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
      this.title = "添加监控";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getList(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改监控";
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
      this.$confirm('是否确认删除监控编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delList(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有监控数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportList(queryParams);
        }).then(response => {
          this.download(response.msg);
        })
    },
	//限制输入不超过100个字节数
	      checkInput(val){
	      	//当前字符串的字节数
	        var strlen = 0;
	        //用来做字符串截取的下标
	        var index = 0;
	        //限制的最大输入长度
	        var max = 3;
	
	        for(var i=0;i<val.length;i++){
	            if(strlen>max){
	           	//输入长度超标的提示
	              this.msgError("cno长度不能超过3个字段");
	              break;
	            }
	            index = i+1;
	            //判别是中文字符还是英文字符的方法
	            if(val.charCodeAt(i)<27||val.charCodeAt(i)>126)
	            { //中文和中文字符
	              strlen+=2;
	            }else{
	              strlen ++;
	            }
	        }
			// 自动截掉多余的字符。保留之前的限制内的字符长度
	        if(strlen>max){
	          this.form.number = val.substr(0,index-1);
	        }else{
	           this.form.number = val.substr(0,index);
	        }}
  }
};
</script>
