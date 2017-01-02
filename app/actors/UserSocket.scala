package actors

import actors.ChatActor._
import actors.UserSocket._
import akka.actor.{Actor, ActorRef, Props}
import play.api.libs.json._


/**
  * Created by johan on 26/12/16.
  */
class UserSocket(out: ActorRef, chat: ActorRef, uid: String) extends Actor{


  var channels: Set[String] = Set()
  chat ! NewUser(uid)

  def receive: PartialFunction[Any, Unit] = {
    case js: JsValue =>
      (js \ "type").as[String] match {
        // subscribe message received from client
        case "subscribe" =>
          (js \ "channel").asOpt[String]
            .foreach { ch =>
              // Subscribe to new channel
              channels += ch
              chat ! Subscribe(ch, uid)
            }

        case "unsubscribe" =>
          (js \ "channel").asOpt[String]
            .foreach { ch =>
              channels -= ch
              chat ! UnSubscribe(ch, uid)
            }
        // Sent message received from client
        case "message" =>
          (js \ "message").asOpt[String]
            .foreach { msg =>
              (js \ "channel").asOpt[String].foreach(ch => chat ! Publish(ch, msg, Some(uid)))
            }
      }

    case m: ClientMessage =>
      out ! Json.toJson(m)

    case chs: ChannelList =>
      val notSubscribed = chs.channels.filter(!this.channels.contains(_))
      out ! Json.toJson(ClientChannels(channels, notSubscribed))

    case subCh: SubscribedChannels =>
      channels = subCh.channels.toSet
  }

  override def postStop(): Unit = chat ! Disconnected(uid)
}



object UserSocket {

  case class ClientMessage(message: String, user: String, channel: String)
  implicit val clientMessageWrites: Writes[ClientMessage] = new Writes[ClientMessage] {
    override def writes(cm: ClientMessage): JsObject = {
      Json.obj(
        "type" -> "message",
        "message" -> cm.message,
        "user" -> cm.user,
        "channel" -> cm.channel
      )
    }
  }

  case class ClientChannels(subscribed: Set[String], notSubscribed: Seq[String])
  implicit val clientChannelsWrites: Writes[ClientChannels] = new Writes[ClientChannels] {
    override def writes(chs: ClientChannels): JsObject = {
      Json.obj(
        "type" -> "channels",
        "subscribed" -> chs.subscribed.map(JsString),
        "notSubscribed" -> chs.notSubscribed.map(JsString)
      )
    }
  }


  def props(out: ActorRef, chat: ActorRef, uid: String) = Props(classOf[UserSocket], out, chat, uid)
}