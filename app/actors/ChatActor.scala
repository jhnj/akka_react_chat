package actors

import actors.ChatActor._
import actors.UserSocket.{ClientChannels, ClientMessage}
import akka.actor.{Actor, ActorRef, Props, Terminated}

/**
  * Created by johan on 26/12/16.
  */
/**
  * Companion object for ChatRoom containing messages and
  * prop method to create a ChatRoom actor
  */
object ChatActor {
  case object NewUser

  case class Publish(channel: String, message: String, user: Option[String] = None)
  case class Published(publish: Publish)

  case class Subscribe(channel: String, subscriber: ActorRef)
  case class Subscribed(subscribe: Subscribe)
  case class AlreadySubscribed(subscribe: Subscribe)

  case class UnSubscribe(channel: String, subscriber: ActorRef)
  case class UnSubscribed(unSubscribe: UnSubscribe)
  case class NotSubscribed(unSubscribe: UnSubscribe)

  case class GetSubscribers(channel: String)

  def props = Props(new ChatActor)
}

class ChatActor extends Actor {

  private var channels = Map[String, Set[ActorRef]]().withDefaultValue(Set.empty)
  private var users: Set[ActorRef] = Set[ActorRef]()

  def receive: PartialFunction[Any, Unit] = {
    case p @ Publish(channel, message, user) =>
      channels(channel).foreach(c => {
        c ! ClientMessage(message, user.getOrElse("system"), channel)
      })
      sender() ! Published(p)

    case s @ Subscribe(channel, subscriber) if channels(channel).contains(subscriber) =>
      sender() ! AlreadySubscribed(s)

    case s @ Subscribe(channel, subscriber) =>
      if (!channels.contains(channel)) {
        channels += channel -> (channels(channel) + subscriber)
        users.foreach(u => u ! ClientChannels(channels.keys.toSeq))
      } else {
        channels += channel -> (channels(channel) + subscriber)
      }
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
      users -= subscriber
      channels.map {
        case (channel, subscribers) => channel -> (subscribers - subscriber)
      }

    case NewUser =>
      sender() ! ClientChannels(channels.keys.toSeq)
      users += sender()
  }

}
