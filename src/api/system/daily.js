import request from '@/utils/request2'

export function listList(data){
  return request({
    url:'/v1/dailyManagement/list',
    method:'get',
    params:data
  })
}

// 新增
export function adddata(data){
  return request({
    url:'/v1/dailyManagement/add',
    method:'post',
    data:data
  })
}

// 精确查询
export function shouinfo(data){
  return request({
    url:'v1/dailyManagement/' + data,
    method:'get'
  })
}

// 修改
export function infouodata(data){
  return request({
    url:'/v1/dailyManagement/update',
    method:'put',
    data:data
  })
}

// 删除
export function infodetel(data){
  return request({
    url:'/v1/dailyManagement/delete?id=' + data,
    method:'DELETE'
  })
}
