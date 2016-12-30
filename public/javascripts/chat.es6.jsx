
class ChatApp extends React.Component {
    render() {
        const data = {
            messages: [{user: "user1", message: "message1"}, {user: "user2", message: "message2"}]
        };
        const name = "username";
        const channel = "sub2";
        const notSubscribed = ["not1", "not2"]
        const subscribed = [{name: "sub1", lastMessage: "lmsg1"}, {name: "sub2", lastMessage: "lmsg2"}]

        return (
            <div className="row">
                <div className="col-xs-4">
                    <div><ChannelList notSubscribed={notSubscribed} subscribed={subscribed} focus={channel}/></div>
                </div>
                <div className="col-xs-8">
                    <h3>{channel}</h3>
                    <div><MessageList data={data.messages}/></div>
                    <div><MessageBox /></div>
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
    render() {
        return (
            <div id="footer">
                <input type="text" id="messageField" ref="text" placeholder="Say something" className="form-control" />
                <input type="button" className="btn btn-primary" value="Submit" onClick="" />
            </div>
        )
    }
}

class ChannelList extends React.Component {
    render() {

        const notSubscribed = this.props.notSubscribed.map((ns) => {
            return <NotSubscribed name={ns} key={ns} />
        })

        // List of subscribed channels. Channel in focus first
        const subscribed = this.props.subscribed.reduce((chs, s) => {
            const channel = <Subscribed name={s.name} lastMessage={s.lastMessage} focus={this.props.focus == s.name} key={s.name}/>
            if (s.name != this.props.focus)
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
        return <div><strong>{this.props.name}</strong></div>
    }
}

class Subscribed extends React.Component {
    render() {
        return (
            <div className={this.props.focus ? "focus" : ""}>
                <strong>{this.props.name}</strong><br/>
                {this.props.lastMessage}
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
