import q from 'fus-q-request'
import { f } from '@/methods'
import { _fetch } from '@/methods/api'
import { apiPath, IdentityGUID } from './setting'

export function getToken({ option }) {
  let path = '/system/getToken'
    , body = { IdentityGUID, ApiId: path, RequestorId: '' }
  return _fetch('POST', apiPath, body, option)
}

export function login({ params, option }) {
  let path = '/system/login'
  return f('POST', apiPath, path, params, option)
}

export function getSiteList({ params, option }) {
  let path = '/system/site/list'
  return f('POST', apiPath, path, params, option)
}

export function getNoticeList({ option }) {
  let path = '/system/notice/list'
    , body = { IdentityGUID, ApiId: path }
  return _fetch('POST', apiPath, body, option)
}