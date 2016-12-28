package controllers

import actors.{ChatRoom, Message, UserSocket}
import akka.actor.{ActorRef, ActorSystem, Props}
import akka.stream.Materializer
import com.google.inject.{Inject, Singleton}
import play.api.data._
import play.api.data.Forms._
import play.api.libs.json.JsValue
import play.api.libs.streams.ActorFlow
import play.api.mvc._

import scala.concurrent.Future


@Singleton
class Application @Inject()(webJarAssets: WebJarAssets, system: ActorSystem, materializer: Materializer) extends Controller {

  implicit val implicitSystem: ActorSystem = system
  implicit val implicitMaterializer: Materializer = materializer

  val chatRoomActor: ActorRef = system.actorOf(Props[ChatRoom], "chatroom")

  val nameForm = Form(
    single(
      "userName" -> text
    )
  )

  def userName = Action { implicit req =>
    nameForm.bindFromRequest.fold(
      formWithErrors => {
        BadRequest(views.html.login(nameForm)(webJarAssets))
      },
      userName => {
        Redirect(routes.Application.index())
          .withSession(req.session + ("userName" -> userName))
      }
    )
  }


  def login = Action { implicit req =>
    Ok(views.html.login(nameForm)(webJarAssets))
  }

  def logout = Action { implicit req =>
    Redirect(routes.Application.login()).withNewSession
  }



  def index: Action[AnyContent] = Action { implicit req =>
    req.session.get("userName").map ( user =>
      Ok(views.html.chat(webJarAssets)(user))
    ).getOrElse(Redirect(routes.Application.login()))
  }

  def socket: WebSocket = WebSocket.acceptOrResult[JsValue, JsValue] { implicit request =>
    Future.successful(request.session.get("userName") match {
      case None => Left(Forbidden)
      case Some(user) =>
        Right(ActorFlow.actorRef(out => UserSocket.props(out, chatRoomActor, user)))
    })

  }

}
