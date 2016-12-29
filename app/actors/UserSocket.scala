package actors

import actors.ChatActor._
import actors.UserSocket._
import akka.actor.{Actor, ActorRef, Props}
import play.api.libs.json._


/**
  * Created by johan on 26/12/16.
  */
class UserSocket(out: ActorRef, chat: ActorRef, uid: String) extends Actor{

  var channel: Option[String] = None
  chat ! NewUser

  def receive: PartialFunction[Any, Unit] = {
    case js: JsValue =>
      (js \ "type").as[String] match {
        // subscribe message received from client
        case "subscribe" =>
          (js \ "channel").asOpt[String]
            .foreach { ch =>
              // Unsubscribe from old channel
              channel.foreach(chat ! UnSubscribe(_, self))
              // Subscribe to new channel
              channel = Some(ch)
              chat ! Subscribe(ch, self)
            }
        // Sent message received from client
        case "message" =>
          (js \ "message").asOpt[String]
            .foreach { msg =>
              channel.foreach(ch => chat ! Publish(ch, msg, Some(uid)))
            }
      }

    case m: ClientMessage =>
      out ! Json.toJson(m)

    case chs: ClientChannels =>
      out ! Json.toJson(chs)

  }
}



object UserSocket {

  case class ClientMessage(message: String, user: String)
  implicit val clientMessageWrites: Writes[ClientMessage] = new Writes[ClientMessage] {
    override def writes(cm: ClientMessage): JsObject = {
      Json.obj(
        "type" -> "message",
        "message" -> cm.message,
        "user" -> cm.user
      )
    }
  }

  case class ClientChannels(channels: Seq[String])
  implicit val clientChannelsWrites: Writes[ClientChannels] = new Writes[ClientChannels] {
    override def writes(chs: ClientChannels): JsObject = {
      Json.obj(
        "type" -> "channels",
        "channels" -> chs.channels.map(ch => JsString(ch))
      )
    }
  }


  def props(out: ActorRef, chat: ActorRef, uid: String) = Props(classOf[UserSocket], out, chat, uid)
}