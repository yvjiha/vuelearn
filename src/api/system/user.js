import request from '@/utils/request'

// 查询用户列表
export function listUser(query) {
  return request({
    url: '/excel/by?code='+query,
    method: 'get'
  })
}

// 合计
export function excelCheck(query) {
  return request({
    url: '/excel/check',
    method: 'put',
    data: query
  })
}

// 取消合计
export function unExcelCheck(query) {
  return request({
    url: '/excel/unCheck',
    method: 'put',
    data: query
  })
}

// 修改
export function updateById(param) {
  return request({
    url: '/excel',
    method: 'put',
    data: param
  })
}

