import { mount } from '@vue/test-utils'
import MeasurementPage from "../../src/views/tabs/MeasurementPage.vue"
import { beforeEach, describe, expect, test } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'


describe('MeasurementPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  }),
  test('renders tab 1 Tab1Page', () => {
    const wrapper = mount(MeasurementPage)
    expect(wrapper.text()).toMatch('Tab 1 page')
  })
})