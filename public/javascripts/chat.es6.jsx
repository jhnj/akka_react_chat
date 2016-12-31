
class ChatApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: [{user: "user1", message: "message1"}, {user: "user2", message: "message2"}],
            username: "username",
            channel: "sub2",
            notSubscribed: [],
            subscribed: {sub1: {user: "u1", message: "lmsg1"}, sub2: {user: "u2", message: "lmsg2"}}
        }
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


    render() {

        return (
            <div className="row">
                <div className="col-xs-4">
                    <div><ChannelList notSubscribed={this.state.notSubscribed}
                                      subscribed={this.state.subscribed} focus={this.state.channel}/></div>
                </div>
                <div className="col-xs-8">
                    <h3>{this.state.channel}</h3>
                    <div><MessageList data={this.state.messages}/></div>
                    <div><MessageBox sendMessage={this.sendMessage}/></div>
                </div>
            </div>
        )
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
            return <NotSubscribed name={ns} key={ns} />
        })


        const subscribed = Object.keys(this.props.subscribed).reduce((chs, name) => {
                const channel = <Subscribed name={name} lastMessage={this.props.subscribed[name].message}
                                            user={this.props.subscribed[name].user} focus={this.props.focus == name} key={name}/>
                if (name != this.props.focus)
                    chs.push(channel)
                else
                    chs.unshift(channel)
                return chs
            }, [])
        return <div id="channels">{subscribed}{notSubscribed}</div>
    }
}

class NotSubscribed extends React.Component {
    render() {
        return <div className="panel panel-default">{this.props.name}</div>
    }
}

class Subscribed extends React.Component {
    render() {
        return (
            <div className={(this.props.focus ? "focus" : "") + ' panel panel-default'}>
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
