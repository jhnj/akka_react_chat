
class ChatApp extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            messages: [],
            username: null,
            channel: null,
            notSubscribed: [],
            subscribed: {}
        }

        this.handle = this.handle.bind(this)
        this.unsubscribe = this.unsubscribe.bind(this)
        this.subscribe = this.subscribe.bind(this)
        this.receive = this.receive.bind(this)
        this.focus = this.focus.bind(this)
    }

    componentDidMount() {
        const wsUrl = $('body').data('websocket_url')
        this.socket = new WebSocket(wsUrl)
        this.socket.onmessage = (event) => {
            console.log(event)
            const msg = JSON.parse(event.data)
            this.handle(msg)
        }
        this.sendMessage = (message) => {
            this.socket.send(JSON.stringify( {type: 'message', channel: this.state.channel, message: message} ))
        }
    }

    handle(message) {
        const actions = {
            'message': (msg) => {
                if (msg.message && msg.channel && msg.user)
                    this.receive(msg.message, msg.channel, msg.user)
            },
            'channels': (msg) => {
                console.log(JSON.stringify(msg))
                this.setState({ notSubscribed: msg.notSubscribed })
                const subscribed = {}
                msg.subscribed.forEach((ch) => {
                    subscribed[ch] =  this.state.subscribed[ch] || ''
                })
                this.setState({ subscribed: subscribed })
            },
            'username': (msg) => {
                if (msg.username)
                    this.setState( { username: msg.username } )
            }
        }
        return actions[message.type](message)
    }

    receive(message, channel, sender) {
        console.log(sender + ' and user: ' + this.state.username)
        const user = this.state.username === sender ? "you" : sender
        if (channel === this.state.channel) {
            this.setState({messages: this.state.messages.concat({user: user, message: message})})
        }
        const tempSubscribed = this.state.subscribed
        tempSubscribed[channel] = {user: user, message: message}
        this.setState({subscribed: tempSubscribed})

    }

    unsubscribe() {
        const channel = this.state.channel
        this.socket.send( JSON.stringify( { type: "unsubscribe", channel: channel } ))
        this.setState( { channel: null } )
        const newSubscribed = this.state.subscribed
        delete newSubscribed[channel]
        this.setState( {
            notSubscribed: this.state.notSubscribed.concat(channel),
            subscribed: newSubscribed,
            channel: null
        })
    }

    subscribe(channel) {
        this.socket.send(JSON.stringify( { type: "subscribe", channel: channel} ))
        const newSubscribed = this.state.subscribed
        newSubscribed[channel] = {user: null, message: ""}
        this.setState( {
            notSubscribed: this.state.notSubscribed.filter((ch) => ch !== channel),
            subscribed: newSubscribed
        })
    }

    focus(channel) {
        if (this.state.channel === channel)
            this.setState( { channel: null } )
        else
            this.setState( { channel: channel } )
        // Empty messages when changing channel
        this.setState( { messages: []} )
    }


    render() {

        return (
            <div className="row">
                <div className="col-xs-4">
                    <div><ChannelList notSubscribed={this.state.notSubscribed}
                                      subscribed={this.state.subscribed} channelInFocus={this.state.channel}
                                      subscribe={this.subscribe} focus={this.focus}/></div>
                </div>
                <div className="col-xs-8">
                    <Chat channel={this.state.channel} unsubscribe={this.unsubscribe}
                          messages={this.state.messages} sendMessage={this.sendMessage}/>
                </div>
            </div>
        )
    }
}

class Chat extends React.Component {
    render() {
        if (this.props.channel) {
            return (
                <div className="panel panel-primary">
                    <div className="panel-heading">
                        {this.props.channel}
                        <button className="btn pull-right btn-default btn-xs" onClick={this.props.unsubscribe}>
                            Unsubscribe
                        </button>

                    </div>
                    <div className="panel-body y-scroll">
                        <MessageList data={this.props.messages}/>
                    </div>
                    <div className="panel-footer">
                        <MessageBox sendMessage={this.props.sendMessage}/>
                    </div>
                </div>
            )
        } else {
            return (
                <div className="panel panel-primary">
                    <div className="panel-heading">
                        Select a channel
                    </div>
                    <div className="panel-body">
                    </div>
                    <div className="panel-footer">

                    </div>
                </div>
            )
        }

    }
}

class MessageList extends React.Component {
    render() {
        const msgNodes = this.props.data.map((msg, i) => {
            return (
                <li className="right clearfix" key={i.toString()}>
                    <ChatMessage user={msg.user} message={msg.message} />
                </li>
            )
        })
        return (
            <ul className="message-list">
                {msgNodes}
            </ul>
        )
    }
}

class ChatMessage extends React.Component {
    render() {
        return (
            <div className="chat-body clearfix">
                <div className="header">
                    <strong className="primary-font">{this.props.user}</strong>
                    {/*<small className="text-muted pull-right">*/}
                        {/*<span className="glyphicon glyphicon-time"/>12 mins ago*/}
                    {/*</small>*/}
                </div>
                <p>
                    {this.props.message}
                </p>
            </div>
        )
    }
}

class MessageBox extends React.Component {
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
        this.props.sendMessage(this.state.value)
        this.setState( { value: '' } )
    }

    render() {

        return (

        <form onSubmit={this.handleSubmit} className="input-group">
            <input id="btn-input" type="text" className="form-control input-sm" placeholder="Type your message here..."
                   value={this.state.value} onChange={this.handleChange}/>
            <span className="input-group-btn">
            <button className="btn btn-warning btn-sm" id="btn-chat" type="submit">
              Send</button>
          </span>
        </form>
        )
    }
}

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

        const notSubscribed = this.props.notSubscribed.map((ns) => {
            return <NotSubscribed name={ns} key={ns} subscribe={this.props.subscribe}/>
        })


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
                <div className="panel-body y-scroll">
                    {subscribed}{notSubscribed}
                </div>
                <div className="panel-footer">
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
        return <div className="panel panel-default">
            {this.props.name}
            <button onClick={this.handleClick}>Subscribe</button>
        </div>
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


    render() {
        const lastMessage = <div>{this.props.user}: {this.props.lastMessage} </div>

        return (
            <div onClick={this.focus} className={(this.props.isInFocus ? "focus" : "") + ' panel panel-default'}>
                <strong>{this.props.name}</strong><br/>
                {this.props.user && lastMessage}
            </div>
        )
    }
}

const element = (
    <div className="container">
        <h1 className="text-center">Chat app</h1>
        <ChatApp />
    </div>
)

ReactDOM.render(
    element,
    document.getElementById('chat-app')
)
