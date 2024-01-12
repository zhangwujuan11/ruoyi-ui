<template>
    <div class="app-container">
        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd"
                    v-hasPermi="['invest:invest:add']">新增</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="success" icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate"
                    v-hasPermi="['invest:invest:edit']">修改</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
                    v-hasPermi="['invest:invest:remove']">删除</el-button>
            </el-col>
            <right-toolbar :showSearch.sync="showSearch" @queryTable="investList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="investList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="主键id" align="center" prop="id" />
            <el-table-column label="已完成投资" align="center" prop="invsetDone" >
                <template slot-scope="scope">
                    <span>{{scope.row.investDone/10000/100}}</span>
                </template>
            </el-table-column>
            <el-table-column label="投资总额" align="center" prop="investSum" >
                <template slot-scope="scope">
                    <span>{{scope.row.investSum/10000/100}}</span>
                </template>
            </el-table-column>
            <el-table-column label="已完成占比" align="center" prop="doneRate" />
            <el-table-column label="首页图片" width="100">
                <template slot-scope="scope">
                    <el-image style="width: 100px; height: 100px" :src="scope.row.homeImg"></el-image>
                </template>
            </el-table-column>
            <el-table-column label="状态" align="center" prop="status">
                <template slot-scope="scope">
                    <el-tag :type="scope.row.status == '1' ? 'success' : 'danger'">
                     <span v-if="scope.row.status === '1'">已启用</span>
                    <span v-if="scope.row.status === '0'">未启用</span>
                    </el-tag>
                   
                </template>
            </el-table-column>
            <el-table-column label="最后更新时间" align="center" prop="updateTime" :formatter="dateFormat">

            </el-table-column>
            <el-table-column label="创建时间" align="center" prop="createTime" :formatter="dateFormat" />
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template slot-scope="scope">
                    <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
                        v-hasPermi="['invest:invest:edit']">修改</el-button>
                    <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                        v-hasPermi="['invest:invest:remove']">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
            :limit.sync="queryParams.pageSize" @pagination="listList" />

        <!-- 添加或修改siteinfo对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="100px">
                <el-form-item label="已完成投资" prop="mfteTitle">
                    <el-input style="width: 180px" v-model="form.investDone"  placeholder="请输入数字" /> 万元
                </el-form-item>
                <el-form-item label="投资总额" prop="mfteTitle">
                    <el-input style="width: 180px" v-model="form.investSum" placeholder="请输入数字" /> 万元
                </el-form-item>
                <el-form-item label="已完成投资占比" prop="doneRate"  label-width="100px">
                    <el-input style="width: 180px" v-model="form.doneRate" placeholder="请输入小数" label-width="100px" /> %
                </el-form-item>
                <el-form-item label="是否默认" prop="status">
                    <el-switch v-model="form.status" active-color="#13ce66" inactive-color="#ff4949" active-value="1"
                        inactive-value="0" active-text="是" inactive-text="否">
                    </el-switch>
                </el-form-item>
                <el-form-item label="首页图片" prop="homeImg">
                    <img :src="homeImg" v-if="homeImg" style="width: 300px">
                    <el-upload class="avatar-uploader" action="https://jsonplaceholder.typicode.com/posts/"
                        :file-list="fileList" list-type="picture-card" :auto-upload="true"
                        :before-upload="beforeAvatarUpload">
                        <i class="el-icon-plus avatar-uploader-icon"></i>
                    </el-upload>
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
import { listList, addList, updateList, delList, getList } from "@/api/front/invest";
import { uploadFile } from "@/api/front/file";

import Vue from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
export default {
    name: "invest",
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
            // 表格数据
            investList: [],
            fileList: [],
            // 弹出层标题
            title: "",
            // 是否显示弹出层
            open: false,
            homeImg: "",
            // 查询参数
            queryParams: {
                pageNum: 1,
                pageSize: 10,
                id: null,
                updateTime: new Date().valueOf(),
                createTime: new Date().valueOf(),
                homeImg: null,
                status: null
            },
            // 表单参数
            form: {
                homeImg: ""
            },
            // 表单校验
            rules: {
            },
            //富文本相关
            editor: null,
            html: '<p>hello</p>',
            toolbarConfig: {},
        };
    },
    components: { Editor, Toolbar },
    created() {
        this.listList();
    },
    beforeDestroy() {
        const editor = this.editor
        if (editor == null) return
        editor.destroy() // 组件销毁时，及时销毁编辑器
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
                (day < 10 ? '0' + day : day) + ' ' +
                (hour < 10 ? '0' + hour : hour) + ':' +
                (min < 10 ? '0' + min : min) + ':' +
                (sec < 10 ? '0' + sec : sec);

            return newTime
        },
        /** 查询列表 */
        listList() {
            this.loading = true;
            listList(this.queryParams).then(response => {
                this.investList = response.data.items;
                this.total = response.data.total;
                this.loading = false;
            });
        },
        beforeAvatarUpload(file) {
            var formData = new FormData();
            formData.append('file', file)
            uploadFile(formData).then(res => {
                if (res.code == 200) {
                    this.form.homeImg = res.data.objectUrl,
                        this.homeImg = res.data.objectUrl;
                }
            })
            return false;
        },
        onCreated(editor) {
            this.editor = Object.seal(editor) // 一定要用 Object.seal() ，否则会报错
        },
        // 取消按钮
        cancel() {
            this.reset();
            this.open = false;

        },
        // 表单重置
        reset() {
            this.homeImg = null
            this.form = {
                id: this.id,
                updateTime: new Date().valueOf(),
                createTime: new Date().valueOf(),
                homeImg: null
            };
            this.resetForm("form");
        },
        /** 搜索按钮操作 */
        handleQuery() {
            this.queryParams.pageNum = 1;
            this.listList();
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
            this.title = "添加投资信息";
        },
        /** 修改按钮操作 */
        handleUpdate(row) {
            this.reset();
            const id = row.id || this.ids
            getList(id).then(response => {
                this.form = response.data;
                this.form.investDone=this.form.investDone/10000/100
                this.form.investSum=this.form.investSum/10000/100
                this.homeImg = this.form.homeImg
                this.open = true;
                this.title = "修改投资信息";
            });
        },
        /** 提交按钮 */
        submitForm() {
            this.$refs["form"].validate(valid => {
                if (valid) {
                    this.form.updateTime = new Date().valueOf(),
                        this.form.createTime = new Date().valueOf()
                        this.form.investDone = this.form.investDone*10000*100
                        this.form.investSum = this.form.investSum*10000*100
                    if (this.form.id != null) {
                        updateList(this.form).then(response => {
                            this.msgSuccess("修改成功");
                            this.open = false;
                            this.listList();
                        });
                    } else {
                        addList(this.form).then(response => {
                            this.msgSuccess("新增成功");
                            this.open = false;
                            this.listList();
                        });
                    }
                }
            });
        },
        /** 删除按钮操作 */
        handleDelete(row) {
            const ids = row.id || this.ids;
            this.$confirm('是否确认删除投资信息编号为"' + ids + '"的数据项?', "警告", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
            }).then(function () {
                return delList(ids);
            }).then(() => {
                this.listList();
                this.msgSuccess("删除成功");
            })
        },
        /** 导出按钮操作 */
        handleExport() {
            const queryParams = this.queryParams;
            this.$confirm('是否确认导出所有投资信息数据项?', "警告", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
            }).then(function () {
                return exportSiteinfo(queryParams);
            }).then(response => {
                this.download(response.msg);
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