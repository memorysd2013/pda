import { f } from '@/methods'
import { apiPath } from './setting'

// case
export function getCaseList({ params, option }) {
  let path = '/case/info/list'
  return f('POST', apiPath, path, params, option)
}

export function getCaseById({ params, option }) {
  let path = '/case/info/one'
  return f('POST', apiPath, path, params, option)
}

export function createCaseCheckRecord({ params, option }) {
  let path = '/case/bt/check'
  return f('POST', apiPath, path, params, option)
}

export function createCaseArrivalRecord({ params, option }) {
  let path = '/case/bt/onlab'
  return f('POST', apiPath, path, params, option)
}

export function createCaseCompleteRecord({ params, option }) {
  let path = '/case/bt/complete'
  return f('POST', apiPath, path, params, option)
}

export function createCaseSaveRecord({ params, option }) {
  let path = '/case/bt/save'
  return f('POST', apiPath, path, params, option)
}

export function createCaseSignRecord({ params, option }) {
  let path = '/case/bt/sign'
  return f('POST', apiPath, path, params, option)
}