
class ChatApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: [{user: "user1", message: "message1"}, {user: "user2", message: "message2"}],
            username: "username",
            channel: null,
            notSubscribed: [],
            subscribed: {sub1: {user: "u1", message: "lmsg1"}, sub2: {user: "u2", message: "lmsg2"}}
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
            console.log(this.socket)
            this.socket.send(JSON.stringify( {type: 'message', channel: this.state.channel, message: message} ))
        }
    }

    handle(message) {
        const actions = {
            'message': (msg) => {
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
            }
        }
        return actions[message.type](message)
    }

    receive(message, channel, user) {
        if (channel === this.state.channel) {
            this.setState({ messages: this.state.messages.concat( {user: user, message: message } )})
        } else {
            const tempSubscribed = this.state.subscribed
            tempSubscribed[channel] = {user: user, message: message}
            this.setState({ subscribed: tempSubscribed})
        }
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
        console.log('unsubbing: ' + channel)
    }

    subscribe(channel) {
        this.socket.send(JSON.stringify( { type: "subscribe", channel: channel} ))
        const newSubscribed = this.state.subscribed
        newSubscribed[channel] = {user: "", message: ""}
        this.setState( {
            notSubscribed: this.state.notSubscribed.filter((ch) => ch !== channel),
            subscribed: newSubscribed
        })
    }

    focus(channel) {
        if (this.state.channel === channel)
            this.setState({channel: ""})
        else
            this.setState({channel: channel})
    }


    render() {

        return (
            <div className="row">
                <div className="col-xs-4">
                    <div><ChannelList notSubscribed={this.state.notSubscribed}
                                      subscribed={this.state.subscribed} channelInFocus={this.state.channel}
                                      subscribe={this.subscribe} focus={this.focus}/></div>
                </div>
                <Chat channel={this.state.channel} unsubscribe={this.unsubscribe}
                      messages={this.state.messages} sendMessage={this.sendMessage} />
            </div>
        )
    }
}

class Chat extends React.Component {
    render() {
        if (this.props.channel) {
            return (
                <div className="col-xs-8">
                    <h3>{this.props.channel}</h3>
                    <button onClick={this.props.unsubscribe}>Unsubscribe</button>
                    <div><MessageList data={this.props.messages}/></div>
                    <div><MessageBox sendMessage={this.props.sendMessage}/></div>
                </div>
            )
        } else {
            return <div>Select a channel</div>
        }

    }
}

class MessageList extends React.Component {
    render() {
        const msgNodes = this.props.data.map((msg, i) => {
            return <ChatMessage user={msg.user} message={msg.message} key={i.toString()}/>
        })
        return <div id="chat">{msgNodes}</div>
    }
}

class ChatMessage extends React.Component {
    render() {
        return (
            <div className="">
                <strong>{this.props.user}: </strong>
                {this.props.message}
            </div>
        )
    }
}

class MessageBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: ''};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.sendMessage(this.state.value);
        this.setState( { value: '' } )
    }

    render() {

        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    Name:
                    <input type="text" value={this.state.value} onChange={this.handleChange} />
                </label>
                <input type="submit" value="Submit" />
            </form>
        );
    }
}

class ChannelList extends React.Component {

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
        return <div id="channels">{subscribed}{notSubscribed}</div>
    }
}

class NotSubscribed extends React.Component {
    constructor(props) {
        super(props);

        // This binding is necessary to make `this` work in the callback
        this.handleClick = this.handleClick.bind(this);
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
        super(props);

        // This binding is necessary to make `this` work in the callback
        this.focus = this.focus.bind(this);
    }



    focus() {
        this.props.focus(this.props.name)
        console.log("focus")
    }

    render() {
        return (
            <div onClick={this.focus} className={(this.props.isInFocus ? "focus" : "") + ' panel panel-default'}>
                <strong>{this.props.name}</strong><br/>
                {this.props.user}: {this.props.lastMessage}
            </div>
        )
    }
}

const element = (
    <div className="container">
        <h1 className="text-center">Chat app</h1>
        <ChatApp />
    </div>
);

ReactDOM.render(
    element,
    document.getElementById('chat-app')
);
