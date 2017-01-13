import React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server'
import ChannelList from './channelList.jsx'
import Chat from './chat.jsx'

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
        const wsUrl = 'ws://' + window.location.host + '/socket'
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
                    <ChannelList notSubscribed={this.state.notSubscribed}
                                 subscribed={this.state.subscribed} channelInFocus={this.state.channel}
                                 subscribe={this.subscribe} focus={this.focus}/>
                </div>

                <div className="col-xs-8">
                    <Chat channel={this.state.channel} unsubscribe={this.unsubscribe}
                          messages={this.state.messages} sendMessage={this.sendMessage}/>
                </div>
            </div>
        )
    }
}


const element = (
    <div className="container">
        <div className="main-header header clearfix">
                <nav>
                    <ul className="nav nav-pills pull-right">
                        <li role="presentation"><a href="/logout" className="btn btn-default">logout</a></li>
                    </ul>
                </nav>
                <h2 className="text-muted">Chat app</h2>
        </div>
        <ChatApp />
    </div>
)


function renderServer() {
    return ReactDOMServer.renderToString(element)
}

function renderClient(location) {
    return ReactDOM.render(
        element,
        location
    )
}

module.exports = {
    renderClient: renderClient,
    renderServer: renderServer
}
