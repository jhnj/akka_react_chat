import React from 'react'

class ChannelList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {value: ''}

        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleChange(event) {
        this.setState({value: event.target.value})
    }

    handleSubmit(event) {
        event.preventDefault()
        this.props.subscribe(this.state.value)
        this.setState( { value: '' } )
    }


    render() {

        let notSubscribed = this.props.notSubscribed.map((ns) => {
            return <NotSubscribed name={ns} key={ns} subscribe={this.props.subscribe}/>
        })

        if (notSubscribed.length > 0) {
            notSubscribed = (
                <div className="list-group">
                    <div className="list-group-item active">Not subscribed</div>
                    {notSubscribed}
                </div>
            )
        }


        const subscribed = Object.keys(this.props.subscribed).reduce((chs, name) => {
            const channel = <Subscribed name={name} lastMessage={this.props.subscribed[name].message}
                                        user={this.props.subscribed[name].user} isInFocus={this.props.channelInFocus == name}
                                        focus={this.props.focus} key={name}/>
            if (name != this.props.channelInFocus)
                chs.push(channel)
            else
                chs.unshift(channel)
            return chs
        }, [])


        return (
            <div className="panel panel-primary">
                <div className="panel-heading">
                    <form onSubmit={this.handleSubmit} className="input-group">
                        <input id="btn-input" type="text" className="form-control input-sm" placeholder="New channel"
                               value={this.state.value} onChange={this.handleChange}/>
                        <span className="input-group-btn">
                        <button type="submit" id="btn-chat" className="btn btn-default btn-sm">
                            <span className="glyphicon glyphicon-plus" aria-hidden="true"/>
                        </button>
                        </span>
                    </form>

                </div>
                <div className="main-chat y-scroll panel-body">
                    <div className="list-group">
                        {subscribed}
                    </div>
                    {notSubscribed}
                </div>
            </div>
        )
    }
}

class NotSubscribed extends React.Component {
    constructor(props) {
        super(props)

        // This binding is necessary to make `this` work in the callback
        this.handleClick = this.handleClick.bind(this)
    }

    handleClick(event) {
        this.props.subscribe(this.props.name)
    }

    render() {
        return (
            <li className="list-group-item">
                {this.props.name}
                <button className="btn btn-xs pull-right" onClick={this.handleClick}>Subscribe</button>
            </li>
        )
    }
}

class Subscribed extends React.Component {
    constructor(props) {
        super(props)

        // This binding is necessary to make `this` work in the callback
        this.focus = this.focus.bind(this)
    }



    focus() {
        this.props.focus(this.props.name)
    }

    lastMessage() {
        if (this.props.user) {
            return (
                <div>{this.props.user}: {this.props.lastMessage} </div>
            )
        } else {
            return <div>No messages</div>
        }
    }


    render() {
        return (
            <button type="button" onClick={this.focus}
                    className={(this.props.isInFocus ? "active-chat" : "") + ' list-group-item'}>
                <strong>{this.props.name}</strong><br/>
                {this.lastMessage()}
            </button>
        )
    }
}

export default ChannelList