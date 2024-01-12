import request from '@/utils/request2'
// import axios from ''

export function listMfolder(query) {
  return request({
    url: '/mfolder/mfolder/list',
    method: 'get',
    params: query
  })
}

// 查询mfolder详细
export function getMfolder(id) {
  return request({
    url: '/mfolder/mfolder/' + id,
    method: 'get'
  })
}

// 新增mfolder
export function addMfolder(data) {
  return request({
    url: '/mfolder/mfolder',
    method: 'post',
    data: data
  })
}

// 修改mfolder
export function updateMfolder(data) {
  return request({
    url: '/mfolder/mfolder',
    method: 'put',
    data: data
  })
}

// 删除mfolder
export function delMfolder(id) {
  return request({
    url: '/mfolder/mfolder/' + id,
    method: 'delete'
  })
}

// 导出mfolder
export function exportMfolder(query) {
  return request({
    url: '/mfolder/mfolder/export',
    method: 'get',
    params: query
  })
}


export function listMfiles(query) {
  return request({
    url: '/mfiles/mfiles/list',
    method: 'get',
    params: query
  })
}

// 查询mfiles详细
export function getMfiles(id) {
  return request({
    url: '/mfiles/mfiles/' + id,
    method: 'get'
  })
}

// 新增mfiles
export function addMfiles(data) {
  return request({
    url: '/mfiles/mfiles',
    method: 'post',
    data: data
  })
}

// 修改mfiles
export function updateMfiles(data) {
  return request({
    url: '/mfiles/mfiles',
    method: 'put',
    data: data
  })
}

// 删除mfiles
export function delMfiles(id) {
  return request({
    url: '/mfiles/mfiles/' + id,
    method: 'delete'
  })
}

// 导出mfiles
export function exportMfiles(query) {
  return request({
    url: '/mfiles/mfiles/export',
    method: 'get',
    params: query
  })
}

export function uploadFile(data) {
  return request({
    url: '/v1/communal/files/scopes/video/attachment/actions/upload',
    method: 'post',
    async: false,
    cache: false,
    processData: false,// 告诉axios不要去处理发送的数据(重要参数)
    contentType: false,   // 告诉axios不要去设置Content-Type请求头
    data: data
  })
}

// 党员
// 党员列表
export function menlist(){
	return request({
		url:'/v1/partyMemberManagement/list',
		method:'get'
	})
}
// 党员详情
export function menlistinfo(data){
	return request({
		url:'/v1/partyMemberManagement/' + data,
		method:'get'
	})
}
// 党员修改
export function updatemen(data){
	return request({
		url:'/v1/partyMemberManagement/update',
		method:'put',
		data:data
	})
}

// 混泥土导入实验室数据
export function concreteimport(data){
	return request({
		url:'/v1/labs/concrete/import',
		method:'POST',
		params:{
			multipartFile:data
		}
	})
}