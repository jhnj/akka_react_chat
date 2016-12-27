package actors

import actors.ChatRoom._
import akka.actor.{Actor, ActorRef, Props, Terminated}

/**
  * Created by johan on 26/12/16.
  */
/**
  * Companion object for ChatRoom containing messages and
  * prop method to create a ChatRoom actor
  */
object ChatRoom {
  case class Publish(channel: String, message: String, user: Option[String] = None)
  case class Published(publish: Publish)

  case class Subscribe(channel: String, subscriber: ActorRef)
  case class Subscribed(subscribe: Subscribe)
  case class AlreadySubscribed(subscribe: Subscribe)

  case class UnSubscribe(channel: String, subscriber: ActorRef)
  case class UnSubscribed(unSubscribe: UnSubscribe)
  case class NotSubscribed(unSubscribe: UnSubscribe)

  case class GetSubscribers(channel: String)

  def props = Props(new ChatRoom)
}

class ChatRoom extends Actor {

  private var channels = Map[String, Set[ActorRef]]().withDefaultValue(Set.empty)

  def receive: PartialFunction[Any, Unit] = {
    case p @ Publish(channel, message, user) =>
      channels(channel).foreach(c => {
        c ! new Message(channel, user.getOrElse("system"), message)
      })
      sender() ! Published(p)

    case s @ Subscribe(channel, subscriber) if channels(channel).contains(subscriber) =>
      sender() ! AlreadySubscribed(s)

    case s @ Subscribe(channel, subscriber) =>
      channels += channel -> (channels(channel) + subscriber)
      context.watch(subscriber)
      sender() ! Subscribed(s)

    case us @ UnSubscribe(channel, subscriber) if !channels(channel).contains(subscriber) =>
      sender() ! NotSubscribed

    case us @ UnSubscribe(channel, subscriber) =>
      channels += channel -> (channels(channel) - subscriber)
      sender() ! UnSubscribed

    case  GetSubscribers(channel) =>
      sender() ! channels(channel)

    case Terminated(subscriber) =>
      channels.map {
        case (channel, subscribers) => channel -> (subscribers - subscriber)
      }
  }

}
