import { computed, isRef, ref, shallowRef, watchEffect } from 'vue'

const AnnotationMap = {
  ref,
  shallowRef,
  computed
} as const

export function isAnnotation(annotation: any) {
  return Object.values(AnnotationMap).includes(annotation)
}

type ValueOf<T> = keyof T extends never ? never : T[keyof T]

export type Annotation = ValueOf<typeof AnnotationMap>

export type Annotations<T = any> = {
  [key in keyof T]?: Annotation
}

export function getObservableMaker(annotation: any) {
  return ({ target, key }: any) => {
    let result!: any
    if (annotation === computed) {
      result = computed(() => {
        return target[key]
      })
      result.value
    } else {
      result = annotation(target[key])
    }
    Object.defineProperties(target, {
      [key]: {
        get() {
          if (isRef(result)) {
            return result.value
          } else {
            return result
          }
        },
        set(value) {
          if (isRef(result)) {
            result.value = value
          } else {
            result = value
          }
        }
      }
    })
  }
}

export function define<Target extends object = any>(
  target: Target,
  annotations?: Annotations<Target>
): Target {
  for (const key in annotations) {
    const annotation = annotations[key]
    if (isAnnotation(annotation)) {
      getObservableMaker(annotation)({
        target: target,
        key: key
      })
    }
  }

  return target
}

class Test {
  ref1 = 1

  get get1() {
    return this.ref1 * 2
  }
  constructor() {
    define(this, {
      ref1: ref,
      get1: computed
    })
  }
}

const test = new Test()

watchEffect(() => {
  console.log(test.ref1)
})

watchEffect(() => {
  console.log(test.get1)
})

test.ref1 = 3
