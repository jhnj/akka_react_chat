package controllers

import java.io.FileReader
import javax.script.ScriptEngineManager

import actors.{ChatActor, UserSocket}
import akka.actor.{ActorRef, ActorSystem, Props}
import akka.stream.Materializer
import com.google.inject.{Inject, Singleton}
import jdk.nashorn.api.scripting.NashornScriptEngine
import play.api.Environment
import play.api.data._
import play.api.data.Forms._
import play.api.libs.json.JsValue
import play.api.libs.streams.ActorFlow
import play.api.mvc._
import play.twirl.api.Html

import scala.concurrent.Future


@Singleton
class Application @Inject()(webJarAssets: WebJarAssets, system: ActorSystem, materializer: Materializer,
                            environment: Environment) extends Controller {

  implicit val implicitSystem: ActorSystem = system
  implicit val implicitMaterializer: Materializer = materializer

  val chatActor: ActorRef = system.actorOf(Props[ChatActor], "chatActor")

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
    req.session.get("userName").map { user =>

      val engine: NashornScriptEngine = new ScriptEngineManager().getEngineByName("nashorn").asInstanceOf[NashornScriptEngine]

      if (engine == null) {
        BadRequest("Nashorn script engine not found. JDK 8 required")
      } else {
        // React expects `window` or `global` to exist. Create a `global` pointing
        // to Nashorn's context to give React a place to define its global
        // namespace.
        engine.eval("var global = this;")

        // Define `console.log`, etc. to send messages to Nashorn's global `print`
        // function so the messages are written to standard out.
        engine.eval("var console = {error: print, log: print, warn: print};")

        // Evaluate the application code
        engine.eval(new FileReader(environment.getFile("public/javascripts/bundle.js")))

        Ok(views.html.react_chat(webJarAssets)(Html(engine.eval("ChatApp.renderServer()").toString)))
      }
    }.getOrElse(Redirect(routes.Application.login()))
  }

  def socket: WebSocket = WebSocket.acceptOrResult[JsValue, JsValue] { implicit request =>
    Future.successful(request.session.get("userName") match {
      case None => Left(Forbidden)
      case Some(user) =>
        Right(ActorFlow.actorRef(out => UserSocket.props(out, chatActor, user)))
    })

  }


}
