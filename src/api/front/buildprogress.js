import request from '@/utils/request2'

// 查询列表
export function listList(query) {
  return request({
    url: '/v1/ry/buildProgress/list',
    method: 'get',
    params: query
  })
}



// 新增
export function addList(data) {
  return request({
    url: '/v1/ry/buildProgress/add',
    method: 'post',
    data: data,
  })
}

// 修改ay
export function updateList(data) {
    return request({
      url: '/v1/ry/buildProgress/update',
      method: 'put',
      data: data
    })
  }
  
  // 删除ay
  export function delList(id) {
    return request({
      url: '/v1/ry/buildProgress/' + id,
      method: 'delete'
    })
  }

  export function getList(id) {
    return request({
      url: '/v1/ry/buildProgress/getinfo/' + id,
      method: 'get'
    })
  }

  export function getSection(){
    return request({
        url:'/v1/section/requireInfo/list',
        method: 'get'
    })
  }