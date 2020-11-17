import request from '@/utils/request'

// 查询用户列表
export function listUser(query) {
  return request({
    url: '/excel/by?code='+query,
    method: 'get'
  })
}

// 查询用户列表
export function excelCheck(query) {
  return request({
    url: '/excel/check',
    method: 'put',
    data: query
  })
}

// 查询用户列表
export function unExcelCheck(query) {
  return request({
    url: '/excel/unCheck',
    method: 'put',
    data: query
  })
}

