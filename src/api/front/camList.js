import request from '@/utils/request2'

// 查询ay列表
export function listList(query) {
  return request({
    url: '/ay/list/list',
    method: 'get',
    params: query
  })
}

// 查询ay详细
export function getList(id) {
  return request({
    url: '/ay/list/' + id,
    method: 'get'
  })
}

// 新增ay
export function addList(data) {
  return request({
    url: '/ay/list',
    method: 'post',
    data: data
  })
}

// 修改ay
export function updateList(data) {
  return request({
    url: '/ay/list',
    method: 'put',
    data: data
  })
}

// 删除ay
export function delList(id) {
  return request({
    url: '/ay/list/' + id,
    method: 'delete'
  })
}

// 导出ay
export function exportList(query) {
  return request({
    url: '/ay/list/export',
    method: 'get',
    params: query
  })
}

// 数据权限
export function datapower(data){
  return request({
    url:'/accounts/v1/dept/list',
    method:'get',
  })
}
// 获取当前数据
export function powerdata(data){
  return request({
    url:'/v1/resource/getCurrentResource/'+data.rid,
    method:'get',
    params:{type:data.type}
  })
}
// 确认提交
export function subpowerdata(data){
  let postdata= {
   rid: data.rid,
   rName: data.rName,
   type: data.type
  }
  return request({
    url:"/v1/resource/actions/allocate/" + data.deptIds,
    method:'post',
    params:postdata
  })
}
