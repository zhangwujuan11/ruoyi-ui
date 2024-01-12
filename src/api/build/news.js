import request from '@/utils/request2'

// 查询siteinfo列表
export function listSiteinfo(query) {
  return request({
    url: '/siteinfo/siteinfo/list',
    method: 'get',
    params: query
  })
}

// 查询siteinfo详细
export function getSiteinfo(id) {
  return request({
    url: '/siteinfo/siteinfo/' + id,
    method: 'get'
  })
}

// 新增siteinfo
export function addSiteinfo(data) {
  return request({
    url: '/siteinfo/siteinfo',
    method: 'post',
    data: data
  })
}

// 修改siteinfo
export function updateSiteinfo(data) {
  return request({
    url: '/siteinfo/siteinfo',
    method: 'put',
    data: data
  })
}

// 删除siteinfo
export function delSiteinfo(id) {
  return request({
    url: '/siteinfo/siteinfo/' + id,
    method: 'delete'
  })
}

// 导出siteinfo
export function exportSiteinfo(query) {
  return request({
    url: '/siteinfo/siteinfo/export',
    method: 'get',
    params: query
  })
}


// echarts
export function getechartslist(){
	return request({
		url:'/v1/echartsManagement/list',
		method:'get'
	})
}

// echarts详情
export function echartsinfo(data){
	return request({
		url:'/v1/echartsManagement/' + data,
		method:'get'
	})
}

// 修改exchats
export function updateceharts(data){
	return request({
		url:'/v1/echartsManagement/update',
		method:'put',
		data:data
	})
}
// exchats新增
export function echartsadd(data){
	return request({
		url:'/v1/echartsManagement/add',
		method:'post',
		data:data
	})
}
// exchats删除
export function detelecharts(data){
	return request({
		url:'/v1/echartsManagement/delete',
		method:'DELETE',
		params:{
			id:data
		}
	})
}