package actors

import akka.actor.{Actor, ActorRef, Props}
import play.api.libs.json.{JsString, JsValue, Json}

/**
  * Created by johan on 26/12/16.
  */
class UserSocket(out: ActorRef, room: ActorRef) extends Actor{
  def receive: PartialFunction[Any, Unit] = {
    case js: JsValue =>
      js.validate[Message]
        .map(msg => {
          println(msg.text)
          out ! Json.toJson(msg)
        })

    case _ =>
      println("usersocket")
      out ! "testing"
  }
}



object UserSocket {
  def props(out: ActorRef, room: ActorRef) = Props(classOf[UserSocket], out, room)
}