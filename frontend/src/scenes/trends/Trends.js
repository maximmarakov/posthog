import React from 'react'
import { useActions, useValues } from 'kea'

import { Card, CloseButton, Loading } from 'lib/utils'
import { SaveToDashboard } from 'lib/components/SaveToDashboard'
import { PropertyFilters } from 'lib/components/PropertyFilters/PropertyFilters'
import { DateFilter } from 'lib/components/DateFilter'
import { IntervalFilter } from 'lib/components/IntervalFilter'

import { ActionFilter } from './ActionFilter/ActionFilter'
import { ActionsPie } from './ActionsPie'
import { BreakdownFilter } from './BreakdownFilter'
import { ActionsTable } from './ActionsTable'
import { ActionsLineGraph } from './ActionsLineGraph'
import { ShownAsFilter } from './ShownAsFilter'
import { PeopleModal } from './PeopleModal'
import { Select, Space } from 'antd'
import { trendsLogic } from './trendsLogic'

const displayMap = {
    ActionsLineGraph: 'Line chart',
    ActionsTable: 'Table',
    ActionsPie: 'Pie',
}

export function Trends() {
    const { filters, properties, resultsLoading, showingPeople } = useValues(trendsLogic({ dashboardItemId: null }))
    const { setFilters, setDisplay } = useActions(trendsLogic({ dashboardItemId: null }))
    return (
        <div className="actions-graph">
            {showingPeople ? <PeopleModal /> : null}
            <h1>Action trends</h1>
            <Card>
                <div className="card-body">
                    <h4 className="secondary">{'Actions & Events'}</h4>
                    <ActionFilter></ActionFilter>
                    <hr />
                    <h4 className="secondary">Filters</h4>
                    <PropertyFilters
                        properties={properties}
                        propertyFilters={filters.properties}
                        onChange={properties => setFilters({ properties })}
                        style={{ marginBottom: 0 }}
                    />
                    <hr />
                    <h4 className="secondary">Break down by</h4>
                    <div className="select-with-close">
                        <BreakdownFilter
                            properties={properties}
                            breakdown={filters.breakdown}
                            onChange={breakdown => setFilters({ breakdown })}
                        />
                        {filters.breakdown && (
                            <CloseButton onClick={() => setFilters({ breakdown: false })} style={{ marginTop: 1 }} />
                        )}
                    </div>
                    <hr />
                    <h4 className="secondary">Shown as</h4>
                    <ShownAsFilter shown_as={filters.shown_as} onChange={shown_as => setFilters({ shown_as })} />
                </div>
            </Card>
            <Card
                title={
                    <span>
                        Graph
                        <div className="float-right">
                            <Space>
                                <IntervalFilter setFilters={setFilters} filters={filters} />
                                <Select
                                    defaultValue={displayMap[filters.display || 'ActionsLineGraph']}
                                    value={displayMap[filters.display || 'ActionsLineGraph']}
                                    onChange={v => {
                                        setDisplay(v)
                                    }}
                                    style={{ width: 150 }}
                                >
                                    <Select.Option value="ActionsLineGraph" disabled={filters.breakdown}>
                                        Line chart
                                    </Select.Option>
                                    <Select.Option value="ActionsTable">Table</Select.Option>
                                    <Select.Option value="ActionsPie" disabled={filters.breakdown}>
                                        Pie
                                    </Select.Option>
                                </Select>
                                <DateFilter
                                    onChange={(date_from, date_to) =>
                                        setFilters({
                                            date_from: date_from,
                                            date_to: date_to && date_to,
                                        })
                                    }
                                    dateFrom={filters.date_from}
                                    dateTo={filters.date_to}
                                />
                                <SaveToDashboard filters={filters} type={filters.display || 'ActionsLineGraph'} />
                            </Space>
                        </div>
                    </span>
                }
            >
                <div className="card-body card-body-graph">
                    {filters.actions && (
                        <div
                            style={{
                                minHeight: 'calc(70vh - 50px)',
                                position: 'relative',
                            }}
                        >
                            {resultsLoading && <Loading />}
                            {(!filters.display || filters.display == 'ActionsLineGraph') && <ActionsLineGraph />}
                            {filters.display == 'ActionsTable' && <ActionsTable filters={filters} />}
                            {filters.display == 'ActionsPie' && <ActionsPie filters={filters} />}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}
