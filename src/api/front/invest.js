import request from '@/utils/request2'

// 查询列表
export function listList(query) {
  return request({
    url: '/v1/home/invest/search/list',
    method: 'get',
    params: query
  })
}



// 新增
export function addList(data) {
  return request({
    url: '/v1/home/invest/info/add',
    method: 'post',
    data: data,
  })
}

// 修改ay
export function updateList(data) {
  return request({
    url: '/v1/home/invest/info/modify',
    method: 'put',
    data: data
  })
}

 // 删除ay
 export function delList(ids) {
  return request({
    url: '/v1/home/invest/del/' + ids,
    method: 'delete'
  })
}

  export function getList(id) {
    return request({
      url: '/v1/home/invest/get/info/' + id,
      method: 'get'
    })
  }