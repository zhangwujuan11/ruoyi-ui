import request from '@/utils/request2'

// 查询实验列表
export function listList(query) {
  return request({
    url: '/v1/face/equipment/search/list',
    method: 'get',
    params: query
  })
}
// 新增实验
export function addList(data) {
  return request({
    url: '/v1/face/equipment/action/add',
    method: 'post',
    data: data
  })
}

// 查询实验详细
export function getList(id) {
  return request({
    url: '/v1/face/equipment/' + id,
    method: 'get'
  })
}

// 删除实验
export function delList(id) {
  return request({
    url: '/v1/face/equipment/' + id,
    method: 'delete'
  })
}

// 修改实验
export function updateList(data) {
  return request({
    url: '/v1/face/equipment/action/edit/' + data.id,
    method: 'put',
    data: data
  })
}














