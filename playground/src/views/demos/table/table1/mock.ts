import { sleep } from '@/utils'
import type { Table1AddParams, Table1EditParams, Table1ListParams } from './type'

const database = [
  {
    id: 1,
    name: '张三'
  },
  {
    id: 2,
    name: '李四'
  }
]

let id = database.length + 1

export async function add(data: Table1AddParams) {
  await sleep(1000)
  const { name } = data
  database.push({
    id: ++id,
    name
  })
  return {
    code: 200,
    msg: 'success',
    data: true
  }
}

export async function edit(data: Table1EditParams) {
  await sleep(1000)
  const { id, name } = data
  const index = database.findIndex((item) => item.id === id)
  if (index > -1) {
    database[index] = {
      id,
      name
    }
    return {
      code: 200,
      msg: 'success',
      data: {}
    }
  } else {
    return {
      code: 404,
      msg: 'not found'
    }
  }
}

export async function del(id: number) {
  await sleep(1000)
  const index = database.findIndex((item) => item.id === id)
  if (index > -1) {
    database.splice(index, 1)
    return {
      code: 200,
      msg: 'success'
    }
  } else {
    return {
      code: 404,
      msg: 'not found'
    }
  }
}

export async function search(params: Table1ListParams) {
  const { page = 1, pageSize = 10, name = '' } = params
  const list = database
    .filter((item) => {
      return item.name.includes(name)
    })
    .slice((page - 1) * pageSize, page * pageSize)
  const data = {
    list,
    pagination: {
      total: list.length,
      page,
      pageSize
    }
  }
  console.log(data)
  return {
    code: 200,
    msg: 'success',
    data
  }
}
