import request from '@/utils/request2'

// 查询列表
export function listList(query) {
  return request({
    url: '/v1/section/search/list',
    method: 'get',
    params: query
  })
}



// 新增
export function addList(data) {
  return request({
    url: '/v1/section/add',
    method: 'post',
    data: data,
  })
}

// 修改ay
export function updateList(data) {
  return request({
    url: '/v1/section/update/info',
    method: 'put',
    data: data
  })
}

 // 删除ay
 export function delList(ids) {
  return request({
    url: '/v1/section/delete/' + ids,
    method: 'delete'
  })
}

  //获取下拉列表
  export function getDept(){
    return request({
        url:'/accounts/v1/builder/departments',
        method: 'get'
    })
  }
  
  //获取下拉列表2
  export function getDeptt(){
    return request({
        url:'/accounts/v1/supervisor/departments',
        method: 'get'
    })
  }

  export function getList(sectionId) {
    return request({
      url: '/v1/section/get/detail/' + sectionId,
      method: 'get'
    })
  }
