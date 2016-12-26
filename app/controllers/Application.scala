package controllers

import actors.{ChatRoom, Message, UserSocket}
import akka.actor.{ActorRef, ActorSystem, Props}
import akka.stream.Materializer
import com.google.inject.{Inject, Singleton}
import play.api.libs.json.JsValue
import play.api.libs.streams.ActorFlow
import play.api.mvc._


@Singleton
class Application @Inject()(webJarAssets: WebJarAssets, system: ActorSystem, materializer: Materializer) extends Controller {

  implicit val implicitSystem: ActorSystem = system
  implicit val implicitMaterializer: Materializer = materializer

  val chatRoomActor: ActorRef = system.actorOf(Props[ChatRoom], "chatroom")

  def index: Action[AnyContent] = Action { implicit req =>
    Ok(views.html.index(webJarAssets))
  }

  def socket: WebSocket = WebSocket.accept[JsValue, JsValue] { implicit request =>
    ActorFlow.actorRef(out => UserSocket.props(out, chatRoomActor))
  }

}
