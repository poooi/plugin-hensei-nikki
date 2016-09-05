import { createSelector } from 'reselect'
import { extensionSelectorFactory } from 'views/utils/selectors'

const REDUCER_EXTENSION_KEY = 'poi-plugin-hensei-nikki'

export const initStatusSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({ init: (state.initStatus || {init: false}).init })
)

export const henseiDataSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({ data: (state.henseiData || {data: {}}).data })
)
