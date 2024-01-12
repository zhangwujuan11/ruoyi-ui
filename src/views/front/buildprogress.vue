<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="时间" prop="statsDay">
          <el-date-picker v-model="queryParams.statsDay" format="yyyyMM" value-format="yyyyMM" type="month" placeholder="选择月"  @keyup.enter.native="handleQuery">
          </el-date-picker>
      </el-form-item>
      <el-form-item label="标段" prop="sectionName">
         <el-select v-model="queryParams.sectionName"  placeholder="请选择标段名称"  clearable  @keyup.enter.native="handleQuery" >
            <el-option v-for="item in sectionList" :key="item.sectionId" :label="item.sectionName" :value="item.sectionName">
            </el-option>
          </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd"
          v-hasPermi="['ay:list:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate"
          v-hasPermi="['ay:list:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['ay:list:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport"
          v-hasPermi="['ay:list:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="listList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" />
      <el-table-column label="年月" align="center" prop="statsDay" />
      <el-table-column label="标段名称" align="center" prop="sectionName" />
      <el-table-column label="单位" align="center" prop="unit" />
      
      <el-table-column label="计划进度" align="center" prop="planProgress" />
      <el-table-column label="实际进度" align="center" prop="realProgress" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['ay:list:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
            v-hasPermi="['ay:list:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />


    <!-- 添加或修改ay对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="年月" prop="statsDay">
          <el-date-picker v-model="form.statsDay" format="yyyyMM" value-format="yyyyMM" type="month" placeholder="选择月">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-select v-model="form.unit" clearable placeholder="请选择单位">
            <el-option label="米" value="米" />
            <el-option label="千米" value="千米" />
            <el-option label="平方米" value="平方米" />
            <el-option label="平方千米" value="平方千米" />
            <el-option label="立方米" value="立方米" />
            <el-option label="万立方米" value="万立方米" />
            <el-option label="根" value="根" />
            <el-option label="元" value="元" />
            <el-option label="万元" value="万元" />
          </el-select>
        </el-form-item>
        <el-form-item label="计划进度" prop="planProgress">
          <el-input v-model="form.planProgress" placeholder="请输入计划进度" />
        </el-form-item>
        <el-form-item label="实际进度" prop="realProgress">
          <el-input v-model="form.realProgress" placeholder="请输入实际进度" />
        </el-form-item>
        <el-form-item label="标段名称" prop="ayType">
        <!-- <el-select v-model="form.sectionName" @input="selectChangeHandle"  clearable placeholder="请选择标段名称">
            <el-option v-for="( item, index) in sectionList" :key="index" :label="item.sectionName" :value="index">
            </el-option>
          </el-select> -->
		  <el-input v-model="form.sectionName"  placeholder="请输入标段名称"></el-input>
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
import { listList, getList, delList, addList, updateList, getSection } from "@/api/front/buildprogress";

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
      // ay表格数据
      listList: [],
      sectionList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        sectionId: null,
        statsDay: null,
        sectionName: null,
        planProgress: null,
        realProgress: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      }
    };
  },
  created() {
    this.getList();
    this.getSection();
  },
  methods: {
    selectChangeHandle(index) {
      this.form.sectionId = this.sectionList[index].sectionId;
      this.form.sectionName = this.sectionList[index].sectionName;
    },
    /** 查询ay列表 */
    getList() {
      this.loading = true;
      listList(this.queryParams).then(response => {
        this.listList = response.data.items;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    getSection() {
      this.loading = true;
      getSection(this.queryParams).then(response => {
        this.sectionList = response.data.items;
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
      this.form = {
        statsDay: null,
        sectionName: null,
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
      this.title = "添加施工信息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getList(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改施工信息";
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
      this.$confirm('是否确认删除施工编号为"' + ids + '"的数据项?', "警告", {
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
      this.$confirm('是否确认导出所有施工数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportList(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    }
  }
};
</script>