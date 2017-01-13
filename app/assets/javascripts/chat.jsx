import React from 'react'

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
                    <div className="main-chat y-scroll panel-body">
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
                    <div className="main-chat panel-body">
                    </div>
                </div>
            )
        }

    }
}

export default Chat