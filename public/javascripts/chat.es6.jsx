
class ChatApp extends React.Component {
    render() {
        const data = {
            messages: [{user: "user1", message: "message1"}, {user: "user2", message: "message2"}]
        };
        const name = "username";
        const channel = "channelname";
        const notSubscribed = ["not1", "not2"]
        const subscribed = [{name: "sub1", lastMessage: "lmsg1"}, {name: "sub2", lastMessage: "lmsg2"}]

        return (
            <div className="row">
                <div className="col-md-4">
                    <div><ChannelList notSubscribed={notSubscribed} subscribed={subscribed}/></div>
                </div>
                <div className="col-md-8">
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
        const subscribed = this.props.subscribed.map((s) => {
            return <Subscribed name={s.name} lastMessage={s.lastMessage}/>
        })
        return <div id="channels">{notSubscribed}{subscribed}</div>
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
            <div>
                <strong>{this.props.name}</strong><br/>
                {this.props.lastMessage}
            </div>
        )
    }
}

const element = (
    <div className="container">
        <h1>Hello, world!</h1>
        <ChatApp />
    </div>
);

ReactDOM.render(
    element,
    document.getElementById('chat-app')
);
