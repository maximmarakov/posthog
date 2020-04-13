import React, { Component } from 'react'
import { Card, uuid, Loading, groupActions } from '../../lib/utils'
import api from '../../lib/api'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { actionsModel } from '../../models/actionsModel'
import { useValues, useActions } from 'kea'
import { funnelLogic } from './funnelLogic'
import { ActionFilter } from 'scenes/trends/ActionFilter/ActionFilter'

export function EditFunnel({ funnelId, onChange }) {
    const { funnel, funnelLoading } = useValues(funnelLogic({ id: funnelId }))
    const { setFunnel, funnelUpdateRequest } = useActions(funnelLogic({ id: funnelId }))
    const { actions, actionsLoading } = useValues(actionsModel())
    return (
        <form
            onSubmit={e => {
                e.preventDefault()
                funnelUpdateRequest(funnel, () => {
                    toast('Funnel saved!')
                })
            }}
        >
            <Card>
                {funnel.filters ? (
                    <div className="card-body">
                        <input
                            required
                            placeholder="User drop off through signup"
                            type="text"
                            autoFocus
                            onChange={e => setFunnel({ name: e.target.value })}
                            value={funnel.name}
                            className="form-control"
                        />
                        {!actionsLoading && actions.length == 0 && (
                            <div className="alert alert-warning" style={{ marginTop: '1rem' }}>
                                You don't have any actions set up.{' '}
                                <Link to="/actions">Click here to set up an action</Link>
                            </div>
                        )}
                        <br />
                        <ActionFilter setFilters={filters => setFunnel({ filters })} defaultFilters={funnel.filters} />
                        <br />
                        <button className="btn btn-success btn-sm" type="submit">
                            Save funnel
                        </button>
                    </div>
                ) : (
                    <Loading />
                )}
            </Card>
        </form>
    )
}
