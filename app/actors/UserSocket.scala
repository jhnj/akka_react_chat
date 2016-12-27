package actors

import actors.ChatRoom._
import akka.actor.{Actor, ActorRef, Props}
import play.api.libs.json.{JsString, JsValue, Json}

/**
  * Created by johan on 26/12/16.
  */
class UserSocket(out: ActorRef, room: ActorRef) extends Actor{

  // subscribe to the default channel on creation
  room ! Subscribe("default", self)

  def receive: PartialFunction[Any, Unit] = {
    case js: JsValue =>
      js.validate[Message]
        .map(msg => {
          room ! Publish(msg.channel, msg.message, Some(msg.user))
        })

    case m: Message =>
      out ! Json.toJson(m)

  }
}



object UserSocket {
  def props(out: ActorRef, room: ActorRef) = Props(classOf[UserSocket], out, room)
}