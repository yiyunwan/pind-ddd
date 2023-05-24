import { sleep } from '@/utils'
import type { FormatListParams } from './type'

const database = [
  {
    id: 1,
    name: '张三',
    photo: 'https://avatars.githubusercontent.com/u/499551?v=4',
    isTeacher: true,
    blog: 'http://www.baidu.com',
    birthday: 1627661800000,
    role: 'admin'
  },
  {
    id: 2,
    name: '李四',
    photo: 'https://avatars.githubusercontent.com/u/499549?v=4',
    isTeacher: false,
    blog: 'http://www.baidu.com',
    birthday: 1627660800000,
    role: 'student'
  }
]

export async function search(params: FormatListParams) {
  await sleep(1500)
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
  return {
    code: 200,
    msg: 'success',
    data
  }
}
