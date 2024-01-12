import request from '@/utils/request2'

// 查询航拍列表
export function listList(query) {
  return request({
    url: '/v1/video/list/list',
    method: 'get',
    params: query
  })
}

// 查询航拍详细
export function getList(id) {
  return request({
    url: '/v1/video/list/' + id,
    method: 'get'
  })
}

// 新增航拍
export function addList(data) {
  return request({
    url: '/v1/video/list',
    method: 'post',
    data: data
  })
}

// 修改航拍
export function updateList(data) {
  return request({
    url: '/v1/video/list',
    method: 'put',
    data: data
  })
}

// 删除航拍
export function delList(id) {
  return request({
    url: '/v1/video/list/' + id,
    method: 'delete'
  })
}

// 导出航拍
export function exportList(query) {
  return request({
    url: '/v1/video/list/export',
    method: 'get',
    params: query
  })
}