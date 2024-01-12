<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
     <!-- <el-form-item label="参数键名" prop="id">
        <el-input
          v-model="queryParams.id"
          placeholder="请输入参数键名"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
     <!-- <el-form-item label="创建时间">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item> -->
      <!-- <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item> -->
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:config:add']"
        >新增</el-button>
      </el-col>
    <!--  <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:config:edit']"
        >修改</el-button>
      </el-col> -->
     <!-- <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:config:remove']"
        >删除</el-button>
      </el-col> -->
      <!-- <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:config:export']"
        >导出</el-button>
      </el-col> -->
     <!-- <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-refresh"
          size="mini"
          @click="handleClearCache"
          v-hasPermi="['system:config:remove']"
        >清理缓存</el-button>
      </el-col> -->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="configList" >
      <!-- <el-table-column type="selection" width="55" align="center" /> -->
       <el-table-column label="主键" align="center" prop="id"/>
      <el-table-column label="创建时间" align="center" prop="createTime" :formatter="getrdate"/>
      <el-table-column label="部门名称" align="center" prop="deptName" :show-overflow-tooltip="true" />
      <el-table-column label="更新时间" align="center" prop="updateTime":formatter="getrdate" :show-overflow-tooltip="true" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:config:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
             @click="handleDataScope(scope.row)"
            icon="el-icon-circle-check"
            v-hasPermi="['system:role:edit']"
          >数据权限</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:config:remove']"
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

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
       <el-form-item label="部门">
             <el-select v-model="form.deptId"  @change="dpdidchange">
               <el-option
                 v-for="item in dataScopeOptions"
                 :key="item.deptId"
                 :label="item.deptName"
                 :value="item.deptId"
               ></el-option>
             </el-select>
        </el-form-item>
        <el-form-item label="工队" v-if="form.deptId" >
              <el-select
              v-model="form.workIds"
               multiple
                filterable
                allow-create
                default-first-option
              >
                <el-option
                  v-for="item in dataScopeOptionst"
                  :key="item.deptId"
                  :label="item.deptName"
                  :value="item.deptId"
                ></el-option>
              </el-select>
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
          <el-form-item label="主键">
            <el-input v-model="form.id" :disabled="true" />
          </el-form-item>
          <el-form-item label="部门名称">
            <el-input v-model="form.deptName" :disabled="true" />
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
import { workerlist,addworkers,depid,bumen,updatworker,workerserchid,detelworker} from "@/api/front/worker";
import { datapower, powerdata, subpowerdata } from "@/api/front/camList";
export default {
  name: "Config",
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
      // 参数表格数据
      configList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 类型数据字典
      typeOptions: [],
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        configName: undefined,
        id: undefined,
        configType: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {},
      dataScopeOptions:[],
      dataScopeOptionst:[],
      openDataScope:false,
      deptOptions: [],
      deptExpand: true,
      deptNodeAll: false,
      defaultProps: {
        children: "childDept",
        label: "deptName"
      },
    };
  },
  created() {
    this.getList();
    // this.getDicts("sys_yes_no").then(response => {
    //   this.typeOptions = response.data;
    // });
    depid().then(res=>{
      this.dataScopeOptions=res.data.items
    })
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
             type:'work'
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
         rName:this.form.deptName,
         type:'work'
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
     },
    // 日期截取
    getrdate(row, column, cellValue, index){
    	if(cellValue == null){
    		return '-'
    	}else{
    		var date =new Date(cellValue) ;
    		var year = date.getFullYear();
    		var month = date.getMonth() + 1;
    		var day = date.getDate();
    		return year + '-' + month + '-' + day
    	}
    },
    /** 查询参数列表 */
    getList() {
      this.loading = true;
      workerlist({
          limit:10,
          offset:0
      }).then(response => {
          this.configList = response.data.items;
          this.total = response.data.total;
          this.loading = false;
        }
      );
    },
    // 部门选择
    dpdidchange(){
      if(this.form.workIds){
         this.form.workIds.length=0
      }

      bumen(this.form.deptId).then(res=>{
        this.dataScopeOptionst=res.data.items
      })
    },
    // 参数系统内置字典翻译
    typeFormat(row, column) {
      return this.selectDictLabel(this.typeOptions, row.configType);
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      // this.queryParams.pageNum = 1;
      dailyserchid(this.queryParams.id).then(response => {
       let array=[]
       array.push(response.data)
          this.configList = array
        }
      );
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加参数";
    },
    // 多选框选中数据
    // handleSelectionChange(selection) {
    //   this.ids = selection.map(item => item.id)
    //   console.log(this.ids)
    //   this.single = selection.length!=1
    //   this.multiple = !selection.length
    // },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      workerserchid(row.id).then(res=>{
        this.form=res.data
        this.form.deptId=res.data.deptId.toString()
        bumen(res.data.deptId).then(res=>{
          this.dataScopeOptionst=res.data.items
        })
        this.form.workIds=res.data.workIds.split(',')

          console.log(this.form)
         this.open = true;
         // this.title = "修改参数";
      })


    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
           if (this.form.id != undefined) {
            this.form.updateTime=new Date().getTime()
             this.form.workIds=this.form.workIds.toString()
             for(let i=0;i<this.dataScopeOptions.length;i++){
               if(this.form.deptId==this.dataScopeOptions[i].deptId){
                 this.form.deptName=this.dataScopeOptions[i].deptName
                  updatworker(this.form).then(response => {
                    this.msgSuccess("修改成功");
                    this.open = false;
                    this.getList();
                  });
               }
             }

          } else {
          this.form.createTime=new Date().getTime() //获取当前日期
          this.form.workIds=this.form.workIds.toString()
          for(let i=0;i<this.dataScopeOptions.length;i++){
            if(this.form.deptId==this.dataScopeOptions[i].deptId){
              this.form.deptName=this.dataScopeOptions[i].deptName
                addworkers(this.form).then(response => {
                  this.msgSuccess("新增成功");
                  this.open = false;
                  this.getList();
                });
            }
          }


          }
          }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const configIds = row.id
      this.$confirm('是否确认删除参数编号为"' + configIds + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return detelworker(configIds);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
    },
    /** 导出按钮操作 */
    // handleExport() {
    //   const queryParams = this.queryParams;
    //   this.$confirm('是否确认导出所有参数数据项?', "警告", {
    //       confirmButtonText: "确定",
    //       cancelButtonText: "取消",
    //       type: "warning"
    //     }).then(function() {
    //       return exportConfig(queryParams);
    //     }).then(response => {
    //       this.download(response.msg);
    //     })
    // },
    /** 清理缓存按钮操作 */
    handleClearCache() {
      clearCache().then(response => {
        this.msgSuccess("清理成功");
      });
    }
  }
};
</script>
