package actors

import actors.ChatRoom._
import actors.UserSocket._
import akka.actor.{Actor, ActorRef, Props}
import play.api.libs.json._


/**
  * Created by johan on 26/12/16.
  */
class UserSocket(out: ActorRef, room: ActorRef, uid: String) extends Actor{

  var channel: Option[String] = None

  def receive: PartialFunction[Any, Unit] = {
    case js: JsValue =>
      (js \ "type").as[String] match {
        // subscribe message received from client
        case "subscribe" =>
          (js \ "channel").asOpt[String]
            .foreach { ch =>
              channel = Some(ch)
              room ! Subscribe(ch, self)
              room ! ChannelList
            }
        // Sent message received from client
        case "message" =>
          (js \ "message").asOpt[String]
            .foreach { msg =>
              channel.foreach(ch => room ! Publish(ch, msg, Some(uid)))
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


  def props(out: ActorRef, room: ActorRef, uid: String) = Props(classOf[UserSocket], out, room, uid)
}