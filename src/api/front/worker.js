import request from '@/utils/request2'

export function workerlist(data){
  return request({
    url:'/v1/workManagement/list',
    method:'get',
    params:data
  })
}

export function addworkers(data){
  return request({
    url:'/v1/workManagement/add',
    method:'post',
    data:data
  })
}
// depid
export function depid(){
  return request({
    url:'/accounts/v1/dept/list',
    method:'get'
  })
}
export function bumen(data){
  return request({
    url:'/accounts/v1/departments/nextDept',
    method:'get',
    params:{deptId:data}
  })
}
export function updatworker(data){
  return request({
    url:'/v1/workManagement/update',
    method:'put',
    data:data
  })
}
export function workerserchid(data){
  return request({
    url:'/v1/workManagement/'+data,
    method:'get',
  })
}
export function detelworker(data){
  return request({
    url:'/v1/workManagement/delete',
    method:'DELETE',
    params:{id:data}
  })
}












