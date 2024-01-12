<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd"
          v-hasPermi="['video:list:add']">新增</el-button>
      </el-col>
    </el-row>
    <el-table v-loading="loading" :data="listList">
      <el-table-column label="参数主键" align="center" prop="id" />
      <el-table-column label="管理月份" align="center" prop="managementDate" />
      <el-table-column label="管理评分" align="center" prop="managementGrade" />
      <el-table-column label="管理项" align="center" prop="managementItem" />
      <el-table-column label="修改时间" align="center" prop="updateTime" :formatter="dateFormat"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['video:list:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
            v-hasPermi="['video:list:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.offset" :limit.sync="queryParams.limit"
      @pagination="getList" />
      <!-- 添加修改的表单 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="管理月份" prop="ayVideosNote">
         <el-date-picker
             v-model="form.managementDate"
             size="small"
             style="width: 240px"
             value-format="yyyyMM"
             type="month"
             range-separator="-"
             start-placeholder="开始日期"
             end-placeholder="结束日期"
           ></el-date-picker>
         </el-form-item>
        <el-form-item label="管理评分" prop="ayVideoCover">
          <el-input v-model="form.managementGrade" placeholder="请输入管理评分" />
        </el-form-item>
        <el-form-item label="管理项" prop="ayVideoCover">
          <el-input v-model="form.managementItem" placeholder="请输入管理项" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  <!-- 分配角色数据权限对话框 -->
  <!--  <el-dialog :title="title" :visible.sync="openDataScope" width="500px" append-to-body>
      <el-form :model="form" label-width="80px">
        <el-form-item label="航拍文件名">
          <el-input v-model="form.ayVideoCover" :disabled="true" />
        </el-form-item>
        <el-form-item label="航拍ID">
          <el-input v-model="form.id" :disabled="true" />
        </el-form-item>
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
    </el-dialog> -->
  </div>
</template>

<script>
// import { listList, getList, delList, addList, updateList, exportList } from "@/api/front/aerialvideo";
// import { datapower, powerdata, subpowerdata } from "@/api/front/camList";
// import { uploadFile } from "@/api/front/file";
import { listList, adddata, shouinfo, infouodata, infodetel } from "@/api/system/daily";
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
      // 总条数
      total: 0,
      // 航拍表格数据
      listList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
       limit: 10,
       offset: 0
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
      // 表单校验
      rules: {
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    dateFormat(row, column) {
        var data = row[column.property];
        var t = new Date(data);//row 表示一行数据, dateTime 表示要格式化的字段名称
        var year = t.getFullYear(),
            month = t.getMonth() + 1,
            day = t.getDate(),
            hour = t.getHours(),
            min = t.getMinutes(),
            sec = t.getSeconds();
        var newTime = year + '-' +
            (month < 10 ? '0' + month : month) + '-' +
            (day < 10 ? '0' + day : day)

        return newTime
    },
    // 取消按钮（数据权限）
    cancelDataScope() {
      this.openDataScope = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        createTime: null,
        managementDate: null,
        managementGrade: null,
        managementItem: null,
        updateTime:null
      };
      this.resetForm("form");
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
    /** 查询航拍列表 */
    getList() {
      this.loading = true;
      listList(this.queryParams).then(response => {
        this.listList = response.data.items;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    beforeAvatarUpload(file) {
            var formData = new formData(file);
            uploadFile(formData).then(res => {
                    if (res.code == 200) {
                        this.form.img = res.data.objectUrl
                        this.img = res.data.objectUrl
                    }
                })
            return false;
        },
    // 取消按钮
    cancel() {
      this.reset();
      this.open = false;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加管理日常";
    },
    // 修改
    handleUpdate(i){
      this.reset();
      shouinfo(i.id).then(res=>{
        this.form=res.data
      })
      this.open = true;
      this.title = "修改管理日常";
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            this.form.updateTime=(new Date).getTime()
            infouodata(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            this.form.updateTime=(new Date).getTime()
            this.form.createTime=(new Date).getTime()
            adddata(this.form).then(response => {
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
        return infodetel(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    }
  }
};
</script>
<style scoped>
  /deep/.avatar-uploader .el-upload {
      line-height:100% !important;
      height: 100% !important;
      }
</style>
