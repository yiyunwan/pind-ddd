import { type ISchema } from '@formily/vue'

export const SearchSchema: ISchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: '姓名',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': {
        placeholder: '请输入姓名'
      }
    },
    search: {
      type: 'void',
      'x-decorator': 'FormItem',
      'x-component': 'Button',
      'x-component-props': {
        type: 'primary',
        loading: '{{ $table.searching }}',
        onClick: '{{() => $table.toSearch()}}',
        style: {
          marginLeft: '10px',
          marginRight: '10px'
        }
      },
      'x-content': '搜索'
    },
    add: {
      type: 'void',
      'x-decorator': 'FormItem',
      'x-component': 'Button',
      'x-component-props': {
        type: 'primary',
        onClick: '{{() => $table.toAdd()}}'
      },
      'x-content': '新增'
    }
  }
}

export const AddSchema: ISchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: '姓名',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': {
        placeholder: '请输入姓名'
      },
      required: true
    }
  }
}
