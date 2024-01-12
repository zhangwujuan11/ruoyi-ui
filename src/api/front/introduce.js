import request from '@/utils/request2'

// 查询列表
export function listList(query) {
  return request({
    url: '/v1/page/search/list',
    method: 'get',
    params: query
  })
}


// 新增
export function addList(data) {
  return request({
    url: '/v1/page/add/info',
    method: 'post',
    data: data,
  })
}

// 修改ay
export function updateList(data) {
  return request({
    url: '/v1/page/modify/info',
    method: 'put',
    data: data
  })
}

 // 删除ay
 export function delList(ids) {
  return request({
    url: '/v1/page/remove/' + ids,
    method: 'delete'
  })
}

  //获取下拉列表
  export function getDept(){
    return request({
        url:'/v1/page/accounts/v1/dept/list',
        method: 'get'
    })
  }

  export function getList(id) {
    return request({
      url: '/v1/page/get/info/' + id,
      method: 'get'
    })
  }