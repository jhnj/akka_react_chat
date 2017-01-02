package actors

import actors.ChatActor._
import actors.UserSocket.{ClientChannels, ClientMessage}
import akka.actor.{Actor, ActorLogging, ActorRef, Props, Terminated}

/**
  * Created by johan on 26/12/16.
  */
/**
  * Companion object for ChatRoom containing messages and
  * prop method to create a ChatRoom actor
  */
object ChatActor {
  case class NewUser(uid: String)

  case class Publish(channel: String, message: String, user: Option[String] = None)
  case class Published(publish: Publish)

  case class Subscribe(channel: String, subscriber: String)
  case class Subscribed(subscribe: Subscribe)
  case class AlreadySubscribed(subscribe: Subscribe)

  case class UnSubscribe(channel: String, subscriber: String)
  case class UnSubscribed(unSubscribe: UnSubscribe)
  case class NotSubscribed(unSubscribe: UnSubscribe)

  case class GetSubscribers(channel: String)
  case class ChannelList(channels: Seq[String])
  case class SubscribedChannels(channels: Seq[String])

  case class Disconnected(uid: String)

  def props = Props(new ChatActor)
}

class ChatActor extends Actor with ActorLogging {

  private var channels = Map[String, Set[String]]().withDefaultValue(Set.empty)
  private var users: Map[String, ActorRef] = Map()

  def receive: PartialFunction[Any, Unit] = {
    case p @ Publish(channel, message, user) =>
      channels(channel).foreach(c => {
        users.get(c).foreach(_ ! ClientMessage(message, user.getOrElse("system"), channel))
      })
      sender() ! Published(p)

    case s @ Subscribe(channel, subscriber) if channels(channel).contains(subscriber) =>
      sender() ! AlreadySubscribed(s)

    case s @ Subscribe(channel, subscriber) =>
      if (!channels.contains(channel)) {
        channels += channel -> (channels(channel) + subscriber)
        users.values.foreach(u => u ! ChannelList(channels.keys.toSeq))
      } else {
        channels += channel -> (channels(channel) + subscriber)
      }
      sender() ! Subscribed(s)

    case us @ UnSubscribe(channel, subscriber) if !channels(channel).contains(subscriber) =>
      sender() ! NotSubscribed

    case us @ UnSubscribe(channel, subscriber) =>
      channels += channel -> (channels(channel) - subscriber)
      sender() ! UnSubscribed

    case  GetSubscribers(channel) =>
      sender() ! channels(channel)

    case Disconnected(uid) =>
      users = users - uid

    case NewUser(uid) =>
      val subscribedChannels = channels.keys.foldLeft[Seq[String]](Seq())((subscribed, ch) => {
        if (channels(ch).contains(uid)) {
          subscribed :+ ch
        } else subscribed
      })
      sender() ! SubscribedChannels(subscribedChannels)
      sender() ! ChannelList(channels.keys.toSeq)
      users += uid -> sender()
  }

}
