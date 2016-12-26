package actors

import akka.actor.Actor
/**
  * Created by johan on 26/12/16.
  */
class ChatRoom extends Actor {
  def receive: PartialFunction[Any, Unit] = {
    case _ => println("chatroom")
  }

}
