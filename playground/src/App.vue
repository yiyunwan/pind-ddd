<script setup lang="ts">
import Demos from './views/demos'
import { ConfigProvider } from 'ant-design-vue'
import zh_CN from 'ant-design-vue/es/locale-provider/zh_CN'
</script>

<template>
  <ConfigProvider :locale="zh_CN">
    <Demos />
  </ConfigProvider>
</template>
