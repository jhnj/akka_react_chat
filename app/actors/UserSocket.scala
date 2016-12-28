package actors

import actors.ChatRoom._
import actors.UserSocket._
import akka.actor.{Actor, ActorRef, Props}
import play.api.libs.json.{JsString, JsValue, Json, Writes}
import play.api.libs.functional.syntax._


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

  }
}



object UserSocket {
  case class ClientMessage(message: String, user: String)
  implicit val clientMessageWrites: Writes[ClientMessage] = Json.writes[ClientMessage]

  def props(out: ActorRef, room: ActorRef, uid: String) = Props(classOf[UserSocket], out, room, uid)
}