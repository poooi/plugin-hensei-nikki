import { createSelector } from 'reselect'
import memoize from 'fast-memoize'
import { extensionSelectorFactory } from 'views/utils/selectors'

const REDUCER_EXTENSION_KEY = 'poi-plugin-hensei-nikki'

export const initStatusSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({ init: (state.initStatus || {init: false}).init })
)

export const henseiDataSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => state.henseiData
)

export const fleetsByTitleSelector = memoize(title => {
  createSelector([
    henseiDataSelector,
  ], henseiData => ({ fleets: henseiData[title].fleets }))
})
