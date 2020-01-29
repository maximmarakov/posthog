import React, { Component } from 'react'
import api from './Api';
import { uuid, percentage } from './utils';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

export class EditFunnel extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
            actions: [],
            steps: [{id: uuid(), order: 0}],
            id: this.props.match.params.id,
        }
        this.Step = this.Step.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.fetchActions.call(this);
        if(props.match.params.id) this.fetchFunnel.call(this);
    }
    fetchFunnel() {
        api.get('api/funnel/' + this.props.match.params.id).then((funnel) => this.setState({steps: funnel.steps, name: funnel.name}))
    }
    fetchActions() {
        api.get('api/action').then((actions) => this.setState({actions: actions.results}))
    }
    Step(step) {
        return <div className='card' style={{maxWidth: '20%'}}>
            <div className='card-body'>
                <h2 className='card-title' style={{textAlign: 'center'}}>{step.order + 1}</h2>
                <select
                    required
                    onChange={(e) => {
                        this.setState({steps: this.state.steps.map(
                            (s) => s.id == step.id ? {...step, action_id: e.target.value} : s
                        )})
                    }}
                    value={step.action_id}
                    className='form-control'>
                    <option value=''>Select action</option>
                    {this.state.actions && this.state.actions.map((action) => <option
                        key={action.id}
                        value={action.id}
                        >{action.name}</option>)}
                </select>
                {step.action_id && <a target='_blank' href={'/action/' + step.action_id}>Edit action</a>}
            </div>
        </div>
    }
    onSubmit(event) {
        event.preventDefault();
        let save = () => setTimeout(() => this.setState({saved: true}), 500);
        let data = {
            name: this.state.name,
            id: this.state.id,
            steps: this.state.steps
        }
        if(this.state.id) {
            return api.update('api/funnel/' + this.state.id, data).then(save)
        }
        api.create('api/funnel', data).then((funnel) => this.props.history.push('/funnel/' + funnel.id))
    }
    render() {
        return <form onSubmit={this.onSubmit}>
            {!this.props.match.params.id ? <h1>New funnel</h1> : this.state.name && <h1>Edit funnel: {this.state.name}</h1>}
            <label>Name</label>
            <input required placeholder='User drop off through signup' type='text' onChange={(e) => this.setState({name: e.target.value})} value={this.state.name} className='form-control' />
            <br /><br />
            <label>Steps</label>
            <div className='card-deck'>
                {this.state.steps.map((step) => <this.Step key={step.id} {...step} />)}
                <div
                    className='card cursor-pointer'
                    onClick={() => this.setState({steps: [...this.state.steps, {id: uuid(), order: this.state.steps.length}]})}
                    style={{maxWidth: '20%'}}>
                    <span style={{fontSize: 75, textAlign: 'center', lineHeight: 1}} className='text-success'>+</span>
                </div>
            </div>
            <br /><br />
            <button className='btn btn-success'>Save funnel</button><br /><br />
            {this.state.saved && <p className='text-success'>Funnel saved. <Link to={'/funnel/' + this.state.id}>Click here to go back to the funnel.</Link></p>}
        </form>
    }
}

EditFunnel.propTypes = {
    history: PropTypes.object,
    funnel: PropTypes.object
}


export default class Funnel extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
        }
        this.fetchFunnel.call(this);
        this.sortPeople = this.sortPeople.bind(this);
    }
    sortPeople(people) {
        let score = (person) => {
            return this.state.funnel.steps.reduce((val, step) => 
                step.people.indexOf(person.id) > -1 ? val + 1 : val
            , 0)
        }
        people.sort((a, b) => score(b) - score(a))
        return people
    }
    fetchFunnel() {
        api.get('api/funnel/' + this.props.match.params.id).then((funnel) => {
            this.setState({funnel})
            api.get('api/person/?id=' + funnel.steps[0].people.join(','))
                .then((people) => this.setState({people: this.sortPeople(people.results)}))
        })
    }
    render() {
        return this.state.funnel ? (
            <div className='funnel'>
                <Link to={'/funnel/' + this.state.funnel.id + '/edit'} className='btn btn-outline-success float-right'><i className='fi flaticon-edit' /> Edit funnel</Link>
                <h1>Funnel: {this.state.funnel.name}</h1>
                <table className='table table-bordered table-fixed'>
                    <tbody>
                        <tr>
                            <td></td>
                            {this.state.funnel.steps.map((step) => <th key={step.id}>
                                <Link to={'/action/' + step.action_id}>{step.name}</Link>
                            </th>)}</tr>
                        <tr>
                            <td></td>
                            {this.state.funnel.steps.map((step) => <td key={step.id}>
                                {step.count}&nbsp;
                                ({percentage(step.count/this.state.funnel.steps[0].count)})
                            </td>)}
                        </tr>
                        {this.state.people && this.state.people.map((person) => <tr key={person.id}>
                            <td><Link to={'/person/' + person.id}>{person.name}</Link></td>
                            {this.state.funnel.steps.map((step) => <td
                                key={step.id}
                                className={step.people.indexOf(person.id) > -1 ? 'funnel-success' : 'funnel-dropped'}
                                ></td>)}
                        </tr>)}
                    </tbody>
                </table>
            </div>
        ) : null;
    }
}