import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { Popover, Position, PopoverInteractionKind } from '@blueprintjs/core'
import styled from 'styled-components'
import { constSelector, basicSelector } from 'views/utils/selectors'
import { getDetails } from '../../utils/calc'
import { Fleet, FleetShip } from '../../utils/calc'

const Overlay = styled.div`
  padding: 1em;
`

type DetailsResult = ReturnType<typeof getDetails>
export interface LosFormula { total: number | null | undefined }

export interface DetailsProps {
  fleet: Fleet
  $equips: HenseiConstants['$equips']
  $ships: HenseiConstants['$ships']
  lv: number
}

export interface LosDisplay {
  value: number
  source: 'formula33' | 'legacy' | 'fall'
}

export interface LosInputs {
  saku25: LosFormula
  saku25a: LosFormula
  saku33: LosFormula
}

const isAvailable = (value: number | null | undefined): value is number =>
  typeof value === 'number' && !Number.isNaN(value)

export function getLosDisplay(details: LosInputs): LosDisplay | undefined {
  if (isAvailable(details.saku33.total) && details.saku33.total !== 0) {
    return { value: details.saku33.total, source: 'formula33' }
  }
  if (isAvailable(details.saku25.total)) return { value: details.saku25.total, source: 'legacy' }
  if (isAvailable(details.saku25a.total)) return { value: details.saku25a.total, source: 'fall' }
  return undefined
}

function formulaAvailable(formula: LosFormula): boolean {
  return isAvailable(formula.total)
}

function translate(key: string): string {
  return window.i18n.main.__(key)
}

export class Details extends Component<DetailsProps, { details?: DetailsResult }> {
  state: { details?: DetailsResult } = {}

  componentDidMount(): void {
    this.updateDetails(this.props)
  }

  componentWillReceiveProps(nextProps: DetailsProps): void {
    if (
      nextProps.fleet !== this.props.fleet
      || nextProps.$equips !== this.props.$equips
      || nextProps.$ships !== this.props.$ships
      || nextProps.lv !== this.props.lv
    ) this.updateDetails(nextProps)
  }

  private updateDetails(props: DetailsProps): void {
    const fleet = props.fleet.filter((ship): ship is FleetShip => Boolean(ship))
    this.setState({ details: getDetails(fleet, props.$equips, props.$ships, props.lv) })
  }

  render(): JSX.Element {
    const { details } = this.state
    if (!details) return <div />

    const { tyku, saku25, saku25a, saku33, saku33x3, saku33x4, soku } = details
    const los = getLosDisplay({ saku25, saku25a, saku33 })
    return (
      <div className="details-container" style={{ display: 'flex', textAlign: 'center' }}>
        {soku && <span style={{ flex: 1 }}>{translate(soku)}</span>}
        <span style={{ flex: 1 }}>
          <Popover
            position={Position.BOTTOM}
            interactionKind={PopoverInteractionKind.HOVER_TARGET_ONLY}
            content={(
              <Overlay id="hensei-nikki-details-FP">
                <div>{translate('Minimum FP')}: {tyku.min}</div>
                <div>{translate('Maximum FP')}: {tyku.max}</div>
                <div>{translate('Basic FP')}: {tyku.basic}</div>
              </Overlay>
            )}
          >
            <span>{translate('Fighter Power')}: {tyku.max}</span>
          </Popover>
        </span>
        <span style={{ flex: 1 }}>
          <Popover
            position={Position.BOTTOM}
            interactionKind={PopoverInteractionKind.HOVER_TARGET_ONLY}
            content={(
              <Overlay id="hensei-nikki-details-recon">
                {formulaAvailable(saku33) && (
                  <>
                    <div className="recon-title"><span>{translate('Formula 33')}</span></div>
                    <div className="recon-entry"><span className="recon-item">× 1</span><span>{saku33.total}</span></div>
                    <div className="recon-entry"><span className="recon-item">× 3 (6-2 & 6-3)</span><span>{saku33x3.total}</span></div>
                    <div className="recon-entry"><span className="recon-item">× 4 (3-5 & 6-1)</span><span>{saku33x4.total}</span></div>
                  </>
                )}
                {(formulaAvailable(saku25) || formulaAvailable(saku25a)) && (
                  <div className="recon-title"><span>{translate('Formula 2-5')}</span></div>
                )}
                {formulaAvailable(saku25a) && (
                  <div className="recon-entry"><span className="recon-item">{translate('Fall')}</span><span>{saku25a.total}</span></div>
                )}
                {formulaAvailable(saku25) && (
                  <div className="recon-entry"><span className="recon-item">{translate('Legacy')}</span><span>{saku25.total}</span></div>
                )}
              </Overlay>
            )}
          >
            {los && (
              <span>
                {translate('LOS')}: {los.value.toFixed(2)}{los.source === 'formula33' ? '' : `(${translate(los.source === 'legacy' ? 'Legacy' : 'Fall')})`}
              </span>
            )}
          </Popover>
        </span>
      </div>
    )
  }
}

const detailsStateSelector = createSelector(
  [constSelector, basicSelector],
  ({ $ships, $equips }, basic) => ({ $ships, $equips, lv: basic.api_level }),
)

export default connect(detailsStateSelector)(Details)
