import request from './request'

export function generateData(data) {
  return request({
    url: '/api/datagen/generate',
    method: 'post',
    data
  })
}
