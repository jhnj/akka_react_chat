
class ChatApp extends React.Component {
    render() {
        const data = {
            messages: [{user: "user1", message: "message1"}, {user: "user2", message: "message2"}]
        };
        const name = "username";
        const channel = "channelname";

        return <div><MessageList data={data.messages}/></div>
    }
}

class MessageList extends React.Component {
    render() {
        const msgNodes = this.props.data.map((msg) => {
            return <ChatMessage user={msg.user} message={msg.message} />
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

const element = (
    <div>
        <h1>Hello, world!</h1>
        <ChatApp />
    </div>
);

ReactDOM.render(
    element,
    document.getElementById('chat-app')
);
