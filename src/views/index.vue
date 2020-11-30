<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="20" :xs="24">
        <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
          <el-form-item label="车号" prop="userName">
            <el-input
              v-model="queryParams.code"
              placeholder="请输入车号"
              clearable
              size="small"
              style="width: 240px"
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
              icon="el-icon-upload2"
              size="mini"
              @click="handleImport"
            >导入</el-button>
            <el-button
              type="primary"
              icon="el-icon-check"
              size="mini"
              @click="bulkCheck"
            >批量合计</el-button>
            <el-button
              type="primary"
              icon="el-icon-close"
              size="mini"
              @click="bulkUnCheck"
            >批量取消合计</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="bulkDel"
            >批量删除</el-button>
            <span class="sum-weight">总吨数：{{sumWeight}}</span>
            <span class="sum-weight-line">已合计总吨数：{{checkSumWeight}}</span>
            <span class="sum-weight-line">未合计总吨数：{{noCheckSumWeight}}</span>
          </el-col>
        </el-row>

        <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" align="center" />
          <el-table-column label="日期" align="center" prop="data" :show-overflow-tooltip="true" />
          <el-table-column label="车号" align="center" prop="code" :show-overflow-tooltip="true" />
          <el-table-column label="吨数" align="center" prop="weight" :show-overflow-tooltip="true" />
          <el-table-column label="导入时间" align="center" prop="createTime" />
          <el-table-column label="状态" align="center">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.checkStatus"
                :active-value = 1
                :inactive-value = 0
                @change="handleStatusChange(scope.row)"
              ></el-switch>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            class-name="small-padding fixed-width"
          >
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
              >修改</el-button>
            </template>
          </el-table-column>
        </el-table>

      </el-col>
    </el-row>

    <!-- 用户导入对话框 -->
    <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body>
      <el-upload
        ref="upload"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url"
        :disabled="upload.isUploading"
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

    <!-- 修改 -->
    <el-dialog title="修改详情" :visible.sync="updateOpen" width="700px" append-to-body>
      <el-form ref="form" :model="goodsLog" label-width="120px">
        <el-row>
          <el-col :span="16">
            <el-form-item label="日期" prop="jobName">
              <el-input v-model="goodsLog.data" placeholder="请输入日期" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="16">
            <el-form-item label="车号" prop="jobName">
              <el-input v-model="goodsLog.code" placeholder="请输入车号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="16">
            <el-form-item label="吨数" prop="jobName">
              <el-input v-model="goodsLog.weight" type="number" placeholder="吨数" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listUser, excelCheck, unExcelCheck, updateById, delById } from "@/api/system/user";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "User",
  data() {
    return {
      // 总吨数
      sumWeight: 0,
      // 未合计总吨数
      noCheckSumWeight: 0,
      // 已合计总吨数
      checkSumWeight: 0,
      // 列表数据
      userList: [],
      // 表单参数
      form: {},
      // 用户导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: "",
        // 是否禁用上传
        isUploading: false,
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "/excel/fileUpload"
      },
      updateOpen: false,
      // 查询参数
      queryParams: {
        code: '',
      },
      // 修改参数
      goodsLog: {
        id: '',
        data: '',
        code: '',
        weight: '',
      },
      // 多选
      ids: [],
      single: '',
      multiple: ''
    };
  },
  watch: {
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询用户列表 */
    getList() {
      this.loading = true;
      listUser(this.queryParams.code).then(response => {
          this.userList = response;
          var sumWeight = 0
          // 未合计总吨数
          var noCheckSumWeight = 0
          // 已合计总吨数
          var checkSumWeight = 0
          for (var index in this.userList){
            if(this.userList[index].checkStatus === 0){
              noCheckSumWeight += this.userList[index].weight * 100
            }else{
              checkSumWeight += this.userList[index].weight * 100
            }
            sumWeight += this.userList[index].weight * 100
          }
          this.sumWeight = sumWeight/100
          this.noCheckSumWeight = noCheckSumWeight/100
          this.checkSumWeight = checkSumWeight/100
          this.loading = false;
        }
      );
    },

    // 用户状态修改
    handleStatusChange(row) {
      let status = row.checkStatus
      let text = row.checkStatus === 0 ? "取消合计" : "合计";
      this.$confirm('确认要'+ text +'吗?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          var ids = [row.id]
          if(status === 0){
            return unExcelCheck(ids)
          }else{
            return excelCheck(ids)
          }
        }).then(() => {
          this.getList()
          
        });
    },

    // 批量合计
    bulkCheck(){
      var that = this
      this.$confirm('确认要批量合计吗?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          var ids = that.ids
          excelCheck(ids).then(response => {
            that.getList()
          })
        })
    },

    // 批量取消合计
    bulkUnCheck(){
      var that = this
      this.$confirm('确认要批量取消合计吗?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          var ids = that.ids
          unExcelCheck(ids).then(response => {
            that.getList()
          })
        })
    },

    // 批量删除
    bulkDel(){
      var that = this
      this.$confirm('确认要删除吗?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          var ids = that.ids
          delById(ids).then(response => {
            that.getList()
          })
        })
    },

    // 修改记录
    handleUpdate(row) {
      this.goodsLog.id = row.id
      this.goodsLog.data = row.data
      this.goodsLog.code = row.code
      this.goodsLog.weight = row.weight

      this.updateOpen = true;
    },

    // 取消按钮
    cancel() {
      this.updateOpen = false;
      this.resetQuery();
    },

    // 表单重置
    reset() {
      this.queryParams = {
        code: ''
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams = {
        code: ''
      };
      this.getList();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.single = selection.length != 1;
      this.multiple = !selection.length; 
    },

    /** 提交按钮 */
    submitForm: function() {
      let that = this
      updateById(this.goodsLog).then(function() {
        that.updateOpen = false;
        that.resetQuery();
      })
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = "用户导入";
      this.upload.open = true;
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit();
      this.upload.open = false
      this.getList()
    }
  }
};
</script>

<style>
  .sum-weight{
    padding-left: 12rem;
  }
  .sum-weight-line{
    padding-left: 3rem;
  }
</style>