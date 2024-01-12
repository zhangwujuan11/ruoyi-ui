import request from '@/utils/request2'

// 查询build列表
export function listPartybuild(query) {
  return request({
    url: '/build/partybuild/list',
    method: 'get',
    params: query
  })
}

// 查询build详细
export function getPartybuild(id) {
  return request({
    url: '/build/partybuild/' + id,
    method: 'get'
  })
}

// 新增build
export function addPartybuild(data) {
  return request({
    url: '/build/partybuild',
    method: 'post',
    data: data
  })
}

// 修改build
export function updatePartybuild(data) {
  return request({
    url: '/build/partybuild',
    method: 'put',
    data: data
  })
}

// 删除build
export function delPartybuild(id) {
  return request({
    url: '/build/partybuild/' + id,
    method: 'delete'
  })
}

// 导出build
export function exportPartybuild(query) {
  return request({
    url: '/build/partybuild/export',
    method: 'get',
    params: query
  })
}