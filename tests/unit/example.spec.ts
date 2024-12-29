import { mount } from '@vue/test-utils'
import MeasurementPage from "../../src/views/tabs/MeasurementPage.vue"
import { beforeEach, describe, expect, test } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

describe('MeasurementPage.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  test('renders MeasurementPage correctly', () => {
    const wrapper = mount(MeasurementPage)
    expect(wrapper.exists()).toBe(true)
  })
})