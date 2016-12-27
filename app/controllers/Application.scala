package controllers

import actors.{ChatRoom, Message, UserSocket}
import akka.actor.{ActorRef, ActorSystem, Props}
import akka.stream.Materializer
import com.google.inject.{Inject, Singleton}
import play.api.libs.json.JsValue
import play.api.libs.streams.ActorFlow
import play.api.mvc._

import scala.concurrent.Future


@Singleton
class Application @Inject()(webJarAssets: WebJarAssets, system: ActorSystem, materializer: Materializer) extends Controller {

  implicit val implicitSystem: ActorSystem = system
  implicit val implicitMaterializer: Materializer = materializer

  val chatRoomActor: ActorRef = system.actorOf(Props[ChatRoom], "chatroom")

  var userID = 0
  def login = Action { req =>
    userID += 1
    Redirect(routes.Application.index()).withSession(req.session + ("user" -> s"default$userID"))
  }

  def index: Action[AnyContent] = Action { implicit req =>
    Ok(views.html.index(webJarAssets))
  }

  def socket: WebSocket = WebSocket.acceptOrResult[JsValue, JsValue] { implicit request =>
    Future.successful(request.session.get("user") match {
      case None => Left(Forbidden)
      case Some(user) =>
        Right(ActorFlow.actorRef(out => UserSocket.props(out, chatRoomActor, user)))
    })

  }

}
